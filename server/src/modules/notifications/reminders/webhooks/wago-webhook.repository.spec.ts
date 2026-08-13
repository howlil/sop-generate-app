import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';
import { WagoWebhookRepository } from './wago-webhook.repository';

const acceptedEvent: TrustedWagoWebhookEvent = {
  version: '1',
  id: 'delivery-1',
  event: 'message.server_accepted',
  createdAt: new Date('2026-08-13T08:00:00.000Z'),
  data: { messageId: 'wamid-1', status: 'accepted' },
};

describe('WagoWebhookRepository', () => {
  const prismaMock = {
    wagoWebhookEvent: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  let repository: WagoWebhookRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new WagoWebhookRepository(prismaMock as unknown as PrismaService);
  });

  it('persists the first webhook id with sanitized fields only', async () => {
    prismaMock.wagoWebhookEvent.createMany.mockResolvedValueOnce({ count: 1 });
    const receivedAt = new Date('2026-08-13T08:00:01.000Z');

    await expect(repository.insertIfNew(acceptedEvent, receivedAt)).resolves.toBe('inserted');

    expect(prismaMock.wagoWebhookEvent.createMany).toHaveBeenCalledWith({
      data: {
        webhookId: 'delivery-1',
        transportMessageId: 'wamid-1',
        event: 'message.server_accepted',
        status: 'accepted',
        errorCode: null,
        sourceCreatedAt: acceptedEvent.createdAt,
        receivedAt,
      },
      skipDuplicates: true,
    });
  });

  it('treats an existing webhook id as an idempotent duplicate', async () => {
    prismaMock.wagoWebhookEvent.createMany.mockResolvedValueOnce({ count: 0 });

    await expect(repository.insertIfNew(acceptedEvent, new Date())).resolves.toBe('duplicate');
  });

  it('finds only unprocessed events for one transport message in deterministic order', async () => {
    prismaMock.wagoWebhookEvent.findMany.mockResolvedValueOnce([]);

    await repository.findUnprocessedByTransportMessageId('wamid-1');

    expect(prismaMock.wagoWebhookEvent.findMany).toHaveBeenCalledWith({
      where: { transportMessageId: 'wamid-1', processedAt: null },
      orderBy: [{ sourceCreatedAt: 'asc' }, { receivedAt: 'asc' }, { webhookId: 'asc' }],
    });
  });

  it('marks an unprocessed inbox row processed at most once', async () => {
    prismaMock.wagoWebhookEvent.updateMany.mockResolvedValueOnce({ count: 1 });
    const processedAt = new Date('2026-08-13T08:00:02.000Z');

    await expect(repository.markProcessed('delivery-1', processedAt)).resolves.toBe(true);
    expect(prismaMock.wagoWebhookEvent.updateMany).toHaveBeenCalledWith({
      where: { webhookId: 'delivery-1', processedAt: null },
      data: { processedAt },
    });
  });
});
