import { Injectable } from '@nestjs/common';
import {
  StatusPengirimanNotifikasiWhatsApp,
  type WagoWebhookEvent,
} from '../../../../generated/prisma';
import { NotificationDeliveryRepository } from '../deliveries/notification-delivery.repository';
import type { NotificationDeliveryRecord } from '../deliveries/notification-delivery.types';
import { isReminderStillEligible } from '../reminder-eligibility.util';
import { NotificationReminderRepository } from '../notification-reminder.repository';
import { WagoWebhookRepository } from './wago-webhook.repository';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';

const GENERIC_REJECTION_RETRY_DELAY_MS = 5 * 60_000;

type WebhookProcessingInput = Readonly<{
  webhookId: string;
  transportMessageId: string;
  status: 'accepted' | 'rejected';
  errorCode: string | null;
  receivedAt: Date;
}>;

export type WagoWebhookIngestResult = 'processed' | 'stored-unmatched' | 'duplicate';

@Injectable()
export class WagoWebhookService {
  constructor(
    private readonly inbox: WagoWebhookRepository,
    private readonly deliveries: NotificationDeliveryRepository,
    private readonly reminders: NotificationReminderRepository,
  ) {}

  async ingest(event: TrustedWagoWebhookEvent, receivedAt: Date): Promise<WagoWebhookIngestResult> {
    const inserted = await this.inbox.insertIfNew(event, receivedAt);
    if (inserted === 'duplicate') return 'duplicate';

    const delivery = await this.deliveries.findByTransportMessageId(event.data.messageId);
    if (delivery === null) return 'stored-unmatched';

    await this.processMatched(this.fromTrustedEvent(event, receivedAt), delivery, receivedAt);
    return 'processed';
  }

  async reconcileTransportMessage(
    transportMessageId: string,
    processedAt = new Date(),
  ): Promise<void> {
    const events = await this.inbox.findUnprocessedByTransportMessageId(transportMessageId);
    if (events.length === 0) return;

    for (const event of events) {
      const delivery = await this.deliveries.findByTransportMessageId(transportMessageId);
      if (delivery === null) return;

      const input = this.fromInboxRecord(event);
      if (input === null) {
        await this.inbox.markProcessed(event.webhookId, processedAt);
        continue;
      }
      await this.processMatched(input, delivery, processedAt);
    }
  }

  private async processMatched(
    input: WebhookProcessingInput,
    initialDelivery: NotificationDeliveryRecord,
    processedAt: Date,
  ): Promise<void> {
    let effectiveDelivery = initialDelivery;

    if (initialDelivery.status === StatusPengirimanNotifikasiWhatsApp.PENDING) {
      const transition =
        input.status === 'accepted'
          ? await this.deliveries.markAccepted(
              initialDelivery.pengirimanNotifikasiWhatsAppId,
              processedAt,
            )
          : await this.deliveries.markRejected(
              initialDelivery.pengirimanNotifikasiWhatsAppId,
              input.errorCode,
              processedAt,
            );

      if (transition === 'updated') {
        effectiveDelivery = {
          ...initialDelivery,
          status:
            input.status === 'accepted'
              ? StatusPengirimanNotifikasiWhatsApp.ACCEPTED
              : StatusPengirimanNotifikasiWhatsApp.REJECTED,
          errorCode: input.status === 'rejected' ? input.errorCode : null,
          resolvedAt: processedAt,
        };
      } else {
        effectiveDelivery =
          (await this.deliveries.findByTransportMessageId(input.transportMessageId)) ??
          initialDelivery;
      }
    }

    if (
      input.status === 'rejected' &&
      effectiveDelivery.status === StatusPengirimanNotifikasiWhatsApp.REJECTED &&
      effectiveDelivery.errorCode === 'MESSAGE_REJECTED'
    ) {
      await this.accelerateIfLatestAndEligible(effectiveDelivery, input.receivedAt);
    }

    await this.inbox.markProcessed(input.webhookId, processedAt);
  }

  private async accelerateIfLatestAndEligible(
    delivery: NotificationDeliveryRecord,
    receivedAt: Date,
  ): Promise<void> {
    const latest = await this.deliveries.findLatestForIdentity(
      delivery.pengajuanEvaluasiId,
      delivery.penggunaId,
      delivery.jenis,
    );
    if (
      latest === null ||
      latest.pengirimanNotifikasiWhatsAppId !== delivery.pengirimanNotifikasiWhatsAppId
    ) {
      return;
    }

    const reminder = await this.reminders.findByIdentity(
      delivery.pengajuanEvaluasiId,
      delivery.penggunaId,
      delivery.jenis,
    );
    if (
      reminder === null ||
      reminder.notificationReminderId !== delivery.pengingatWhatsAppId ||
      !isReminderStillEligible(reminder)
    ) {
      return;
    }

    await this.reminders.accelerateNextSendAt(
      reminder.notificationReminderId,
      new Date(receivedAt.getTime() + GENERIC_REJECTION_RETRY_DELAY_MS),
    );
  }

  private fromTrustedEvent(
    event: TrustedWagoWebhookEvent,
    receivedAt: Date,
  ): WebhookProcessingInput {
    return {
      webhookId: event.id,
      transportMessageId: event.data.messageId,
      status: event.data.status,
      errorCode: event.event === 'message.rejected' ? (event.data.error ?? null) : null,
      receivedAt,
    };
  }

  private fromInboxRecord(event: WagoWebhookEvent): WebhookProcessingInput | null {
    if (event.event === 'message.server_accepted' && event.status === 'accepted') {
      return {
        webhookId: event.webhookId,
        transportMessageId: event.transportMessageId,
        status: 'accepted',
        errorCode: null,
        receivedAt: event.receivedAt,
      };
    }
    if (event.event === 'message.rejected' && event.status === 'rejected') {
      return {
        webhookId: event.webhookId,
        transportMessageId: event.transportMessageId,
        status: 'rejected',
        errorCode: event.errorCode,
        receivedAt: event.receivedAt,
      };
    }
    return null;
  }
}
