import {
  JenisPengingatWhatsApp as NotificationReminderKind,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';
import { ReminderMessageFactory } from './reminder-message.factory';

type ReminderParams = Readonly<{
  kind: NotificationReminderKind;
  status: StatusPengajuanEvaluasi;
  role: PeranPengguna;
  nama?: string;
  opdNama?: string;
  nomorBA?: string | null;
  jumlahSop?: number;
}>;

function reminder(params: ReminderParams): ClaimedNotificationReminder {
  return {
    notificationReminderId: 'reminder-1',
    pengajuanEvaluasiId: 'pengajuan-1',
    penggunaId: 'user-1',
    kind: params.kind,
    destination: '6281234567890',
    consecutiveFailures: 0,
    lockToken: null,
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'pengajuan-1',
      opdId: 'opd-a',
      opdNama: params.opdNama ?? 'Dinas Kesehatan',
      nomorBA: params.nomorBA ?? 'BA-001',
      status: params.status,
      jumlahSop: params.jumlahSop ?? 2,
    },
    pengguna: {
      penggunaId: 'user-1',
      opdId: 'opd-a',
      email: 'recipient@example.test',
      nama: params.nama ?? 'Penerima Uji',
      peran: params.role,
      nohp: '6281234567890',
      deletedAt: null,
    },
  };
}

describe('ReminderMessageFactory', () => {
  const factory = new ReminderMessageFactory();

  it('membangun pesan evaluasi SOP dengan jumlah dokumen dan OPD', () => {
    const message = factory.build(
      reminder({
        kind: NotificationReminderKind.EVALUASI_SOP,
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        role: PeranPengguna.EVALUATOR,
        jumlahSop: 3,
      }),
    );

    expect(message.title).toBe('Menunggu Proses Evaluasi SOP');
    expect(message.preview).toContain('3 dokumen SOP');
    expect(message.preview).toContain('Dinas Kesehatan');
    expect(message.body).toContain('Yth. Bapak/Ibu Penerima Uji');
    expect(message.body).toContain('Pesan ini dihasilkan secara otomatis');
  });

  it.each([
    [
      NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
      StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      PeranPengguna.PJ_EVALUATOR,
    ],
    [
      NotificationReminderKind.TTD_BA_PJ_PENYUSUN,
      StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
      PeranPengguna.PJ_PENYUSUN,
    ],
  ])('membangun pesan TTE berita acara untuk kind %s', (kind, status, role) => {
    const message = factory.build(
      reminder({
        kind,
        status,
        role,
        nomorBA: 'BA-2026-001',
      }),
    );

    expect(message.title).toBe('Berita Acara Menunggu TTE');
    expect(message.preview).toContain('BA-2026-001');
    expect(message.body).toContain('Tanda Tangan Elektronik (TTE)');
  });

  it('membangun pesan pengesahan Kepala OPD', () => {
    const message = factory.build(
      reminder({
        kind: NotificationReminderKind.TTD_SOP_KEPALA_OPD,
        status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
        role: PeranPengguna.KEPALA_OPD,
      }),
    );

    expect(message.title).toBe('Dokumen SOP Menunggu Pengesahan');
    expect(message.subject).toContain('TTE Kepala OPD');
    expect(message.body).toContain('Kepala OPD terkait');
  });

  it('menormalisasi whitespace pada nama penerima, nama OPD, dan nomor BA', () => {
    const message = factory.build(
      reminder({
        kind: NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
        status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        role: PeranPengguna.PJ_EVALUATOR,
        nama: '  Ani\n\t  Putri  ',
        opdNama: '\tDinas   Kominfo\n',
        nomorBA: '  BA-01\n  ',
      }),
    );

    expect(message.body).toContain('Yth. Bapak/Ibu Ani Putri');
    expect(message.preview).toContain('Dinas Kominfo');
    expect(message.preview).toContain('BA-01');
    expect(message.body).not.toContain('\n\t');
  });

  it('menggunakan fallback aman ketika nama, OPD, atau nomor BA kosong', () => {
    const value = reminder({
      kind: NotificationReminderKind.TTD_BA_PJ_EVALUATOR,
      status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      role: PeranPengguna.PJ_EVALUATOR,
      nomorBA: null,
    });
    const message = factory.build({
      ...value,
      pengguna: { ...value.pengguna, nama: '   ' },
      pengajuanEvaluasi: {
        ...value.pengajuanEvaluasi,
        opdNama: '\n\t',
        nomorBA: null,
      },
    });

    expect(message.body).toContain('Yth. Bapak/Ibu Bapak/Ibu');
    expect(message.preview).toContain('OPD terkait');
    expect(message.preview).toContain('nomor -');
  });

  it('gagal tegas untuk reminder kind yang belum ditangani', () => {
    const value = reminder({
      kind: NotificationReminderKind.EVALUASI_SOP,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      role: PeranPengguna.EVALUATOR,
    });

    expect(() =>
      factory.build({ ...value, kind: 'UNHANDLED_KIND' as NotificationReminderKind }),
    ).toThrow('Unhandled reminder kind: UNHANDLED_KIND');
  });
});
