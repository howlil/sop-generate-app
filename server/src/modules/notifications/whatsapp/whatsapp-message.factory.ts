import { Injectable } from '@nestjs/common';
import { JenisPengingatWhatsApp } from '../../../generated/prisma';
import type { ClaimedWhatsappReminder } from './whatsapp-reminder.types';

@Injectable()
export class WhatsappMessageFactory {
  build(reminder: ClaimedWhatsappReminder): string {
    const recipientName = this.singleLine(reminder.pengguna.nama, 'Bapak/Ibu');
    const opdName = this.singleLine(reminder.pengajuanEvaluasi.opdNama, 'OPD terkait');
    const commonClosing =
      'Silakan membuka SOPFlow untuk menindaklanjuti.\n\n' +
      'Abaikan pesan ini apabila tindakan telah diselesaikan.';

    switch (reminder.jenis) {
      case JenisPengingatWhatsApp.EVALUASI_SOP:
        return (
          '[SOPFlow]\n\n' +
          `Yth. Bapak/Ibu ${recipientName},\n\n` +
          `Terdapat ${reminder.pengajuanEvaluasi.jumlahSop} SOP dari ${opdName} yang menunggu evaluasi.\n\n` +
          commonClosing
        );
      case JenisPengingatWhatsApp.TTD_BA_PJ_EVALUATOR:
      case JenisPengingatWhatsApp.TTD_BA_PJ_PENYUSUN:
        return (
          '[SOPFlow]\n\n' +
          `Yth. Bapak/Ibu ${recipientName},\n\n` +
          `Berita Acara ${this.singleLine(reminder.pengajuanEvaluasi.nomorBA, '-')} dari ${opdName} ` +
          'menunggu tanda tangan elektronik Anda.\n\n' +
          commonClosing
        );
      case JenisPengingatWhatsApp.TTD_SOP_KEPALA_OPD:
        return (
          '[SOPFlow]\n\n' +
          `Yth. Bapak/Ibu ${recipientName},\n\n` +
          `Dokumen SOP dari ${opdName} telah selesai diverifikasi dan menunggu pengesahan Anda.\n\n` +
          commonClosing
        );
    }
  }

  private singleLine(value: string | null | undefined, fallback: string): string {
    const normalized = value
      ?.replace(/[\r\n\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }
}
