import { Injectable } from '@nestjs/common';
import { JenisPengingatWhatsApp as NotificationReminderKind } from '../../../generated/prisma';
import type { ClaimedNotificationReminder } from './notification-reminder.types';

export type ReminderMessage = Readonly<{
  subject: string;
  title: string;
  preview: string;
  body: string;
}>;

@Injectable()
export class ReminderMessageFactory {
  build(reminder: ClaimedNotificationReminder): ReminderMessage {
    const recipientName = this.singleLine(reminder.pengguna.nama, 'Bapak/Ibu');
    const opdName = this.singleLine(reminder.pengajuanEvaluasi.opdNama, 'OPD terkait');
    const commonClosing =
      'Silakan membuka SOPFlow untuk menindaklanjuti.\n\n' +
      'Abaikan pesan ini apabila tindakan telah diselesaikan.';

    switch (reminder.kind) {
      case NotificationReminderKind.EVALUASI_SOP: {
        const preview = `Terdapat ${reminder.pengajuanEvaluasi.jumlahSop} SOP dari ${opdName} yang menunggu evaluasi.`;
        return {
          subject: 'SOPFlow: SOP menunggu evaluasi',
          title: 'SOP menunggu evaluasi',
          preview,
          body:
            '[SOPFlow]\n\n' +
            `Yth. Bapak/Ibu ${recipientName},\n\n` +
            `${preview}\n\n` +
            commonClosing,
        };
      }
      case NotificationReminderKind.TTD_BA_PJ_EVALUATOR:
      case NotificationReminderKind.TTD_BA_PJ_PENYUSUN: {
        const preview =
          `Berita Acara ${this.singleLine(reminder.pengajuanEvaluasi.nomorBA, '-')} ` +
          `dari ${opdName} menunggu tanda tangan elektronik Anda.`;
        return {
          subject: 'SOPFlow: Berita Acara menunggu TTE',
          title: 'Berita Acara menunggu TTE',
          preview,
          body:
            '[SOPFlow]\n\n' +
            `Yth. Bapak/Ibu ${recipientName},\n\n` +
            `${preview}\n\n` +
            commonClosing,
        };
      }
      case NotificationReminderKind.TTD_SOP_KEPALA_OPD: {
        const preview =
          `Dokumen SOP dari ${opdName} telah selesai diverifikasi dan menunggu pengesahan Anda.`;
        return {
          subject: 'SOPFlow: SOP menunggu pengesahan',
          title: 'SOP menunggu pengesahan',
          preview,
          body:
            '[SOPFlow]\n\n' +
            `Yth. Bapak/Ibu ${recipientName},\n\n` +
            `${preview}\n\n` +
            commonClosing,
        };
      }
      default:
        throw new Error(`Unhandled reminder kind: ${String(reminder.kind)}`);
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
