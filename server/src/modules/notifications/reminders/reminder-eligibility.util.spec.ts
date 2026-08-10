import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { isReminderStillEligible } from './reminder-eligibility.util';

describe('isReminderStillEligible', () => {
  function reminder(
    kind: NotificationReminderKind,
    role: PeranPengguna,
    status: StatusPengajuanEvaluasi,
    overrides: Partial<ClaimedNotificationReminder> = {},
  ): ClaimedNotificationReminder {
    return {
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'pengajuan-1',
      penggunaId: 'user-1',
      kind,
      destination: '6281234567890',
      consecutiveFailures: 0,
      lockToken: 'lock-1',
      pengajuanEvaluasi: {
        pengajuanEvaluasiId: 'pengajuan-1',
        opdId: 'opd-1',
        opdNama: 'Dinas Kesehatan',
        nomorBA: 'BA-001',
        status,
        jumlahSop: 1,
      },
      pengguna: {
        penggunaId: 'user-1',
        opdId: 'opd-1',
        email: 'user@example.test',
        nama: 'User Test',
        peran: role,
        nohp: '6281234567890',
        deletedAt: null,
      },
      ...overrides,
    };
  }

  it('mengizinkan evaluator aktif untuk pengajuan yang sedang dievaluasi', () => {
    expect(
      isReminderStillEligible(
        reminder(
          NotificationReminderKind.EVALUASI_SOP,
          PeranPengguna.EVALUATOR,
          StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        ),
      ),
    ).toBe(true);
  });

  it('menolak ketika status pengajuan tidak sesuai jenis reminder', () => {
    expect(
      isReminderStillEligible(
        reminder(
          NotificationReminderKind.EVALUASI_SOP,
          PeranPengguna.EVALUATOR,
          StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        ),
      ),
    ).toBe(false);
  });

  it('menolak pengguna yang sudah nonaktif', () => {
    const base = reminder(
      NotificationReminderKind.EVALUASI_SOP,
      PeranPengguna.EVALUATOR,
      StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
    );
    expect(
      isReminderStillEligible({
        ...base,
        pengguna: { ...base.pengguna, deletedAt: new Date('2026-08-10T00:00:00Z') },
      }),
    ).toBe(false);
  });

  it('menolak role penerima yang tidak sesuai jenis reminder', () => {
    expect(
      isReminderStillEligible(
        reminder(
          NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
          PeranPengguna.EVALUATOR,
          StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        ),
      ),
    ).toBe(false);
  });

  it('PJ Penyusun wajib berasal dari OPD pengajuan yang sama', () => {
    const sameOpd = reminder(
      NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
      PeranPengguna.PJ_PENYUSUN,
      StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
    );
    const otherOpd = {
      ...sameOpd,
      pengguna: { ...sameOpd.pengguna, opdId: 'opd-2' },
    };

    expect(isReminderStillEligible(sameOpd)).toBe(true);
    expect(isReminderStillEligible(otherOpd)).toBe(false);
  });

  it('Kepala OPD wajib berasal dari OPD pengajuan yang sama', () => {
    const sameOpd = reminder(
      NotificationReminderKind.TTD_SOP_KEPALA_OPD,
      PeranPengguna.KEPALA_OPD,
      StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
    );
    const otherOpd = {
      ...sameOpd,
      pengguna: { ...sameOpd.pengguna, opdId: 'opd-9' },
    };

    expect(isReminderStillEligible(sameOpd)).toBe(true);
    expect(isReminderStillEligible(otherOpd)).toBe(false);
  });
});
