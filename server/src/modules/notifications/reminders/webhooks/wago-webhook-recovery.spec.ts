/* eslint-disable @typescript-eslint/unbound-method */
import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusPengirimanNotifikasiWhatsApp,
} from '../../../../generated/prisma';
import { NotificationDeliveryRepository } from '../deliveries/notification-delivery.repository';
import { NotificationReminderRepository } from '../notification-reminder.repository';
import { WagoWebhookRepository } from './wago-webhook.repository';
import { WagoWebhookService } from './wago-webhook.service';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';

it('recovers a durable unprocessed duplicate from the persisted inbox record', async () => {
  const receivedAt = new Date('2026-08-13T08:10:00.000Z');
  const persistedInbox = {
    webhookId: 'webhook-1',
    transportMessageId: 'wamid-1',
    event: 'message.rejected',
    status: 'rejected',
    errorCode: 'MESSAGE_REJECTED',
    sourceCreatedAt: new Date('2026-08-13T08:09:59.000Z'),
    receivedAt,
    processedAt: null,
    createdAt: receivedAt,
  };
  const delivery = {
    pengirimanNotifikasiWhatsAppId: 'delivery-1',
    pengingatWhatsAppId: 'reminder-1',
    pengajuanEvaluasiId: 'submission-1',
    penggunaId: 'user-1',
    jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
    idempotencyKey: 'sopflow-reminder:reminder-1:initial',
    transportMessageId: 'wamid-1',
    status: StatusPengirimanNotifikasiWhatsApp.PENDING,
    errorCode: null,
    submittedAt: new Date('2026-08-13T08:00:00.000Z'),
    resolvedAt: null,
    createdAt: new Date('2026-08-13T08:00:00.000Z'),
    updatedAt: new Date('2026-08-13T08:00:00.000Z'),
  };
  const inbox = {
    insertIfNew: jest.fn().mockResolvedValue('duplicate'),
    findByWebhookId: jest.fn().mockResolvedValue(persistedInbox),
    findUnprocessedByTransportMessageId: jest.fn().mockResolvedValue([persistedInbox]),
    markProcessed: jest.fn().mockResolvedValue(true),
  } as unknown as WagoWebhookRepository;
  const deliveries = {
    findByTransportMessageId: jest.fn().mockResolvedValue(delivery),
    findLatestForIdentity: jest.fn().mockResolvedValue(delivery),
    markRejected: jest.fn().mockResolvedValue('updated'),
    markAccepted: jest.fn().mockResolvedValue('updated'),
  } as unknown as NotificationDeliveryRepository;
  const reminders = {
    findByIdentity: jest.fn().mockResolvedValue({
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'submission-1',
      penggunaId: 'user-1',
      kind: JenisPengingatWhatsApp.EVALUASI_SOP,
      destination: '6281234567890',
      lastSentAt: null,
      consecutiveFailures: 0,
      lockToken: null,
      pengajuanEvaluasi: {
        pengajuanEvaluasiId: 'submission-1',
        opdId: 'opd-1',
        opdNama: 'OPD',
        nomorBA: null,
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jumlahSop: 1,
      },
      pengguna: {
        penggunaId: 'user-1',
        opdId: 'other-opd',
        email: 'evaluator@example.test',
        nama: 'Evaluator',
        peran: PeranPengguna.EVALUATOR,
        nohp: '6281234567890',
        deletedAt: null,
      },
    }),
    accelerateNextSendAt: jest.fn().mockResolvedValue(true),
  } as unknown as NotificationReminderRepository;
  const service = new WagoWebhookService(inbox, deliveries, reminders);
  const retryBody: TrustedWagoWebhookEvent = {
    version: '1',
    id: 'webhook-1',
    event: 'message.rejected',
    createdAt: new Date('2026-08-13T08:20:00.000Z'),
    data: { messageId: 'different-untrusted-retry-id', status: 'rejected', error: 'REACHOUT_RESTRICTED' },
  };

  await expect(service.ingest(retryBody, new Date('2026-08-13T08:20:01.000Z'))).resolves.toBe(
    'duplicate',
  );

  expect(inbox.findByWebhookId).toHaveBeenCalledWith('webhook-1');
  expect(inbox.findUnprocessedByTransportMessageId).toHaveBeenCalledWith('wamid-1');
  expect(deliveries.findByTransportMessageId).toHaveBeenCalledWith('wamid-1');
  expect(reminders.accelerateNextSendAt).toHaveBeenCalledWith(
    'reminder-1',
    new Date('2026-08-13T08:15:00.000Z'),
  );
  expect(inbox.markProcessed).toHaveBeenCalledWith('webhook-1', expect.any(Date));
});
