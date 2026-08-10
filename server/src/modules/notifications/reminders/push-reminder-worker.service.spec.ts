import { ConfigService } from '@nestjs/config';
import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { NotificationReminderRepository } from './notification-reminder.repository';
import { PushReminderWorkerService } from './push-reminder-worker.service';
import { ReminderMessageFactory } from './reminder-message.factory';
import {
  NotificationChannelError,
  type NotificationChannel,
} from './providers/notification-channel.interface';

type RepositoryMock = jest.Mocked<
  Pick<
    NotificationReminderRepository,
    | 'findDueCandidateIds'
    | 'tryClaim'
    | 'findClaimed'
    | 'releaseClaim'
    | 'markSuccess'
    | 'markFailure'
  >
>;

function createRepository(): RepositoryMock {
  return {
    findDueCandidateIds: jest.fn(),
    tryClaim: jest.fn(),
    findClaimed: jest.fn(),
    releaseClaim: jest.fn(),
    markSuccess: jest.fn(),
    markFailure: jest.fn(),
  };
}

function claimedReminder(
  overrides: Partial<ClaimedNotificationReminder> = {},
): ClaimedNotificationReminder {
  const base: ClaimedNotificationReminder = {
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'pengajuan-1',
    penggunaId: 'user-1',
    kind: NotificationReminderKind.EVALUASI_SOP,
    destination: '6281234567890',
    consecutiveFailures: 0,
    lockToken: 'claimed-token',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'pengajuan-1',
      opdId: 'opd-a',
      opdNama: 'OPD A',
      nomorBA: null,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      jumlahSop: 1,
    },
    pengguna: {
      penggunaId: 'user-1',
      opdId: 'opd-a',
      email: 'evaluator@example.test',
      nama: 'Evaluator',
      peran: PeranPengguna.EVALUATOR,
      nohp: '6281234567890',
      deletedAt: null,
    },
  };

  return {
    ...base,
    ...overrides,
    pengajuanEvaluasi: {
      ...base.pengajuanEvaluasi,
      ...overrides.pengajuanEvaluasi,
    },
    pengguna: {
      ...base.pengguna,
      ...overrides.pengguna,
    },
  };
}

function createWorker(repository: RepositoryMock, channel: NotificationChannel) {
  const config = {
    get: jest.fn((key: string, fallback: number) => {
      const values: Record<string, number> = {
        WHATSAPP_MAX_CONCURRENCY: 2,
        WHATSAPP_LOCK_LEASE_SECONDS: 30,
        WHATSAPP_REMINDER_INTERVAL_MINUTES: 2,
      };
      return values[key] ?? fallback;
    }),
  } as unknown as ConfigService;

  return new PushReminderWorkerService(
    repository as unknown as NotificationReminderRepository,
    new ReminderMessageFactory(),
    config,
    channel,
  );
}

describe('PushReminderWorkerService', () => {
  const now = new Date('2026-08-10T06:00:00.000Z');

  it('mengembalikan nol tanpa mencoba claim ketika tidak ada reminder jatuh tempo', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue([]);
    const channel: NotificationChannel = { send: jest.fn() };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 0,
      processed: 0,
    });
    expect(repository.tryClaim).not.toHaveBeenCalled();
    expect(repository.findDueCandidateIds).toHaveBeenCalledWith(now, 8);
  });

  it('melewati candidate yang gagal di-claim atau hilang setelah claim', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a', 'b']);
    repository.tryClaim.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    repository.findClaimed.mockResolvedValueOnce(null);
    const channel: NotificationChannel = { send: jest.fn() };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 2,
      processed: 0,
    });
    expect(channel.send).not.toHaveBeenCalled();
  });

  it('melepas claim reminder yang sudah tidak eligible tanpa mengirim pesan', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a']);
    repository.tryClaim.mockResolvedValue(true);
    repository.findClaimed.mockResolvedValue(
      claimedReminder({
        pengajuanEvaluasi: {
          ...claimedReminder().pengajuanEvaluasi,
          status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        },
      }),
    );
    repository.releaseClaim.mockResolvedValue(true);
    const channel: NotificationChannel = { send: jest.fn() };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 1,
      processed: 1,
    });
    expect(repository.releaseClaim).toHaveBeenCalledWith('a', expect.any(String));
    expect(channel.send).not.toHaveBeenCalled();
  });

  it('mengirim reminder eligible lalu menjadwalkan interval berikutnya', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a']);
    repository.tryClaim.mockResolvedValue(true);
    repository.findClaimed.mockResolvedValue(claimedReminder());
    repository.markSuccess.mockResolvedValue(true);
    const channel: NotificationChannel = { send: jest.fn().mockResolvedValue(undefined) };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 1,
      processed: 1,
    });

    expect(channel.send).toHaveBeenCalledWith(
      '6281234567890',
      expect.stringContaining('menunggu proses evaluasi'),
    );
    expect(repository.markSuccess).toHaveBeenCalledWith(
      'a',
      expect.any(String),
      expect.any(Date),
      expect.any(Date),
    );
    const [, , sentAt, nextSendAt] = repository.markSuccess.mock.calls[0]!;
    expect(nextSendAt.getTime() - sentAt.getTime()).toBe(120_000);
  });

  it.each([
    ['BAD_RECIPIENT', undefined, 120_000],
    ['RATE_LIMITED', 45_000, 45_000],
    ['UNAUTHORIZED', undefined, 300_000],
    ['CONFIGURATION', undefined, 300_000],
    ['TIMEOUT', undefined, 60_000],
  ] as const)(
    'menerapkan retry policy untuk error channel %s',
    async (kind, retryAfterMs, expectedDelayMs) => {
      const repository = createRepository();
      repository.findDueCandidateIds.mockResolvedValue(['a']);
      repository.tryClaim.mockResolvedValue(true);
      repository.findClaimed.mockResolvedValue(claimedReminder());
      repository.markFailure.mockResolvedValue(true);
      const channelError = new NotificationChannelError(kind, `error ${kind}`, retryAfterMs);
      const channel: NotificationChannel = { send: jest.fn().mockRejectedValue(channelError) };

      await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
        candidates: 1,
        processed: 1,
      });

      expect(repository.markFailure).toHaveBeenCalledWith(
        'a',
        expect.any(String),
        new Date(now.getTime() + expectedDelayMs),
        kind,
      );
    },
  );

  it('menggunakan exponential-style transient backoff berdasarkan consecutive failures', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a']);
    repository.tryClaim.mockResolvedValue(true);
    repository.findClaimed.mockResolvedValue(claimedReminder({ consecutiveFailures: 9 }));
    repository.markFailure.mockResolvedValue(true);
    const channel: NotificationChannel = {
      send: jest.fn().mockRejectedValue(new NotificationChannelError('UNAVAILABLE', 'down')),
    };

    await createWorker(repository, channel).processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'a',
      expect.any(String),
      new Date(now.getTime() + 15 * 60_000),
      'UNAVAILABLE',
    );
  });

  it.each([
    [new Error('socket reset'), 'socket reset'],
    ['raw failure', 'Kegagalan channel tidak diketahui'],
  ])('menormalisasi error channel tidak dikenal', async (thrown, _message) => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a']);
    repository.tryClaim.mockResolvedValue(true);
    repository.findClaimed.mockResolvedValue(claimedReminder());
    repository.markFailure.mockResolvedValue(true);
    const channel: NotificationChannel = { send: jest.fn().mockRejectedValue(thrown) };

    await createWorker(repository, channel).processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'a',
      expect.any(String),
      new Date(now.getTime() + 60_000),
      'UNKNOWN',
    );
  });

  it('menangkap kegagalan tak terduga per candidate tanpa menggagalkan batch lain', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a', 'b']);
    repository.tryClaim.mockRejectedValueOnce(new Error('database down')).mockResolvedValueOnce(true);
    repository.findClaimed.mockResolvedValueOnce(claimedReminder({ notificationReminderId: 'b' }));
    repository.markSuccess.mockResolvedValue(true);
    const channel: NotificationChannel = { send: jest.fn().mockResolvedValue(undefined) };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 2,
      processed: 1,
    });
  });

  it('aman mem-mask tujuan sangat pendek pada jalur sukses', async () => {
    const repository = createRepository();
    repository.findDueCandidateIds.mockResolvedValue(['a']);
    repository.tryClaim.mockResolvedValue(true);
    repository.findClaimed.mockResolvedValue(claimedReminder({ destination: '1234' }));
    repository.markSuccess.mockResolvedValue(true);
    const channel: NotificationChannel = { send: jest.fn().mockResolvedValue(undefined) };

    await expect(createWorker(repository, channel).processDue(now)).resolves.toEqual({
      candidates: 1,
      processed: 1,
    });
  });
});
