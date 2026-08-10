import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { ReminderMessageFactory } from './reminder-message.factory';

describe('ReminderMessageFactory', () => {
  const factory = new ReminderMessageFactory();

  function reminder(
    kind: NotificationReminderKind,
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
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jumlahSop: 2,
      },
      pengguna: {
        penggunaId: 'user-1',
        opdId: 'opd-1',
        email: 'user@example.test',
        nama: 'Budi',
        peran: PeranPengguna.EVALUATOR,
        nohp: '6281234567890',
        deletedAt: null,
      },
      ...overrides,
    };
  }

  it('membangun pesan evaluasi dan menormalisasi nama multi-line', () => {
    const result = factory.build(
      reminder(NotificationReminderKind.EVALUASI_SOP, {
        pengguna: {
          penggunaId: 'user-1',
          opdId: 'opd-1',
          email: 'user@example.test',
          nama: '  Budi\n  Santoso  ',
          peran: PeranPengguna.EVALUATOR,
          nohp: '6281234567890',
          deletedAt: null,
        },
      }),
    );

    expect(result.title).toBe('Menunggu Proses Evaluasi SOP');
    expect(result.preview).toContain('2 dokumen SOP dari Dinas Kesehatan');
    expect(result.body).toContain('Yth. Bapak/Ibu Budi Santoso');
  });

  it.each([
    NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
    NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
  ])('membangun pesan TTE berita acara untuk %s', (kind) => {
    const result = factory.build(
      reminder(kind, {
        pengajuanEvaluasi: {
          pengajuanEvaluasiId: 'pengajuan-1',
          opdId: 'opd-1',
          opdNama: 'Dinas Kesehatan',
          nomorBA: ' BA-001\nREV ',
          status:
            kind === NotificationReminderKind.TTD_BA_PJ_EVALUATOR
              ? StatusPengajuanEvaluasi.SELESAI_DIEVALUASI
              : StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
          jumlahSop: 2,
        },
      }),
    );

    expect(result.title).toBe('Berita Acara Menunggu TTE');
    expect(result.preview).toContain('BA-001 REV');
  });

  it('membangun pesan pengesahan Kepala OPD', () => {
    const result = factory.build(
      reminder(NotificationReminderKind.TTD_SOP_KEPALA_OPD, {
        pengguna: {
          penggunaId: 'user-1',
          opdId: 'opd-1',
          email: 'kepala@example.test',
          nama: 'Kepala OPD',
          peran: PeranPengguna.KEPALA_OPD,
          nohp: '6281234567890',
          deletedAt: null,
        },
        pengajuanEvaluasi: {
          pengajuanEvaluasiId: 'pengajuan-1',
          opdId: 'opd-1',
          opdNama: 'Dinas Kesehatan',
          nomorBA: 'BA-001',
          status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
          jumlahSop: 2,
        },
      }),
    );

    expect(result.title).toBe('Dokumen SOP Menunggu Pengesahan');
    expect(result.body).toContain('Kepala OPD terkait');
  });

  it('menggunakan fallback untuk nama, OPD, dan nomor BA kosong', () => {
    const result = factory.build(
      reminder(NotificationReminderKind.TTD_BA_PJ_EVALUATOR, {
        pengguna: {
          penggunaId: 'user-1',
          opdId: 'opd-1',
          email: 'user@example.test',
          nama: '   ',
          peran: PeranPengguna.PJ_EVALUATOR,
          nohp: '6281234567890',
          deletedAt: null,
        },
        pengajuanEvaluasi: {
          pengajuanEvaluasiId: 'pengajuan-1',
          opdId: 'opd-1',
          opdNama: '',
          nomorBA: null,
          status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          jumlahSop: 1,
        },
      }),
    );

    expect(result.body).toContain('Yth. Bapak/Ibu Bapak/Ibu');
    expect(result.preview).toContain('nomor -');
    expect(result.preview).toContain('OPD terkait');
  });

  it('fail closed untuk jenis reminder yang tidak dikenal', () => {
    expect(() =>
      factory.build(
        reminder('UNKNOWN' as NotificationReminderKind),
      ),
    ).toThrow('Unhandled reminder kind: UNKNOWN');
  });
});
