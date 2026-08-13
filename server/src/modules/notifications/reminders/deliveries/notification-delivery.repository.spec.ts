/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  JenisPengingatWhatsApp,
  StatusPengirimanNotifikasiWhatsApp,
} from '../../../../generated/prisma';
import { NotificationDeliveryRepository } from './notification-delivery.repository';

describe('NotificationDeliveryRepository', () => {
  const pendingRow = {
    pengirimanNotifikasiWhatsAppId: 'delivery-1',
    pengingatWhatsAppId: 'reminder-1',
    pengajuanEvaluasiId: 'submission-1',
    penggunaId: 'user-1',
    jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
    idempotencyKey: 'sopflow-reminder:reminder-1:initial',
    transportMessageId: 'wamid-1',
    status: StatusPengirimanNotifikasiWhatsApp.PENDING,
    errorCode: null,
    submittedAt: new Date('2026-08-13T08:00:00.000Z'),
    resolvedAt: null,
    createdAt: new Date('2026-08-13T08:00:00.000Z'),
    updatedAt: new Date('2026-08-13T08:00:00.000Z'),
  };

  const prismaMock = {
    pengirimanNotifikasiWhatsApp: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  let repository: NotificationDeliveryRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new NotificationDeliveryRepository(prismaMock as unknown as PrismaService);
  });

  it('reuses an existing delivery with the same idempotency key', async () => {
    prismaMock.pengirimanNotifikasiWhatsApp.findUnique.mockResolvedValueOnce(pendingRow);

    await expect(
      repository.createOrGetPending({
        notificationReminderId: 'reminder-1',
        pengajuanEvaluasiId: 'submission-1',
        penggunaId: 'user-1',
        kind: JenisPengingatWhatsApp.EVALUASI_SOP,
        idempotencyKey: 'sopflow-reminder:reminder-1:initial',
        transportMessageId: 'wamid-1',
        submittedAt: new Date('2026-08-13T08:01:00.000Z'),
      }),
    ).resolves.toEqual(expect.objectContaining({ pengirimanNotifikasiWhatsAppId: 'delivery-1' }));

    expect(prismaMock.pengirimanNotifikasiWhatsApp.create).not.toHaveBeenCalled();
  });

  it('creates a pending delivery when the idempotency key is new', async () => {
    prismaMock.pengirimanNotifikasiWhatsApp.findUnique.mockResolvedValueOnce(null);
    prismaMock.pengirimanNotifikasiWhatsApp.create.mockResolvedValueOnce(pendingRow);
    const submittedAt = new Date('2026-08-13T08:00:00.000Z');

    await repository.createOrGetPending({
      notificationReminderId: 'reminder-1',
      pengajuanEvaluasiId: 'submission-1',
      penggunaId: 'user-1',
      kind: JenisPengingatWhatsApp.EVALUASI_SOP,
      idempotencyKey: 'sopflow-reminder:reminder-1:initial',
      transportMessageId: 'wamid-1',
      submittedAt,
    });

    expect(prismaMock.pengirimanNotifikasiWhatsApp.create).toHaveBeenCalledWith({
      data: {
        pengingatWhatsAppId: 'reminder-1',
        pengajuanEvaluasiId: 'submission-1',
        penggunaId: 'user-1',
        jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
        idempotencyKey: 'sopflow-reminder:reminder-1:initial',
        transportMessageId: 'wamid-1',
        submittedAt,
      },
    });
  });

  it('finds the latest delivery by reminder identity', async () => {
    prismaMock.pengirimanNotifikasiWhatsApp.findFirst.mockResolvedValueOnce(pendingRow);

    await repository.findLatestForIdentity(
      'submission-1',
      'user-1',
      JenisPengingatWhatsApp.EVALUASI_SOP,
    );

    expect(prismaMock.pengirimanNotifikasiWhatsApp.findFirst).toHaveBeenCalledWith({
      where: {
        pengajuanEvaluasiId: 'submission-1',
        penggunaId: 'user-1',
        jenis: JenisPengingatWhatsApp.EVALUASI_SOP,
      },
      orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
    });
  });

  it('transitions pending delivery to accepted only once', async () => {
    prismaMock.pengirimanNotifikasiWhatsApp.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    const resolvedAt = new Date('2026-08-13T08:05:00.000Z');

    await expect(repository.markAccepted('delivery-1', resolvedAt)).resolves.toBe('updated');
    await expect(repository.markAccepted('delivery-1', resolvedAt)).resolves.toBe(
      'already-terminal',
    );

    expect(prismaMock.pengirimanNotifikasiWhatsApp.updateMany).toHaveBeenCalledWith({
      where: {
        pengirimanNotifikasiWhatsAppId: 'delivery-1',
        status: StatusPengirimanNotifikasiWhatsApp.PENDING,
      },
      data: {
        status: StatusPengirimanNotifikasiWhatsApp.ACCEPTED,
        errorCode: null,
        resolvedAt,
      },
    });
  });

  it('transitions pending delivery to rejected with a bounded error code', async () => {
    prismaMock.pengirimanNotifikasiWhatsApp.updateMany.mockResolvedValueOnce({ count: 1 });
    const resolvedAt = new Date('2026-08-13T08:05:00.000Z');

    await expect(
      repository.markRejected('delivery-1', 'MESSAGE_REJECTED', resolvedAt),
    ).resolves.toBe('updated');

    expect(prismaMock.pengirimanNotifikasiWhatsApp.updateMany).toHaveBeenCalledWith({
      where: {
        pengirimanNotifikasiWhatsAppId: 'delivery-1',
        status: StatusPengirimanNotifikasiWhatsApp.PENDING,
      },
      data: {
        status: StatusPengirimanNotifikasiWhatsApp.REJECTED,
        errorCode: 'MESSAGE_REJECTED',
        resolvedAt,
      },
    });
  });
});
