/* eslint-disable @typescript-eslint/unbound-method */
import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusPengirimanNotifikasiWhatsApp,
} from '../../../../generated/prisma';
import { NotificationDeliveryRepository } from '../deliveries/notification-delivery.repository';
import type { ClaimedNotificationReminder } from '../notification-reminder.types';
import { NotificationReminderRepository } from '../notification-reminder.repository';
import { WagoWebhookRepository } from './wago-webhook.repository';
import { WagoWebhookService } from './wago-webhook.service';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';

const now = new Date('2026-08-13T08:10:00.000Z');

const delivery = {
  pengirimanNotifikasiWhatsAppId: 'delivery-record-1',
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

const activeReminder: ClaimedNotificationReminder = {
  notificationReminderId: 'reminder-1',
  pengajuanEvaluasiId: 'submission-1',
  penggunaId: 'user-1',
  kind: JenisPengingatWhatsApp.EVALUASI_SOP,
  destination: '085373945490',
  lastSentAt: new Date('2026-08-13T08:00:00.000Z'),
  consecutiveFailures: 0,
  lockToken: null,
  pengajuanEvaluasi: {
    pengajuanEvaluasiId: 'submission-1',
    opdId: 'opd-1',
    opdNama: 'OPD Uji',
    nomorBA: null,
    status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
    jumlahSop: 1,
  },
  pengguna: {
    penggunaId: 'user-1',
    opdId: 'opd-2',
    email: 'evaluator@example.test',
    nama: 'Evaluator',
    peran: PeranPengguna.EVALUATOR,
    nohp: '085373945490',
    deletedAt: null,
  },
};

function rejectedEvent(error?: string): TrustedWagoWebhookEvent {
  return {
    version: '1',
    id: `webhook-${error ?? 'unknown'}`,
    event: 'message.rejected',
    createdAt: new Date('2026-08-13T08:09:59.000Z'),
    data: {
      messageId: 'wamid-1',
      status: 'rejected',
      ...(error === undefined ? {} : { error }),
    },
  };
}

function build() {
  const inbox = {
    insertIfNew: jest.fn().mockResolvedValue('inserted'),
    findByWebhookId: jest.fn().mockResolvedValue({
      webhookId: 'existing-webhook',
      transportMessageId: 'wamid-1',
      event: 'message.rejected',
      status: 'rejected',
      errorCode: 'MESSAGE_REJECTED',
      sourceCreatedAt: now,
      receivedAt: now,
      processedAt: now,
      createdAt: now,
    }),
    findUnprocessedByTransportMessageId: jest.fn().mockResolvedValue([]),
    markProcessed: jest.fn().mockResolvedValue(true),
  } as unknown as WagoWebhookRepository;
  const deliveries = {
    findByTransportMessageId: jest.fn().mockResolvedValue(delivery),
    findLatestForIdentity: jest.fn().mockResolvedValue(delivery),
    markAccepted: jest.fn().mockResolvedValue('updated'),
    markRejected: jest.fn().mockResolvedValue('updated'),
  } as unknown as NotificationDeliveryRepository;
  const reminders = {
    findByIdentity: jest.fn().mockResolvedValue(activeReminder),
    accelerateNextSendAt: jest.fn().mockResolvedValue(true),
  } as unknown as NotificationReminderRepository;
  const service = new WagoWebhookService(inbox, deliveries, reminders);
  return { service, inbox, deliveries, reminders };
}

describe('WagoWebhookService', () => {
  it('accelerates the latest eligible MESSAGE_REJECTED attempt by five minutes', async () => {
    const { service, reminders } = build();

    await expect(service.ingest(rejectedEvent('MESSAGE_REJECTED'), now)).resolves.toBe('processed');

    expect(reminders.accelerateNextSendAt).toHaveBeenCalledWith(
      'reminder-1',
      new Date('2026-08-13T08:15:00.000Z'),
    );
  });

  it('defers a correlated MESSAGE_REJECTED until the occurrence schedule commit is visible', async () => {
    const { service, inbox, deliveries, reminders } = build();
    (reminders.findByIdentity as jest.Mock).mockResolvedValueOnce({
      ...activeReminder,
      lastSentAt: null,
    });

    await expect(service.ingest(rejectedEvent('MESSAGE_REJECTED'), now)).resolves.toBe('deferred');

    expect(deliveries.markRejected).toHaveBeenCalled();
    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
    expect(inbox.markProcessed).not.toHaveBeenCalled();
  });

  it.each(['REACHOUT_RESTRICTED', 'SOMETHING_NEW', undefined])(
    'records rejection without accelerating for %s',
    async (errorCode) => {
      const { service, reminders } = build();

      await service.ingest(rejectedEvent(errorCode), now);

      expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
    },
  );

  it('does not accelerate a stale attempt when a newer occurrence exists', async () => {
    const { service, deliveries, reminders } = build();
    (deliveries.findLatestForIdentity as jest.Mock).mockResolvedValueOnce({
      ...delivery,
      pengirimanNotifikasiWhatsAppId: 'delivery-record-2',
      transportMessageId: 'wamid-2',
      submittedAt: new Date('2026-08-13T08:05:00.000Z'),
    });

    await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);

    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
  });

  it('does not accelerate when the active reminder no longer exists', async () => {
    const { service, reminders } = build();
    (reminders.findByIdentity as jest.Mock).mockResolvedValueOnce(null);

    await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);

    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
  });

  it('does not accelerate when the workflow is no longer eligible', async () => {
    const { service, reminders } = build();
    (reminders.findByIdentity as jest.Mock).mockResolvedValueOnce({
      ...activeReminder,
      pengajuanEvaluasi: {
        ...activeReminder.pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      },
    });

    await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);

    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
  });

  it('returns a processed duplicate without reapplying delivery or schedule mutations', async () => {
    const { service, inbox, deliveries, reminders } = build();
    (inbox.insertIfNew as jest.Mock).mockResolvedValueOnce('duplicate');

    await expect(service.ingest(rejectedEvent('MESSAGE_REJECTED'), now)).resolves.toBe('duplicate');

    expect(inbox.findByWebhookId).toHaveBeenCalled();
    expect(deliveries.findByTransportMessageId).not.toHaveBeenCalled();
    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
  });

  it('durably stores an unmatched event for later reconciliation', async () => {
    const { service, deliveries, inbox } = build();
    (deliveries.findByTransportMessageId as jest.Mock).mockResolvedValueOnce(null);

    await expect(service.ingest(rejectedEvent('MESSAGE_REJECTED'), now)).resolves.toBe(
      'stored-unmatched',
    );

    expect(inbox.markProcessed).not.toHaveBeenCalled();
  });

  it('keeps an existing accepted terminal state when a rejection arrives later', async () => {
    const { service, deliveries, reminders, inbox } = build();
    (deliveries.findByTransportMessageId as jest.Mock).mockResolvedValueOnce({
      ...delivery,
      status: StatusPengirimanNotifikasiWhatsApp.ACCEPTED,
      resolvedAt: new Date('2026-08-13T08:09:00.000Z'),
    });

    await service.ingest(rejectedEvent('MESSAGE_REJECTED'), now);

    expect(deliveries.markRejected).not.toHaveBeenCalled();
    expect(reminders.accelerateNextSendAt).not.toHaveBeenCalled();
    expect(inbox.markProcessed).toHaveBeenCalled();
  });
});
