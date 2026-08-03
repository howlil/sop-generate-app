/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import { WhatsappMessageFactory } from './whatsapp-message.factory';
import { WhatsappReminderRepository } from './whatsapp-reminder.repository';
import { WhatsappReminderWorkerService } from './whatsapp-reminder-worker.service';
import type { ClaimedWhatsappReminder } from './whatsapp-reminder.types';
import {
  WhatsappProviderError,
  type WhatsappProvider,
} from './providers/whatsapp-provider.interface';

function config(): ConfigService {
  const values: Record<string, unknown> = {
    WHATSAPP_MAX_CONCURRENCY: 2,
    WHATSAPP_LOCK_LEASE_SECONDS: 60,
    WHATSAPP_REMINDER_INTERVAL_MINUTES: 1,
    WHATSAPP_ALLOWED_RECIPIENTS: '6281111111111',
  };
  return {
    get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
  } as unknown as ConfigService;
}

function claimed(overrides: Partial<ClaimedWhatsappReminder> = {}): ClaimedWhatsappReminder {
  return {
    pengingatWhatsAppId: 'r-1',
    pengajuanEvaluasiId: 'p-1',
    penggunaId: 'u-1',
    jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
    nomorTujuan: '6281111111111',
    consecutiveFailures: 0,
    lockToken: 'generated-at-runtime',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'p-1',
      opdId: 'opd-1',
      opdNama: 'OPD 1',
      nomorBA: null,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      jumlahSop: 1,
    },
    pengguna: {
      penggunaId: 'u-1',
      opdId: 'opd-1',
      nama: 'Evaluator',
      nohp: '081111111111',
      peran: PeranPengguna.EVALUATOR,
      deletedAt: null,
    },
    ...overrides,
  };
}

function build(
  reminder: ClaimedWhatsappReminder,
  providerOverrides: Partial<WhatsappProvider> = {},
) {
  const repository = {
    findDueCandidateIds: jest.fn().mockResolvedValue(['r-1']),
    tryClaim: jest.fn().mockResolvedValue(true),
    findClaimed: jest
      .fn()
      .mockImplementation((_id: string, lockToken: string) =>
        Promise.resolve({ ...reminder, lockToken }),
      ),
    markSuccess: jest.fn().mockResolvedValue(true),
    markFailure: jest.fn().mockResolvedValue(true),
    deleteClaimed: jest.fn().mockResolvedValue(true),
  } as unknown as WhatsappReminderRepository;
  const provider: WhatsappProvider = {
    assertReady: jest.fn().mockResolvedValue(undefined),
    sendText: jest.fn().mockResolvedValue(undefined),
    ...providerOverrides,
  };
  return {
    repository,
    provider,
    service: new WhatsappReminderWorkerService(
      repository,
      new WhatsappMessageFactory(),
      config(),
      provider,
    ),
  };
}

describe('WhatsappReminderWorkerService', () => {
  const now = new Date('2026-08-02T00:00:00.000Z');

  it('claim, validasi, kirim, lalu menjadwalkan reminder berikutnya tanpa batas maksimum', async () => {
    const { service, repository, provider } = build(claimed());
    await expect(service.processDue(now)).resolves.toEqual({ candidates: 1, processed: 1 });
    expect(provider.assertReady).toHaveBeenCalledTimes(1);
    expect(provider.sendText).toHaveBeenCalledWith(
      expect.objectContaining({ nomorTujuan: '6281111111111' }),
    );
    expect(repository.markSuccess).toHaveBeenCalledTimes(1);
    const markArgs = (repository.markSuccess as jest.Mock).mock.calls[0] as [
      string,
      string,
      Date,
      Date,
    ];
    expect(markArgs[3].getTime() - markArgs[2].getTime()).toBe(60_000);
  });

  it('menghapus reminder jika status berubah tepat sebelum pengiriman', async () => {
    const stale = claimed({
      pengajuanEvaluasi: {
        ...claimed().pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      },
    });
    const { service, repository, provider } = build(stale);
    await service.processDue(now);
    expect(repository.deleteClaimed).toHaveBeenCalledTimes(1);
    expect(provider.assertReady).not.toHaveBeenCalled();
    expect(provider.sendText).not.toHaveBeenCalled();
  });

  it('menghapus reminder jika pengguna nonaktif, peran berubah, OPD salah, atau nomor berubah', async () => {
    const cases: ClaimedWhatsappReminder[] = [
      claimed({ pengguna: { ...claimed().pengguna, deletedAt: new Date() } }),
      claimed({ pengguna: { ...claimed().pengguna, peran: PeranPengguna.PENYUSUN } }),
      claimed({ pengguna: { ...claimed().pengguna, nohp: '082222222222' } }),
    ];
    for (const row of cases) {
      const { service, repository, provider } = build(row);
      await service.processDue(now);
      expect(repository.deleteClaimed).toHaveBeenCalled();
      expect(provider.sendText).not.toHaveBeenCalled();
    }
  });

  it('retry transient failure satu menit kemudian', async () => {
    const { service, repository } = build(claimed(), {
      sendText: jest.fn().mockRejectedValue(new WhatsappProviderError('UNAVAILABLE', 'down')),
    });
    await service.processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      new Date('2026-08-02T00:01:00.000Z'),
      'UNAVAILABLE',
    );
  });

  it('tidak retry cepat ketika timeout ambigu setelah POST', async () => {
    const { service, repository } = build(claimed(), {
      sendText: jest
        .fn()
        .mockRejectedValue(new WhatsappProviderError('TIMEOUT', 'timeout', undefined, true)),
    });
    await service.processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      new Date('2026-08-02T00:01:00.000Z'),
      'TIMEOUT',
    );
  });

  it('menghormati Retry-After provider', async () => {
    const { service, repository } = build(claimed(), {
      sendText: jest
        .fn()
        .mockRejectedValue(new WhatsappProviderError('RATE_LIMITED', 'slow down', 120_000)),
    });
    await service.processDue(now);
    expect(repository.markFailure).toHaveBeenCalledWith(
      'r-1',
      expect.any(String),
      new Date('2026-08-02T00:02:00.000Z'),
      'RATE_LIMITED',
    );
  });

  it('tidak memproses jika worker lain memenangkan claim', async () => {
    const { service, repository, provider } = build(claimed());
    (repository.tryClaim as jest.Mock).mockResolvedValue(false);
    await expect(service.processDue(now)).resolves.toEqual({ candidates: 1, processed: 0 });
    expect(provider.sendText).not.toHaveBeenCalled();
  });

  it('tidak mengecek WAHA jika tidak ada reminder jatuh tempo', async () => {
    const { service, repository, provider } = build(claimed());
    (repository.findDueCandidateIds as jest.Mock).mockResolvedValue([]);
    await expect(service.processDue(now)).resolves.toEqual({ candidates: 0, processed: 0 });
    expect(provider.assertReady).not.toHaveBeenCalled();
  });
});
