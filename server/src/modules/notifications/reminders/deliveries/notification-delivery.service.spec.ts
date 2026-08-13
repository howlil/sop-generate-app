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
import type { NotificationDeliveryRecord } from './notification-delivery.types';

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
    const delivery = {
      pengirimanNotifikasiWhatsAppId: 'delivery-1',
      pengingatWhatsAppId: reminder.notificationReminderId,
      pengajuanEvaluasiId: reminder.pengajuanEvaluasiId,
      penggunaId: reminder.penggunaId,
      jenis: reminder.kind,
      idempotencyKey: 'sopflow-reminder:reminder-1:initial',
      transportMessageId,
      status: 'PENDING',
      errorCode: null,
      submittedAt: new Date('2026-08-13T08:00:00.000Z'),
      resolvedAt: null,
      createdAt: new Date('2026-08-13T08:00:00.000Z'),
      updatedAt: new Date('2026-08-13T08:00:00.000Z'),
    } as unknown as NotificationDeliveryRecord;
    const repository = {
      createOrGetPending: jest.fn().mockResolvedValue(delivery),
    } as unknown as NotificationDeliveryRepository;
    const webhookService = {
      reconcileTransportMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as WagoWebhookService;
    return {
      delivery,
      repository,
      webhookService,
      service: new NotificationDeliveryService(repository, webhookService),
    };
  }

  it('persists a correlatable receipt without reconciling before the reminder schedule is committed', async () => {
    const { delivery, repository, webhookService, service } = build('wamid-1');
    const submittedAt = new Date('2026-08-13T08:00:00.000Z');

    await expect(
      service.recordSubmission(
        reminder,
        'sopflow-reminder:reminder-1:initial',
        { transportMessageId: 'wamid-1', status: 'pending' },
        submittedAt,
      ),
    ).resolves.toBe(delivery);

    expect(repository.createOrGetPending).toHaveBeenCalledWith({
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'pengajuan-1',
      penggunaId: 'pengguna-1',
      kind: JenisPengingatWhatsApp.EVALUASI_SOP,
      idempotencyKey: 'sopflow-reminder:reminder-1:initial',
      transportMessageId: 'wamid-1',
      submittedAt,
    });
    expect(webhookService.reconcileTransportMessage).not.toHaveBeenCalled();
  });

  it('reconciles a persisted correlatable submission only when explicitly requested', async () => {
    const { delivery, webhookService, service } = build('wamid-1');
    const reconciliable = service as NotificationDeliveryService & {
      reconcileSubmission(value: NotificationDeliveryRecord): Promise<void>;
    };

    await reconciliable.reconcileSubmission(delivery);

    expect(webhookService.reconcileTransportMessage).toHaveBeenCalledWith('wamid-1');
  });

  it('does not invent correlation when the persisted logical occurrence has no transport id', async () => {
    const { delivery, webhookService, service } = build(null);
    const reconciliable = service as NotificationDeliveryService & {
      reconcileSubmission(value: NotificationDeliveryRecord): Promise<void>;
    };

    await service.recordSubmission(
      reminder,
      'sopflow-reminder:reminder-1:initial',
      { transportMessageId: null, status: 'pending' },
      new Date('2026-08-13T08:00:00.000Z'),
    );
    await reconciliable.reconcileSubmission(delivery);

    expect(webhookService.reconcileTransportMessage).not.toHaveBeenCalled();
  });
});
