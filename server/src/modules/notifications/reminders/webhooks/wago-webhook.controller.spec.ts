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
  const verify = jest.fn();
  const ingest = jest.fn().mockResolvedValue('processed');
  const signature = { verify } as unknown as WagoWebhookSignatureService;
  const service = { ingest } as unknown as WagoWebhookService;
  const controller = new WagoWebhookController(signature, service);
  const request = { body, rawBody } as unknown as RequestWithRawBody;
  return { controller, verify, ingest, request };
}

describe('WagoWebhookController', () => {
  it.each(['processed', 'duplicate', 'stored-unmatched'] as const)(
    'returns success for durable outcome %s',
    async (outcome) => {
      const { controller, verify, ingest, request } = build();
      ingest.mockResolvedValueOnce(outcome);

      await expect(
        controller.receive(
          request,
          'webhook-1',
          '1786608000',
          'v1,c2lnbmF0dXJl',
          'message.server_accepted',
        ),
      ).resolves.toEqual({ success: true, outcome });

      expect(verify).toHaveBeenCalledWith({
        webhookId: 'webhook-1',
        timestamp: '1786608000',
        signatureHeader: 'v1,c2lnbmF0dXJl',
        rawBody,
      });
      expect(verify.mock.invocationCallOrder[0]).toBeLessThan(ingest.mock.invocationCallOrder[0]);
      expect(ingest).toHaveBeenCalledWith(
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
    const { controller, verify, ingest } = build();
    const request = { body } as unknown as RequestWithRawBody;

    await expect(
      controller.receive(
        request,
        'webhook-1',
        '1786608000',
        'v1,c2lnbmF0dXJl',
        'message.server_accepted',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(verify).not.toHaveBeenCalled();
    expect(ingest).not.toHaveBeenCalled();
  });

  it.each([
    ['webhookId', undefined, '1786608000', 'v1,c2lnbmF0dXJl', 'message.server_accepted'],
    ['timestamp', 'webhook-1', undefined, 'v1,c2lnbmF0dXJl', 'message.server_accepted'],
    ['signature', 'webhook-1', '1786608000', undefined, 'message.server_accepted'],
    ['event', 'webhook-1', '1786608000', 'v1,c2lnbmF0dXJl', undefined],
  ])(
    'rejects missing %s header',
    async (_name, webhookId, timestamp, signatureHeader, eventHeader) => {
      const { controller, ingest, request } = build();

      await expect(
        controller.receive(request, webhookId, timestamp, signatureHeader, eventHeader),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(ingest).not.toHaveBeenCalled();
    },
  );

  it('rejects a body id that differs from Webhook-Id', async () => {
    const { controller, ingest } = build();
    const mismatchedBody = { ...body, id: 'other-id' };
    const request = {
      body: mismatchedBody,
      rawBody: Buffer.from(JSON.stringify(mismatchedBody)),
    } as unknown as RequestWithRawBody;

    await expect(
      controller.receive(
        request,
        'webhook-1',
        '1786608000',
        'v1,c2lnbmF0dXJl',
        'message.server_accepted',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(ingest).not.toHaveBeenCalled();
  });

  it('rejects an event header that differs from the authenticated body', async () => {
    const { controller, ingest, request } = build();

    await expect(
      controller.receive(
        request,
        'webhook-1',
        '1786608000',
        'v1,c2lnbmF0dXJl',
        'message.rejected',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(ingest).not.toHaveBeenCalled();
  });

  it.each([
    { ...body, version: '2' },
    { ...body, event: 'message.delivered' },
    { ...body, data: { messageId: 'wamid-1', status: 'rejected' } },
  ])('rejects unsupported or inconsistent envelope %#', async (invalidBody) => {
    const { controller, ingest } = build();
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
    expect(ingest).not.toHaveBeenCalled();
  });

  it('propagates signature and persistence failures instead of acknowledging them', async () => {
    const { controller, verify, ingest, request } = build();
    const authError = new Error('invalid signature');
    verify.mockImplementationOnce(() => {
      throw authError;
    });

    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,bad', 'message.server_accepted'),
    ).rejects.toBe(authError);
    expect(ingest).not.toHaveBeenCalled();

    ingest.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(
      controller.receive(request, 'webhook-1', '1786608000', 'v1,ok', 'message.server_accepted'),
    ).rejects.toThrow('database unavailable');
  });
});
