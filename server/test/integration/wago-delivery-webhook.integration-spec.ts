import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import {
  JenisPengajuanEvaluasi,
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusPengirimanNotifikasiWhatsApp,
} from '../../src/generated/prisma';
import { WagoWebhookService } from '../../src/modules/notifications/reminders/webhooks/wago-webhook.service';
import type { TrustedWagoWebhookEvent } from '../../src/modules/notifications/reminders/webhooks/wago-webhook.types';
import {
  assertSafeIntegrationDatabase,
  pingIntegrationDatabase,
  resetIntegrationDatabase,
} from './helpers/integration-database.util';
import { isIntegrationEnabled } from './helpers/integration-runtime.util';

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip;
const TEST_PASSWORD_HASH = 'x'.repeat(60);

function rejectedEvent(
  webhookId: string,
  messageId: string,
  createdAt: Date,
): TrustedWagoWebhookEvent {
  return {
    version: '1',
    id: webhookId,
    event: 'message.rejected',
    createdAt,
    data: {
      messageId,
      status: 'rejected',
      error: 'MESSAGE_REJECTED',
    },
  };
}

describeIntegration('Wago delivery webhook integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let webhookService: WagoWebhookService;

  beforeAll(async () => {
    assertSafeIntegrationDatabase();
    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    webhookService = app.get(WagoWebhookService);
    await pingIntegrationDatabase(prisma);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase(prisma);
  });

  afterAll(async () => {
    try {
      if (prisma !== undefined) await resetIntegrationDatabase(prisma);
    } finally {
      if (app !== undefined) await app.close();
    }
  });

  it('persists delivery state and accelerates only the latest current reminder occurrence', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD Wago Integration' } });
    const evaluator = await prisma.pengguna.create({
      data: {
        email: 'wago-eval@test.local',
        opdId: opd.opdId,
        nama: 'Evaluator Wago',
        kataSandi: TEST_PASSWORD_HASH,
        peran: PeranPengguna.EVALUATOR,
        nip: '123456789012345678',
        jabatan: 'Evaluator',
        pangkat: 'Penata',
        nohp: '081234567890',
      },
    });
    const pengajuan = await prisma.pengajuanEvaluasi.create({
      data: {
        opdId: opd.opdId,
        jenis: JenisPengajuanEvaluasi.EVALUASI_REQUEST_OPD,
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      },
    });
    const initialNextSendAt = new Date(Date.now() + 24 * 60 * 60_000);
    const reminder = await prisma.pengingatWhatsApp.create({
      data: {
        pengajuanEvaluasiId: pengajuan.pengajuanEvaluasiId,
        penggunaId: evaluator.penggunaId,
        jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        nomorTujuan: evaluator.nohp,
        nextSendAt: initialNextSendAt,
      },
    });
    const firstSubmittedAt = new Date(Date.now() + 30 * 60_000);
    const firstDelivery = await prisma.pengirimanNotifikasiWhatsApp.create({
      data: {
        pengingatWhatsAppId: reminder.pengingatWhatsAppId,
        pengajuanEvaluasiId: pengajuan.pengajuanEvaluasiId,
        penggunaId: evaluator.penggunaId,
        jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        idempotencyKey: `sopflow-reminder:${reminder.pengingatWhatsAppId}:initial`,
        transportMessageId: 'wamid-integration-1',
        submittedAt: firstSubmittedAt,
      },
    });
    const receivedAt = new Date(Date.now() + 60 * 60_000);
    const event = rejectedEvent(
      'webhook-integration-1',
      'wamid-integration-1',
      new Date(receivedAt.getTime() - 1_000),
    );

    await expect(webhookService.ingest(event, receivedAt)).resolves.toBe('processed');

    const [resolvedDelivery, acceleratedReminder, inbox] = await Promise.all([
      prisma.pengirimanNotifikasiWhatsApp.findUniqueOrThrow({
        where: { pengirimanNotifikasiWhatsAppId: firstDelivery.pengirimanNotifikasiWhatsAppId },
      }),
      prisma.pengingatWhatsApp.findUniqueOrThrow({
        where: { pengingatWhatsAppId: reminder.pengingatWhatsAppId },
      }),
      prisma.wagoWebhookEvent.findUniqueOrThrow({ where: { webhookId: event.id } }),
    ]);
    expect(resolvedDelivery.status).toBe(StatusPengirimanNotifikasiWhatsApp.REJECTED);
    expect(resolvedDelivery.errorCode).toBe('MESSAGE_REJECTED');
    expect(acceleratedReminder.nextSendAt).toEqual(new Date(receivedAt.getTime() + 5 * 60_000));
    expect(inbox.processedAt).not.toBeNull();

    await expect(webhookService.ingest(event, new Date(receivedAt.getTime() + 2_000))).resolves.toBe(
      'duplicate',
    );
    const afterDuplicate = await prisma.pengingatWhatsApp.findUniqueOrThrow({
      where: { pengingatWhatsAppId: reminder.pengingatWhatsAppId },
    });
    expect(afterDuplicate.nextSendAt).toEqual(acceleratedReminder.nextSendAt);

    await prisma.pengirimanNotifikasiWhatsApp.create({
      data: {
        pengingatWhatsAppId: reminder.pengingatWhatsAppId,
        pengajuanEvaluasiId: pengajuan.pengajuanEvaluasiId,
        penggunaId: evaluator.penggunaId,
        jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        idempotencyKey: `sopflow-reminder:${reminder.pengingatWhatsAppId}:next`,
        transportMessageId: 'wamid-integration-2',
        submittedAt: new Date(firstSubmittedAt.getTime() + 10 * 60_000),
      },
    });
    const protectedNextSendAt = new Date(Date.now() + 2 * 24 * 60 * 60_000);
    await prisma.pengingatWhatsApp.update({
      where: { pengingatWhatsAppId: reminder.pengingatWhatsAppId },
      data: { nextSendAt: protectedNextSendAt },
    });

    await expect(
      webhookService.ingest(
        rejectedEvent(
          'webhook-integration-stale',
          'wamid-integration-1',
          new Date(receivedAt.getTime() + 3_000),
        ),
        new Date(receivedAt.getTime() + 4_000),
      ),
    ).resolves.toBe('processed');
    const afterStale = await prisma.pengingatWhatsApp.findUniqueOrThrow({
      where: { pengingatWhatsAppId: reminder.pengingatWhatsAppId },
    });
    expect(afterStale.nextSendAt).toEqual(protectedNextSendAt);

    await prisma.pengingatWhatsApp.delete({
      where: { pengingatWhatsAppId: reminder.pengingatWhatsAppId },
    });
    const historicalDelivery = await prisma.pengirimanNotifikasiWhatsApp.findUniqueOrThrow({
      where: { pengirimanNotifikasiWhatsAppId: firstDelivery.pengirimanNotifikasiWhatsAppId },
    });
    expect(historicalDelivery.pengingatWhatsAppId).toBe(reminder.pengingatWhatsAppId);
  });
});
