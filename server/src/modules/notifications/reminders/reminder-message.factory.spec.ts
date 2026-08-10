import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import { ReminderMessageFactory } from './reminder-message.factory';
import type { ClaimedNotificationReminder } from './notification-reminder.types';

function reminder(
  kind: NotificationReminderKind,
  overrides: Partial<ClaimedNotificationReminder> = {},
): ClaimedNotificationReminder {
  const statusByKind: Record<NotificationReminderKind, StatusPengajuanEvaluasi> = {
    [NotificationReminderKind.EVALUASI_SOP]: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
    [NotificationReminderKind.TTD_BA_PJ_EVALUATOR]: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
    [NotificationReminderKind.TTD_BA_PJ_PENYUSUN]:
      StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
    [NotificationReminderKind.TTD_SOP_KEPALA_OPD]:
      StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
  };
  const base: ClaimedNotificationReminder = {
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
      nomorBA: 'BA-001/2026',
      status: statusByKind[kind],
      jumlahSop: 3,
    },
    pengguna: {
      penggunaId: 'user-1',
      opdId: 'opd-1',
      email: 'user@example.test',
      nama: 'Pengguna Uji',
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

describe('ReminderMessageFactory', () => {
  const factory = new ReminderMessageFactory();

  it('membangun pesan evaluasi dengan jumlah SOP dan OPD', () => {
    const message = factory.build(reminder(NotificationReminderKind.EVALUASI_SOP));
    expect(message.title).toBe('Menunggu Proses Evaluasi SOP');
    expect(message.preview).toContain('3 dokumen SOP');
    expect(message.body).toContain('Dinas Kesehatan');
    expect(message.body).toContain('Pengguna Uji');
  });

  it.each([
    NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
    NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
  ])('membangun pesan TTE berita acara untuk %s', (kind) => {
    const message = factory.build(reminder(kind));
    expect(message.title).toBe('Berita Acara Menunggu TTE');
    expect(message.preview).toContain('BA-001/2026');
    expect(message.body).toContain('verifikasi serta pengesahan');
  });

  it('membangun pesan pengesahan Kepala OPD', () => {
    const message = factory.build(reminder(NotificationReminderKind.TTD_SOP_KEPALA_OPD));
    expect(message.title).toBe('Dokumen SOP Menunggu Pengesahan');
    expect(message.body).toContain('Kepala OPD terkait');
  });

  it('menormalisasi whitespace dan memakai fallback untuk identitas kosong', () => {
    const message = factory.build(
      reminder(NotificationReminderKind.TTD_BA_PJ_EVALUATOR, {
        pengguna: {
          ...reminder(NotificationReminderKind.TTD_BA_PJ_EVALUATOR).pengguna,
          nama: '  Nama\n\t  Bersih  ',
        },
        pengajuanEvaluasi: {
          ...reminder(NotificationReminderKind.TTD_BA_PJ_EVALUATOR).pengajuanEvaluasi,
          opdNama: '   ',
          nomorBA: null,
        },
      }),
    );
    expect(message.body).toContain('Nama Bersih');
    expect(message.body).toContain('OPD terkait');
    expect(message.preview).toContain('nomor -');
  });

  it('memakai fallback nama penerima ketika nama kosong', () => {
    const message = factory.build(
      reminder(NotificationReminderKind.EVALUASI_SOP, {
        pengguna: {
          ...reminder(NotificationReminderKind.EVALUASI_SOP).pengguna,
          nama: '',
        },
      }),
    );
    expect(message.body).toContain('Yth. Bapak/Ibu Bapak/Ibu');
  });

  it('fail fast jika jenis reminder tidak dikenal', () => {
    const invalid = {
      ...reminder(NotificationReminderKind.EVALUASI_SOP),
      kind: 'UNKNOWN_KIND',
    } as unknown as ClaimedNotificationReminder;
    expect(() => factory.build(invalid)).toThrow('Unhandled reminder kind: UNKNOWN_KIND');
  });
});
