import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { WagoWebhookEvent } from '../../../../generated/prisma';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';

export type WagoWebhookInsertResult = 'inserted' | 'duplicate';

@Injectable()
export class WagoWebhookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertIfNew(
    event: TrustedWagoWebhookEvent,
    receivedAt: Date,
  ): Promise<WagoWebhookInsertResult> {
    const result = await this.prisma.wagoWebhookEvent.createMany({
      data: {
        webhookId: event.id,
        transportMessageId: event.data.messageId,
        event: event.event,
        status: event.data.status,
        errorCode: event.event === 'message.rejected' ? (event.data.error ?? null) : null,
        sourceCreatedAt: event.createdAt,
        receivedAt,
      },
      skipDuplicates: true,
    });
    return result.count === 1 ? 'inserted' : 'duplicate';
  }

  findUnprocessedByTransportMessageId(messageId: string): Promise<WagoWebhookEvent[]> {
    return this.prisma.wagoWebhookEvent.findMany({
      where: { transportMessageId: messageId, processedAt: null },
      orderBy: [{ sourceCreatedAt: 'asc' }, { receivedAt: 'asc' }, { webhookId: 'asc' }],
    });
  }

  async markProcessed(webhookId: string, processedAt: Date): Promise<boolean> {
    const result = await this.prisma.wagoWebhookEvent.updateMany({
      where: { webhookId, processedAt: null },
      data: { processedAt },
    });
    return result.count === 1;
  }
}
