import { ConfigService } from '@nestjs/config';
import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import { ReminderMessageFactory } from './reminder-message.factory';
import { NotificationReminderRepository } from './notification-reminder.repository';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { PushReminderWorkerService } from './push-reminder-worker.service';
import {
  NotificationChannelError,
  type NotificationChannel,
} from './providers/notification-channel.interface';

type RepositoryMock = {
  findDueCandidateIds: jest.Mock;
  tryClaim: jest.Mock;
  findClaimed: jest.Mock;
  releaseClaim: jest.Mock;
  markSuccess: jest.Mock;
  markFailure: jest.Mock;
};

function claimedReminder(
  overrides: Partial<ClaimedNotificationReminder> = {},
): ClaimedNotificationReminder {
  const base: ClaimedNotificationReminder = {
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'pengajuan-1',
    penggunaId: 'evaluator-1',
    kind: NotificationReminderKind.EVALUASI_SOP,
    destination: '6281234567890',
    consecutiveFailures: 0,
    lockToken: 'lock-token',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'pengajuan-1',
      opdId: 'opd-1',
      opdNama: 'OPD A',
      nomorBA: null,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      jumlahSop: 2,
    },
    pengguna: {
      penggunaId: 'evaluator-1',
      opdId: 'opd-biro',
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

function setup() {
  const repository: RepositoryMock = {
    findDueCandidateIds: jest.fn(),
    tryClaim: jest.fn(),
    findClaimed: jest.fn(),
    releaseClaim: jest.fn(),
    markSuccess: jest.fn(),
    markFailure: jest.fn(),
  };
  const channel: NotificationChannel = { send: jest.fn() };
  const config = {
    get: jest.fn((key: string, fallback: number) => {
      const values: Record<string, number> = {
        WHATSAPP_MAX_CONCURRENCY: 2,
        WHATSAPP_LOCK_LEASE_SECONDS: 30,
        WHATSAPP_REMINDER_INTERVAL_MINUTES: 10,
      };
      return values[key] ?? fallback;
    }),
  } as unknown as ConfigService;
  const messageFactory = new ReminderMessageFactory();
  const service = new PushReminderWorkerService(
    repository as unknown as NotificationReminderRepository,
    messageFactory,
    config,
    channel,
  );
  return { service, repository, channel };
}

describe('PushReminderWorkerService', () => {
  const now = new Date('2026-08-10T07:00:00.000Z');

  it('berhenti tanpa claim ketika tidak ada kandidat due', async () => {
    const { service, repository } = setup();
    repository.findDueCandidateIds.mockResolvedValue([]);

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 0, processed: 0 });
    expect(repository.tryClaim).not.toHaveBeenCalled();
  });

  it('mengabaikan kandidat yang gagal di-claim atau hilang setelah claim', async () => {
    const { service, repository } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1', 'r-2']);
    repository.tryClaim.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'claimed' });
    repository.findClaimed.mockResolvedValueOnce(null);

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 2, processed: 0 });
  });

  it('melepas claim untuk reminder stale yang tidak lagi eligible', async () => {
    const { service, repository, channel } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1']);
    repository.tryClaim.mockResolvedValue({ id: 'claimed' });
    repository.findClaimed.mockResolvedValue(
      claimedReminder({
        pengajuanEvaluasi: {
          ...claimedReminder().pengajuanEvaluasi,
          status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        },
      }),
    );

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 1, processed: 1 });
    expect(repository.releaseClaim).toHaveBeenCalledTimes(1);
    expect(channel.send).not.toHaveBeenCalled();
  });

  it('mengirim reminder eligible lalu menjadwalkan interval berikutnya', async () => {
    const { service, repository, channel } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1']);
    repository.tryClaim.mockResolvedValue({ id: 'claimed' });
    repository.findClaimed.mockResolvedValue(claimedReminder());
    (channel.send as jest.Mock).mockResolvedValue(undefined);

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 1, processed: 1 });
    expect(channel.send).toHaveBeenCalledWith('6281234567890', expect.stringContaining('SOPFlow'));
    expect(repository.markSuccess).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      expect.any(Date),
      expect.any(Date),
    );
    const [, , sentAt, nextSendAt] = repository.markSuccess.mock.calls[0] as [
      string,
      string,
      Date,
      Date,
    ];
    expect(nextSendAt.getTime() - sentAt.getTime()).toBe(10 * 60_000);
  });

  it.each([
    {
      label: 'bad recipient',
      error: new NotificationChannelError('BAD_RECIPIENT', 'invalid'),
      failures: 0,
      delay: 10 * 60_000,
    },
    {
      label: 'retry-after provider',
      error: new NotificationChannelError('RATE_LIMITED', 'slow down', 12_345),
      failures: 0,
      delay: 12_345,
    },
    {
      label: 'unauthorized',
      error: new NotificationChannelError('UNAUTHORIZED', 'token invalid'),
      failures: 0,
      delay: 5 * 60_000,
    },
    {
      label: 'configuration',
      error: new NotificationChannelError('CONFIGURATION', 'config missing'),
      failures: 0,
      delay: 5 * 60_000,
    },
    {
      label: 'transient first failure',
      error: new NotificationChannelError('UNAVAILABLE', 'down'),
      failures: 0,
      delay: 60_000,
    },
    {
      label: 'transient capped failure',
      error: new NotificationChannelError('TIMEOUT', 'timeout'),
      failures: 99,
      delay: 15 * 60_000,
    },
  ])('mencatat kegagalan channel dan backoff untuk $label', async ({ error, failures, delay }) => {
    const { service, repository, channel } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1']);
    repository.tryClaim.mockResolvedValue({ id: 'claimed' });
    repository.findClaimed.mockResolvedValue(claimedReminder({ consecutiveFailures: failures }));
    (channel.send as jest.Mock).mockRejectedValue(error);

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 1, processed: 1 });
    expect(repository.markFailure).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      new Date(now.getTime() + delay),
      error.kind,
    );
  });

  it.each([
    [new Error('unexpected'), 'UNKNOWN'],
    ['non-error failure', 'UNKNOWN'],
  ])('menormalisasi error channel yang tidak bertipe NotificationChannelError', async (error, kind) => {
    const { service, repository, channel } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1']);
    repository.tryClaim.mockResolvedValue({ id: 'claimed' });
    repository.findClaimed.mockResolvedValue(claimedReminder());
    (channel.send as jest.Mock).mockRejectedValue(error);

    await service.processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      expect.any(Date),
      kind,
    );
  });

  it('mengisolasi exception satu kandidat dan tetap memproses kandidat lain', async () => {
    const { service, repository, channel } = setup();
    repository.findDueCandidateIds.mockResolvedValue(['r-1', 'r-2', 'r-3']);
    repository.tryClaim.mockImplementation(async (id: string) => {
      if (id === 'r-1') throw new Error('database hiccup');
      return { id: 'claimed' };
    });
    repository.findClaimed.mockResolvedValue(claimedReminder());
    (channel.send as jest.Mock).mockResolvedValue(undefined);

    await expect(service.processDue(now)).resolves.toEqual({ candidates: 3, processed: 2 });
    expect(channel.send).toHaveBeenCalledTimes(2);
  });
});
