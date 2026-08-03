import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';
import { WhatsappMessageFactory } from './whatsapp-message.factory';
import type { ClaimedWhatsappReminder } from './whatsapp-reminder.types';

function claimed(jenis: JenisPengingatWhatsApp): ClaimedWhatsappReminder {
  return {
    pengingatWhatsAppId: 'r-1',
    pengajuanEvaluasiId: 'p-1',
    penggunaId: 'u-1',
    jenis,
    nomorTujuan: '628111111111',
    consecutiveFailures: 0,
    lockToken: 'lock',
    pengajuanEvaluasi: {
      pengajuanEvaluasiId: 'p-1',
      opdId: 'opd-1',
      opdNama: 'Dinas\nKesehatan',
      nomorBA: 'BA-001',
      status:
        jenis === JenisPengingatWhatsApp.EVALUASI_SOP
          ? StatusPengajuanEvaluasi.SEDANG_DIEVALUASI
          : StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      jumlahSop: 3,
    },
    pengguna: {
      penggunaId: 'u-1',
      opdId: 'opd-1',
      nama: 'Budi\nSantoso',
      nohp: '081111111111',
      peran:
        jenis === JenisPengingatWhatsApp.EVALUASI_SOP
          ? PeranPengguna.EVALUATOR
          : PeranPengguna.PJ_EVALUATOR,
      deletedAt: null,
    },
  };
}

describe('WhatsappMessageFactory', () => {
  it('membuat pesan evaluasi tanpa link dan membersihkan line break input', () => {
    const message = new WhatsappMessageFactory().build(
      claimed(JenisPengingatWhatsApp.EVALUASI_SOP),
    );
    expect(message).toContain('Budi Santoso');
    expect(message).toContain('Terdapat 3 SOP dari Dinas Kesehatan');
    expect(message).toContain('Abaikan pesan ini');
    expect(message).not.toMatch(/https?:\/\//);
  });

  it('membuat pesan tanda tangan berita acara', () => {
    const message = new WhatsappMessageFactory().build(
      claimed(JenisPengingatWhatsApp.TTD_BA_PJ_EVALUATOR),
    );
    expect(message).toContain('Berita Acara BA-001');
    expect(message).toContain('tanda tangan elektronik');
  });
});
