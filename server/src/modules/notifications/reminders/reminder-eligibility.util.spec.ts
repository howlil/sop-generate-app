import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { isReminderStillEligible } from './reminder-eligibility.util';

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
    lockToken: null,
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

describe('isReminderStillEligible', () => {
  it('menerima reminder evaluasi ketika status, role, dan user masih aktif', () => {
    expect(isReminderStillEligible(reminder())).toBe(true);
  });

  it('menolak reminder ketika status pengajuan sudah berpindah', () => {
    expect(
      isReminderStillEligible(
        reminder({
          pengajuanEvaluasi: {
            pengajuanEvaluasiId: 'pengajuan-1',
            opdId: 'opd-a',
            opdNama: 'OPD A',
            nomorBA: null,
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
            jumlahSop: 1,
          },
        }),
      ),
    ).toBe(false);
  });

  it('menolak reminder untuk pengguna yang sudah dinonaktifkan', () => {
    expect(
      isReminderStillEligible(
        reminder({ pengguna: { ...reminder().pengguna, deletedAt: new Date() } }),
      ),
    ).toBe(false);
  });

  it('menolak reminder ketika role penerima tidak sesuai kind', () => {
    expect(
      isReminderStillEligible(
        reminder({ pengguna: { ...reminder().pengguna, peran: PeranPengguna.PENYUSUN } }),
      ),
    ).toBe(false);
  });

  it('mewajibkan PJ Penyusun berasal dari OPD pengajuan', () => {
    const base = reminder({
      kind: NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
      pengajuanEvaluasi: {
        ...reminder().pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
      },
      pengguna: {
        ...reminder().pengguna,
        peran: PeranPengguna.PJ_PENYUSUN,
      },
    });

    expect(isReminderStillEligible(base)).toBe(true);
    expect(
      isReminderStillEligible({
        ...base,
        pengguna: { ...base.pengguna, opdId: 'opd-b' },
      }),
    ).toBe(false);
  });

  it('mewajibkan Kepala OPD berasal dari OPD pengajuan', () => {
    const base = reminder({
      kind: NotificationReminderKind.TTD_SOP_KEPALA_OPD,
      pengajuanEvaluasi: {
        ...reminder().pengajuanEvaluasi,
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      },
      pengguna: {
        ...reminder().pengguna,
        peran: PeranPengguna.KEPALA_OPD,
      },
    });

    expect(isReminderStillEligible(base)).toBe(true);
    expect(
      isReminderStillEligible({
        ...base,
        pengguna: { ...base.pengguna, opdId: 'opd-b' },
      }),
    ).toBe(false);
  });

  it('tidak menerapkan pembatasan OPD tambahan untuk PJ Evaluator', () => {
    expect(
      isReminderStillEligible(
        reminder({
          kind: NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
          pengajuanEvaluasi: {
            ...reminder().pengajuanEvaluasi,
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          },
          pengguna: {
            ...reminder().pengguna,
            opdId: 'opd-biro',
            peran: PeranPengguna.PJ_EVALUATOR,
          },
        }),
      ),
    ).toBe(true);
  });
});
