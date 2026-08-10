import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import { isReminderStillEligible } from './reminder-eligibility.util';
import type { ClaimedNotificationReminder } from './notification-reminder.types';

function reminder(
  overrides: Partial<ClaimedNotificationReminder> = {},
): ClaimedNotificationReminder {
  const base: ClaimedNotificationReminder = {
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'pengajuan-1',
    penggunaId: 'user-1',
    kind: NotificationReminderKind.EVALUASI_SOP,
    destination: '6281234567890',
    consecutiveFailures: 0,
    lockToken: 'lock-1',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'pengajuan-1',
      opdId: 'opd-1',
      opdNama: 'OPD A',
      nomorBA: null,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      jumlahSop: 2,
    },
    pengguna: {
      penggunaId: 'user-1',
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

describe('isReminderStillEligible', () => {
  it('menerima reminder evaluator dengan status, role, dan akun aktif yang sesuai', () => {
    expect(isReminderStillEligible(reminder())).toBe(true);
  });

  it('menolak reminder ketika status pengajuan sudah berubah', () => {
    expect(
      isReminderStillEligible(
        reminder({
          pengajuanEvaluasi: {
            ...reminder().pengajuanEvaluasi,
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          },
        }),
      ),
    ).toBe(false);
  });

  it('menolak reminder untuk pengguna yang sudah dinonaktifkan', () => {
    expect(
      isReminderStillEligible(
        reminder({
          pengguna: {
            ...reminder().pengguna,
            deletedAt: new Date('2026-08-10T00:00:00.000Z'),
          },
        }),
      ),
    ).toBe(false);
  });

  it('menolak reminder ketika role penerima tidak sesuai jenis reminder', () => {
    expect(
      isReminderStillEligible(
        reminder({
          pengguna: {
            ...reminder().pengguna,
            peran: PeranPengguna.PJ_EVALUATOR,
          },
        }),
      ),
    ).toBe(false);
  });

  it('mewajibkan PJ Penyusun berasal dari OPD pengajuan', () => {
    const sameOpd = reminder({
      kind: NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
      pengajuanEvaluasi: {
        ...reminder().pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
      },
      pengguna: {
        ...reminder().pengguna,
        opdId: 'opd-1',
        peran: PeranPengguna.PJ_PENYUSUN,
      },
    });
    expect(isReminderStillEligible(sameOpd)).toBe(true);
    expect(
      isReminderStillEligible({
        ...sameOpd,
        pengguna: { ...sameOpd.pengguna, opdId: 'opd-lain' },
      }),
    ).toBe(false);
  });

  it('mewajibkan Kepala OPD berasal dari OPD pengajuan', () => {
    const sameOpd = reminder({
      kind: NotificationReminderKind.TTD_SOP_KEPALA_OPD,
      pengajuanEvaluasi: {
        ...reminder().pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      },
      pengguna: {
        ...reminder().pengguna,
        opdId: 'opd-1',
        peran: PeranPengguna.KEPALA_OPD,
      },
    });
    expect(isReminderStillEligible(sameOpd)).toBe(true);
    expect(
      isReminderStillEligible({
        ...sameOpd,
        pengguna: { ...sameOpd.pengguna, opdId: 'opd-lain' },
      }),
    ).toBe(false);
  });
});
