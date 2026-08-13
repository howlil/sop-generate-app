import { Injectable } from '@nestjs/common';
import type { ClaimedNotificationReminder } from '../notification-reminder.types';
import type { NotificationSendReceipt } from '../providers/notification-channel.interface';
import { NotificationDeliveryRepository } from './notification-delivery.repository';
import type { NotificationDeliveryRecord } from './notification-delivery.types';

@Injectable()
export class NotificationDeliveryService {
  constructor(private readonly repository: NotificationDeliveryRepository) {}

  recordSubmission(
    reminder: ClaimedNotificationReminder,
    idempotencyKey: string,
    receipt: NotificationSendReceipt,
    submittedAt: Date,
  ): Promise<NotificationDeliveryRecord> {
    return this.repository.createOrGetPending({
      notificationReminderId: reminder.notificationReminderId,
      pengajuanEvaluasiId: reminder.pengajuanEvaluasiId,
      penggunaId: reminder.penggunaId,
      kind: reminder.kind,
      idempotencyKey,
      transportMessageId: receipt.transportMessageId,
      submittedAt,
    });
  }
}
