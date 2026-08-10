import { ConfigService } from '@nestjs/config';
import { NotificationChannelError } from './notification-channel.interface';
import { WhaApiProvider } from './whaapi.provider';

describe('WhaApiProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function provider(overrides: Record<string, unknown> = {}): WhaApiProvider {
    const values: Record<string, unknown> = {
      WHATSAPP_ENABLED: true,
      WHAAPI_BASE_URL: 'https://whaapi.example.test',
      WHAAPI_TOKEN: 'token-test',
      WHAAPI_CHANNEL_ID: 'channel-test',
      WHATSAPP_REQUEST_TIMEOUT_MS: 100,
      WHATSAPP_ALLOWED_RECIPIENTS: '',
      ...overrides,
    };
    const config = {
      get: jest.fn((key: string, fallback: unknown) =>
        Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback,
      ),
    } as unknown as ConfigService;
    return new WhaApiProvider(config);
  }

  it('menolak pengiriman ketika channel WhatsApp dinonaktifkan', async () => {
    await expect(provider({ WHATSAPP_ENABLED: false }).send('081234567890', 'test')).rejects.toMatchObject({
      kind: 'CONFIGURATION',
    });
  });

  it.each([
    { WHAAPI_TOKEN: '' },
    { WHAAPI_CHANNEL_ID: '' },
  ])('menolak konfigurasi WhaAPI yang belum lengkap: %o', async (overrides) => {
    await expect(provider(overrides).send('081234567890', 'test')).rejects.toMatchObject({
      kind: 'CONFIGURATION',
    });
  });

  it('melewati tujuan yang tidak termasuk allowlist tanpa memanggil provider', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await provider({ WHATSAPP_ALLOWED_RECIPIENTS: '628111111111, 628222222222' }).send(
      '081234567890',
      'test',
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mengirim payload ternormalisasi ketika provider sukses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as unknown as typeof fetch;

    await provider().send('0812-3456-7890', 'Pesan pengingat');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://whaapi.example.test/api/v1/send-message');
    expect(options.method).toBe('POST');
    expect(options.headers).toMatchObject({ Authorization: 'Bearer token-test' });
    expect(JSON.parse(String(options.body))).toEqual({
      app_id: 'channel-test',
      message: 'Pesan pengingat',
      phone_number: '6281234567890',
    });
  });

  it.each([
    [401, 'UNAUTHORIZED'],
    [403, 'UNAUTHORIZED'],
    [429, 'RATE_LIMITED'],
    [400, 'BAD_RECIPIENT'],
    [422, 'BAD_RECIPIENT'],
    [500, 'UNAVAILABLE'],
    [503, 'UNAVAILABLE'],
    [418, 'UNKNOWN'],
  ] as const)('memetakan HTTP %i menjadi %s', async (status, kind) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      text: jest.fn().mockResolvedValue('provider error'),
    }) as unknown as typeof fetch;

    await expect(provider().send('6281234567890', 'test')).rejects.toMatchObject({ kind });
  });

  it('tetap memetakan HTTP error ketika response body gagal dibaca', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockRejectedValue(new Error('body unavailable')),
    }) as unknown as typeof fetch;

    await expect(provider().send('6281234567890', 'test')).rejects.toMatchObject({
      kind: 'UNAVAILABLE',
    });
  });

  it('memetakan AbortError menjadi TIMEOUT', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    global.fetch = jest.fn().mockRejectedValue(abortError) as unknown as typeof fetch;

    await expect(provider().send('6281234567890', 'test')).rejects.toMatchObject({
      kind: 'TIMEOUT',
    });
  });

  it('memetakan error jaringan menjadi UNKNOWN', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    await expect(provider().send('6281234567890', 'test')).rejects.toMatchObject({
      kind: 'UNKNOWN',
      message: 'network down',
    });
  });

  it('memetakan throwable non-Error menjadi UNKNOWN', async () => {
    global.fetch = jest.fn().mockRejectedValue('network down') as unknown as typeof fetch;

    const promise = provider().send('6281234567890', 'test');
    await expect(promise).rejects.toBeInstanceOf(NotificationChannelError);
    await expect(promise).rejects.toMatchObject({
      kind: 'UNKNOWN',
      message: 'network down',
    });
  });
});
