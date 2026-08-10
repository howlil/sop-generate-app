import { ConfigService } from '@nestjs/config';
import { WagoProvider } from './wago.provider';
import { NotificationChannelError } from './notification-channel.interface';

describe('WagoProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function createProvider(overrides: Record<string, unknown> = {}) {
    const values: Record<string, unknown> = {
      WAGO_BASE_URL: 'https://wago.example.test/',
      WAGO_API_KEY: 'wa_test_key',
      WAGO_REQUEST_TIMEOUT_MS: 10_000,
      ...overrides,
    };
    const config = {
      get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
    } as unknown as ConfigService;
    return new WagoProvider(config);
  }

  it('mengirim payload Wago dengan bearer auth, nomor ternormalisasi, dan idempotency key', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, messageId: 'm1', status: 'pending' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = fetchMock as typeof fetch;
    const provider = createProvider();

    await provider.send('085373945490', 'Pesan uji', {
      idempotencyKey: 'sopflow-reminder:r1:initial',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(url).toBe('https://wago.example.test/messages/send');
    expect(init.method).toBe('POST');
    expect(headers.get('Authorization')).toBe('Bearer wa_test_key');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toBe('sopflow-reminder:r1:initial');
    expect(init.body).toBe(JSON.stringify({ to: '6285373945490', text: 'Pesan uji' }));
  });

  it.each([
    [401, 'UNAUTHORIZED', 'UNAUTHORIZED'],
    [403, 'API_KEY_REQUIRED', 'CONFIGURATION'],
    [403, 'RECIPIENT_NOT_ALLOWED', 'BAD_RECIPIENT'],
    [403, 'RECIPIENT_OPTED_OUT', 'BAD_RECIPIENT'],
    [400, 'INVALID_PHONE', 'BAD_RECIPIENT'],
    [404, 'PHONE_NOT_ON_WHATSAPP', 'BAD_RECIPIENT'],
    [429, 'ACCOUNT_RATE_LIMITED', 'RATE_LIMITED'],
    [429, 'RECIPIENT_RATE_LIMITED', 'RATE_LIMITED'],
    [429, 'NEW_CHAT_RATE_LIMITED', 'RATE_LIMITED'],
    [429, 'WA_REACHOUT_RESTRICTED', 'RATE_LIMITED'],
    [503, 'WHATSAPP_NOT_CONNECTED', 'UNAVAILABLE'],
    [503, 'OUTBOUND_PAUSED', 'UNAVAILABLE'],
    [502, 'MESSAGE_REJECTED', 'UNAVAILABLE'],
  ])('memetakan HTTP %s %s menjadi %s', async (status, code, expectedKind) => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: code, message: 'failure' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ) as typeof fetch;
    const provider = createProvider();

    try {
      await provider.send('6285373945490', 'Pesan uji');
      throw new Error('expected provider to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationChannelError);
      expect((error as NotificationChannelError).kind).toBe(expectedKind);
    }
  });

  it('menganggap DUPLICATE_MESSAGE sebagai logical success', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ success: false, error: 'DUPLICATE_MESSAGE', message: 'duplicate' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } },
        ),
      ) as typeof fetch;
    const provider = createProvider();

    await expect(provider.send('6285373945490', 'Pesan uji')).resolves.toBeUndefined();
  });

  it('memetakan network failure menjadi UNAVAILABLE', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('connection refused')) as typeof fetch;
    const provider = createProvider();

    await expect(provider.send('6285373945490', 'Pesan uji')).rejects.toMatchObject({
      kind: 'UNAVAILABLE',
    });
  });

  it('memetakan abort menjadi TIMEOUT', async () => {
    const timeoutError = new Error('aborted');
    timeoutError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(timeoutError) as typeof fetch;
    const provider = createProvider();

    await expect(provider.send('6285373945490', 'Pesan uji')).rejects.toMatchObject({
      kind: 'TIMEOUT',
    });
  });
});
