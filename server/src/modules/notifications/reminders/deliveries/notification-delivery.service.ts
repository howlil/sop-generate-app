import { Injectable } from '@nestjs/common';
import type { ClaimedNotificationReminder } from '../notification-reminder.types';
import type { NotificationSendReceipt } from '../providers/notification-channel.interface';
import { WagoWebhookService } from '../webhooks/wago-webhook.service';
import { NotificationDeliveryRepository } from './notification-delivery.repository';
import type { NotificationDeliveryRecord } from './notification-delivery.types';

@Injectable()
export class NotificationDeliveryService {
  constructor(
    private readonly repository: NotificationDeliveryRepository,
    private readonly webhookService: WagoWebhookService,
  ) {}

  async recordSubmission(
    reminder: ClaimedNotificationReminder,
    idempotencyKey: string,
    receipt: NotificationSendReceipt,
    submittedAt: Date,
  ): Promise<NotificationDeliveryRecord> {
    const delivery = await this.repository.createOrGetPending({
      notificationReminderId: reminder.notificationReminderId,
      pengajuanEvaluasiId: reminder.pengajuanEvaluasiId,
      penggunaId: reminder.penggunaId,
      kind: reminder.kind,
      idempotencyKey,
      transportMessageId: receipt.transportMessageId,
      submittedAt,
    });

    if (delivery.transportMessageId !== null) {
      await this.webhookService.reconcileTransportMessage(delivery.transportMessageId);
    }
    return delivery;
  }
}
