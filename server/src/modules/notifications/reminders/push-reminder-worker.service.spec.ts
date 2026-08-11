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
  const channel = {
    send: jest.fn().mockResolvedValue(undefined),
  } as unknown as NotificationChannel;
  const config = {
    get: jest.fn((key: string, fallback: unknown) => {
      if (key === 'WHATSAPP_MAX_CONCURRENCY') return 1;
      if (key === 'WHATSAPP_LOCK_LEASE_SECONDS') return 60;
      if (key === 'WHATSAPP_REMINDER_INTERVAL_MINUTES') return 1440;
      return fallback;
    }),
  } as unknown as ConfigService;

  return {
    reminder,
    repository,
    channel,
    service: new PushReminderWorkerService(repository, messageFactory, config, channel),
  };
}

describe('PushReminderWorkerService idempotency', () => {
  it('menggunakan key initial untuk reminder yang belum pernah berhasil terkirim', async () => {
    const { service, reminder, channel } = build();

    await service.processDue(new Date('2026-08-11T00:00:00.000Z'));

    expect(channel.send).toHaveBeenCalledWith(reminder.destination, 'Pesan reminder', {
      idempotencyKey: 'sopflow-reminder:reminder-1:initial',
    });
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
