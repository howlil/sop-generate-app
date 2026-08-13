import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { RequestWithRawBody } from '../../../../common/http/raw-body';
import { WagoWebhookService, type WagoWebhookIngestResult } from './wago-webhook.service';
import { WagoWebhookSignatureService } from './wago-webhook-signature.service';
import type { TrustedWagoWebhookEvent } from './wago-webhook.types';

const acceptedEnvelopeSchema = z.object({
  version: z.literal('1'),
  id: z.string().min(1).max(191),
  event: z.literal('message.server_accepted'),
  createdAt: z.string().datetime(),
  data: z.object({
    messageId: z.string().min(1).max(191),
    status: z.literal('accepted'),
  }),
});

const rejectedEnvelopeSchema = z.object({
  version: z.literal('1'),
  id: z.string().min(1).max(191),
  event: z.literal('message.rejected'),
  createdAt: z.string().datetime(),
  data: z.object({
    messageId: z.string().min(1).max(191),
    status: z.literal('rejected'),
    error: z.string().max(64).optional(),
  }),
});

const envelopeSchema = z.discriminatedUnion('event', [
  acceptedEnvelopeSchema,
  rejectedEnvelopeSchema,
]);

type WebhookResponse = Readonly<{
  success: true;
  outcome: WagoWebhookIngestResult;
}>;

@ApiTags('Integrations')
@Controller('webhooks/wago')
export class WagoWebhookController {
  constructor(
    private readonly signature: WagoWebhookSignatureService,
    private readonly service: WagoWebhookService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Terima delivery webhook bertanda tangan dari Wago' })
  @ApiResponse({ status: 200, description: 'Webhook diproses, dideduplikasi, atau disimpan durable' })
  @ApiResponse({ status: 400, description: 'Header atau envelope webhook tidak valid' })
  @ApiResponse({ status: 401, description: 'Signature atau timestamp webhook tidak valid' })
  @ApiResponse({ status: 503, description: 'Receiver webhook belum dikonfigurasi' })
  async receive(
    @Req() request: RequestWithRawBody,
    @Headers('webhook-id') webhookId?: string,
    @Headers('webhook-timestamp') timestamp?: string,
    @Headers('webhook-signature') signatureHeader?: string,
    @Headers('x-wago-event') eventHeader?: string,
  ): Promise<WebhookResponse> {
    const rawBody = request.rawBody;
    if (rawBody === undefined) {
      throw new BadRequestException('Raw webhook body is required');
    }

    if (
      webhookId === undefined ||
      webhookId.trim() === '' ||
      timestamp === undefined ||
      timestamp.trim() === '' ||
      signatureHeader === undefined ||
      signatureHeader.trim() === '' ||
      eventHeader === undefined ||
      eventHeader.trim() === ''
    ) {
      throw new BadRequestException('Required Wago webhook headers are missing');
    }

    this.signature.verify({
      webhookId,
      timestamp,
      signatureHeader,
      rawBody,
    });

    const parsed = envelopeSchema.safeParse(request.body as unknown);
    if (!parsed.success) {
      throw new BadRequestException('Invalid Wago webhook envelope');
    }
    if (parsed.data.id !== webhookId) {
      throw new BadRequestException('Webhook-Id does not match body id');
    }
    if (parsed.data.event !== eventHeader) {
      throw new BadRequestException('X-Wago-Event does not match body event');
    }

    const trustedEvent = {
      ...parsed.data,
      createdAt: new Date(parsed.data.createdAt),
    } as TrustedWagoWebhookEvent;
    const outcome = await this.service.ingest(trustedEvent, new Date());
    return { success: true, outcome };
  }
}
