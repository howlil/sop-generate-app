/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { NotificationReminderRepository } from './notification-reminder.repository';
import { PushReminderWorkerService } from './push-reminder-worker.service';
import { ReminderMessageFactory } from './reminder-message.factory';
import type { NotificationChannel } from './providers/notification-channel.interface';

function buildReminder(lastSentAt: Date | null = null): ClaimedNotificationReminder {
  return {
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'pengajuan-1',
    penggunaId: 'pengguna-1',
    kind: JenisPengingatWhatsApp.EVALUASI_SOP,
    destination: '085373945490',
    lastSentAt,
    consecutiveFailures: 0,
    lockToken: 'lock-1',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'pengajuan-1',
      opdId: 'opd-1',
      opdNama: 'OPD Uji',
      nomorBA: null,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      jumlahSop: 1,
    },
    pengguna: {
      penggunaId: 'pengguna-1',
      opdId: 'opd-2',
      email: 'evaluator@example.test',
      nama: 'Evaluator Uji',
      peran: PeranPengguna.EVALUATOR,
      nohp: '085373945490',
      deletedAt: null,
    },
  };
}

function build(lastSentAt: Date | null = null) {
  const reminder = buildReminder(lastSentAt);
  const repository = {
    findDueCandidateIds: jest.fn().mockResolvedValue([reminder.notificationReminderId]),
    tryClaim: jest.fn().mockResolvedValue(true),
    findClaimed: jest.fn().mockResolvedValue(reminder),
    releaseClaim: jest.fn().mockResolvedValue(true),
    markSuccess: jest.fn().mockResolvedValue(true),
    markFailure: jest.fn().mockResolvedValue(true),
  } as unknown as NotificationReminderRepository;
  const messageFactory = {
    build: jest.fn().mockReturnValue({ body: 'Pesan reminder' }),
  } as unknown as ReminderMessageFactory;
  const receipt = { transportMessageId: 'wamid-1', status: 'pending' as const };
  const channel = {
    send: jest.fn().mockResolvedValue(receipt),
  } as unknown as NotificationChannel;
  const delivery = {
    pengirimanNotifikasiWhatsAppId: 'delivery-1',
    transportMessageId: 'wamid-1',
  };
  const deliveryService = {
    recordSubmission: jest.fn().mockResolvedValue(delivery),
    reconcileSubmission: jest.fn().mockResolvedValue(undefined),
  };
  const config = {
    get: jest.fn((key: string, fallback: unknown) => {
      if (key === 'WHATSAPP_MAX_CONCURRENCY') return 1;
      if (key === 'WHATSAPP_LOCK_LEASE_SECONDS') return 60;
      if (key === 'WHATSAPP_REMINDER_INTERVAL_MINUTES') return 1440;
      return fallback;
    }),
  } as unknown as ConfigService;

  const service = Reflect.construct(PushReminderWorkerService, [
    repository,
    messageFactory,
    config,
    channel,
    deliveryService,
  ]) as PushReminderWorkerService;

  return { reminder, repository, channel, delivery, deliveryService, receipt, service };
}

describe('PushReminderWorkerService idempotency', () => {
  it('persists the transport receipt before markSuccess and reconciles only after the schedule commit', async () => {
    const { service, reminder, repository, channel, delivery, deliveryService, receipt } = build();

    await service.processDue(new Date('2026-08-11T00:00:00.000Z'));

    const idempotencyKey = 'sopflow-reminder:reminder-1:initial';
    expect(channel.send).toHaveBeenCalledWith(reminder.destination, 'Pesan reminder', {
      idempotencyKey,
    });
    expect(deliveryService.recordSubmission).toHaveBeenCalledWith(
      reminder,
      idempotencyKey,
      receipt,
      expect.any(Date),
    );
    expect(deliveryService.reconcileSubmission).toHaveBeenCalledWith(delivery);
    expect(deliveryService.recordSubmission.mock.invocationCallOrder[0]).toBeLessThan(
      (repository.markSuccess as jest.Mock).mock.invocationCallOrder[0],
    );
    expect((repository.markSuccess as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
      deliveryService.reconcileSubmission.mock.invocationCallOrder[0],
    );
  });

  it('menggunakan lastSentAt untuk occurrence reminder berikutnya', async () => {
    const lastSentAt = new Date('2026-08-10T00:00:00.000Z');
    const { service, reminder, channel } = build(lastSentAt);

    await service.processDue(new Date('2026-08-11T00:00:00.000Z'));

    expect(channel.send).toHaveBeenCalledWith(reminder.destination, 'Pesan reminder', {
      idempotencyKey: `sopflow-reminder:reminder-1:${lastSentAt.getTime()}`,
    });
  });
});
