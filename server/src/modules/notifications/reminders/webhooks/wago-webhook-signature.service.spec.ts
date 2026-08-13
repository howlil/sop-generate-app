import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { WagoWebhookSignatureService } from './wago-webhook-signature.service';

const secret = 'wago-webhook-secret-that-is-at-least-32-characters';

function createService(configuredSecret = secret): WagoWebhookSignatureService {
  const config = {
    get: jest.fn((key: string, fallback: unknown) =>
      key === 'WAGO_WEBHOOK_SECRET' ? configuredSecret : fallback,
    ),
  } as unknown as ConfigService;
  return new WagoWebhookSignatureService(config);
}

function fixture() {
  const webhookId = 'delivery-1';
  const timestamp = '1786608000';
  const rawBody = Buffer.from(
    '{"version":"1","id":"delivery-1","event":"message.server_accepted","createdAt":"2026-08-13T08:00:00.000Z","data":{"messageId":"wamid-1","status":"accepted"}}',
  );
  const signature = createHmac('sha256', secret)
    .update(`${webhookId}.${timestamp}.${rawBody.toString('utf8')}`)
    .digest('base64');
  const now = new Date(Number(timestamp) * 1000);
  return { webhookId, timestamp, rawBody, signature, now };
}

describe('WagoWebhookSignatureService', () => {
  it('accepts a valid signature over the exact raw body', () => {
    const service = createService();
    const value = fixture();

    expect(() =>
      service.verify(
        {
          webhookId: value.webhookId,
          timestamp: value.timestamp,
          signatureHeader: `v1,${value.signature}`,
          rawBody: value.rawBody,
        },
        value.now,
      ),
    ).not.toThrow();
  });

  it('accepts either current-looking rotation signature when one candidate matches', () => {
    const service = createService();
    const value = fixture();
    const wrong = Buffer.alloc(32, 7).toString('base64');

    expect(() =>
      service.verify(
        {
          webhookId: value.webhookId,
          timestamp: value.timestamp,
          signatureHeader: `v1,${wrong} v1,${value.signature}`,
          rawBody: value.rawBody,
        },
        value.now,
      ),
    ).not.toThrow();
  });

  it('rejects a signature when the raw body changes', () => {
    const service = createService();
    const value = fixture();

    expect(() =>
      service.verify(
        {
          webhookId: value.webhookId,
          timestamp: value.timestamp,
          signatureHeader: `v1,${value.signature}`,
          rawBody: Buffer.from(`${value.rawBody.toString('utf8')} `),
        },
        value.now,
      ),
    ).toThrow();
  });

  it.each([301, -301])('rejects timestamp outside the five-minute window (%ss)', (offset) => {
    const service = createService();
    const value = fixture();
    const now = new Date((Number(value.timestamp) + offset) * 1000);

    expect(() =>
      service.verify(
        {
          webhookId: value.webhookId,
          timestamp: value.timestamp,
          signatureHeader: `v1,${value.signature}`,
          rawBody: value.rawBody,
        },
        now,
      ),
    ).toThrow();
  });

  it.each(['', 'abc', 'v2,abc', 'v1,not-valid-***'])(
    'rejects malformed signature header %p',
    (header) => {
      const service = createService();
      const value = fixture();

      expect(() =>
        service.verify(
          {
            webhookId: value.webhookId,
            timestamp: value.timestamp,
            signatureHeader: header,
            rawBody: value.rawBody,
          },
          value.now,
        ),
      ).toThrow();
    },
  );

  it('rejects callbacks when no webhook secret is configured', () => {
    const service = createService('');
    const value = fixture();

    expect(() =>
      service.verify(
        {
          webhookId: value.webhookId,
          timestamp: value.timestamp,
          signatureHeader: `v1,${value.signature}`,
          rawBody: value.rawBody,
        },
        value.now,
      ),
    ).toThrow();
  });
});
