import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../../generated/prisma';
import type { ClaimedNotificationReminder } from '../notification-reminder.types';
import { NotificationDeliveryRepository } from './notification-delivery.repository';
import { NotificationDeliveryService } from './notification-delivery.service';

describe('NotificationDeliveryService', () => {
  it('maps a claimed reminder and transport receipt into one pending delivery occurrence', async () => {
    const repository = {
      createOrGetPending: jest.fn().mockResolvedValue({
        pengirimanNotifikasiWhatsAppId: 'delivery-1',
      }),
    } as unknown as NotificationDeliveryRepository;
    const service = new NotificationDeliveryService(repository);
    const reminder: ClaimedNotificationReminder = {
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'pengajuan-1',
      penggunaId: 'pengguna-1',
      kind: JenisPengingatWhatsApp.EVALUASI_SOP,
      destination: '085373945490',
      lastSentAt: null,
      consecutiveFailures: 0,
      lockToken: 'lock-1',
      pengajuanEvaluasi: {
        pengajuanEvaluasiId: 'pengajuan-1',
        opdId: 'opd-1',
        opdNama: 'OPD Uji',
        nomorBA: null,
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        jumlahSop: 1,
      },
      pengguna: {
        penggunaId: 'pengguna-1',
        opdId: 'opd-2',
        email: 'evaluator@example.test',
        nama: 'Evaluator Uji',
        peran: PeranPengguna.EVALUATOR,
        nohp: '085373945490',
        deletedAt: null,
      },
    };
    const submittedAt = new Date('2026-08-13T08:00:00.000Z');

    await service.recordSubmission(
      reminder,
      'sopflow-reminder:reminder-1:initial',
      { transportMessageId: 'wamid-1', status: 'pending' },
      submittedAt,
    );

    expect(repository.createOrGetPending).toHaveBeenCalledWith({
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'pengajuan-1',
      penggunaId: 'pengguna-1',
      kind: JenisPengingatWhatsApp.EVALUASI_SOP,
      idempotencyKey: 'sopflow-reminder:reminder-1:initial',
      transportMessageId: 'wamid-1',
      submittedAt,
    });
  });
});
