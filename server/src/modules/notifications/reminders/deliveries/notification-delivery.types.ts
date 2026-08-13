import type {
  JenisPengingatWhatsApp,
  PengirimanNotifikasiWhatsApp,
} from '../../../../generated/prisma';

export type NotificationDeliveryRecord = PengirimanNotifikasiWhatsApp;

export type CreatePendingNotificationDelivery = Readonly<{
  notificationReminderId: string;
  pengajuanEvaluasiId: string;
  penggunaId: string;
  kind: JenisPengingatWhatsApp;
  idempotencyKey: string;
  transportMessageId: string | null;
  submittedAt: Date;
}>;

export type NotificationDeliveryTransition = 'updated' | 'already-terminal';
