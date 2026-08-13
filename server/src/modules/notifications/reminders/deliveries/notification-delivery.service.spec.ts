/* eslint-disable @typescript-eslint/unbound-method */
import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../../generated/prisma';
import type { ClaimedNotificationReminder } from '../notification-reminder.types';
import { WagoWebhookService } from '../webhooks/wago-webhook.service';
import { NotificationDeliveryRepository } from './notification-delivery.repository';
import { NotificationDeliveryService } from './notification-delivery.service';

describe('NotificationDeliveryService', () => {
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

  function build(transportMessageId: string | null) {
    const repository = {
      createOrGetPending: jest.fn().mockResolvedValue({
        pengirimanNotifikasiWhatsAppId: 'delivery-1',
        transportMessageId,
      }),
    } as unknown as NotificationDeliveryRepository;
    const webhookService = {
      reconcileTransportMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as WagoWebhookService;
    return {
      repository,
      webhookService,
      service: new NotificationDeliveryService(repository, webhookService),
    };
  }

  it('maps a claimed reminder and reconciles a correlatable transport receipt', async () => {
    const { repository, webhookService, service } = build('wamid-1');
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
    expect(webhookService.reconcileTransportMessage).toHaveBeenCalledWith('wamid-1');
  });

  it('does not invent correlation when the persisted logical occurrence has no transport id', async () => {
    const { webhookService, service } = build(null);

    await service.recordSubmission(
      reminder,
      'sopflow-reminder:reminder-1:initial',
      { transportMessageId: null, status: 'pending' },
      new Date('2026-08-13T08:00:00.000Z'),
    );

    expect(webhookService.reconcileTransportMessage).not.toHaveBeenCalled();
  });
});
