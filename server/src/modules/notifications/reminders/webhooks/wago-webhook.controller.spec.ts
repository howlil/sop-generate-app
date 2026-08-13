/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import type { RequestWithRawBody } from '../../../../common/http/raw-body';
import { WagoWebhookController } from './wago-webhook.controller';
import { WagoWebhookService } from './wago-webhook.service';
import { WagoWebhookSignatureService } from './wago-webhook-signature.service';

const body = {
  version: '1',
  id: 'webhook-1',
  event: 'message.server_accepted',
  createdAt: '2026-08-13T08:00:00.000Z',
  data: { messageId: 'wamid-1', status: 'accepted' },
};
const rawBody = Buffer.from(JSON.stringify(body));

function build() {
  const signature = {
    verify: jest.fn(),
  } as unknown as WagoWebhookSignatureService;
  const service = {
    ingest: jest.fn().mockResolvedValue('processed'),
  } as unknown as WagoWebhookService;
  const controller = new WagoWebhookController(signature, service);
  const request = { body, rawBody } as unknown as RequestWithRawBody;
  return { controller, signature, service, request };
}

describe('WagoWebhookController', () => {
  it.each(['processed', 'duplicate', 'stored-unmatched'] as const)(
    'returns success for durable outcome %s',
    async (outcome) => {
      const { controller, signature, service, request } = build();
      (service.ingest as jest.Mock).mockResolvedValueOnce(outcome);

      await expect(
        controller.receive(request, 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', 'message.server_accepted'),
      ).resolves.toEqual({ success: true, outcome });

      expect(signature.verify).toHaveBeenCalledWith({
        webhookId: 'webhook-1',
        timestamp: '1786608000',
        signatureHeader: 'v1,c2lnbmF0dXJl',
        rawBody,
      });
      expect(signature.verify.mock.invocationCallOrder[0]).toBeLessThan(
        (service.ingest as jest.Mock).mock.invocationCallOrder[0],
      );
      expect(service.ingest).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'webhook-1',
          event: 'message.server_accepted',
          createdAt: new Date('2026-08-13T08:00:00.000Z'),
        }),
        expect.any(Date),
      );
    },
  );

  it('rejects a request without the exact raw JSON body', async () => {
    const { controller, signature, service } = build();
    const request = { body } as unknown as RequestWithRawBody;

    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', 'message.server_accepted'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(signature.verify).not.toHaveBeenCalled();
    expect(service.ingest).not.toHaveBeenCalled();
  });

  it.each([
    ['webhookId', undefined, '1786608000', 'v1,c2lnbmF0dXJl', 'message.server_accepted'],
    ['timestamp', 'webhook-1', undefined, 'v1,c2lnbmF0dXJl', 'message.server_accepted'],
    ['signature', 'webhook-1', '1786608000', undefined, 'message.server_accepted'],
    ['event', 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', undefined],
  ])('rejects missing %s header', async (_name, webhookId, timestamp, signatureHeader, eventHeader) => {
    const { controller, service, request } = build();

    await expect(
      controller.receive(request, webhookId, timestamp, signatureHeader, eventHeader),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.ingest).not.toHaveBeenCalled();
  });

  it('rejects a body id that differs from Webhook-Id', async () => {
    const { controller, service } = build();
    const mismatchedBody = { ...body, id: 'other-id' };
    const request = {
      body: mismatchedBody,
      rawBody: Buffer.from(JSON.stringify(mismatchedBody)),
    } as unknown as RequestWithRawBody;

    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', 'message.server_accepted'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.ingest).not.toHaveBeenCalled();
  });

  it('rejects an event header that differs from the authenticated body', async () => {
    const { controller, service, request } = build();

    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', 'message.rejected'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.ingest).not.toHaveBeenCalled();
  });

  it.each([
    { ...body, version: '2' },
    { ...body, event: 'message.delivered' },
    { ...body, data: { messageId: 'wamid-1', status: 'rejected' } },
  ])('rejects unsupported or inconsistent envelope %#', async (invalidBody) => {
    const { controller, service } = build();
    const request = {
      body: invalidBody,
      rawBody: Buffer.from(JSON.stringify(invalidBody)),
    } as unknown as RequestWithRawBody;

    await expect(
      controller.receive(
        request,
        String(invalidBody.id),
        '1786608000',
        'v1,c2lnbmF0dXJl',
        String(invalidBody.event),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.ingest).not.toHaveBeenCalled();
  });

  it('propagates signature and persistence failures instead of acknowledging them', async () => {
    const { controller, signature, service, request } = build();
    const authError = new Error('invalid signature');
    (signature.verify as jest.Mock).mockImplementationOnce(() => {
      throw authError;
    });

    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,bad', 'message.server_accepted'),
    ).rejects.toBe(authError);
    expect(service.ingest).not.toHaveBeenCalled();

    (service.ingest as jest.Mock).mockRejectedValueOnce(new Error('database unavailable'));
    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,ok', 'message.server_accepted'),
    ).rejects.toThrow('database unavailable');
  });
});
