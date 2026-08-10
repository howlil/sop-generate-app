import { ConfigService } from '@nestjs/config';
import { NotificationChannelError } from './notification-channel.interface';
import { WhaApiProvider } from './whaapi.provider';

function config(values: Record<string, unknown>): ConfigService {
  return {
    get: jest.fn((key: string, fallback: unknown) =>
      Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback,
    ),
  } as unknown as ConfigService;
}

function provider(overrides: Record<string, unknown> = {}): WhaApiProvider {
  return new WhaApiProvider(
    config({
      WHATSAPP_ENABLED: true,
      WHAAPI_BASE_URL: 'https://whaapi.example.test',
      WHAAPI_TOKEN: 'test-token',
      WHAAPI_CHANNEL_ID: 'channel-1',
      WHATSAPP_REQUEST_TIMEOUT_MS: 1000,
      WHATSAPP_ALLOWED_RECIPIENTS: '',
      ...overrides,
    }),
  );
}

function httpResponse(status: number, body = ''): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

async function captureChannelError(action: () => Promise<void>): Promise<NotificationChannelError> {
  try {
    await action();
  } catch (error) {
    expect(error).toBeInstanceOf(NotificationChannelError);
    return error as NotificationChannelError;
  }
  throw new Error('Expected NotificationChannelError');
}

describe('WhaApiProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('menolak pengiriman ketika WhatsApp dinonaktifkan', async () => {
    const error = await captureChannelError(() =>
      provider({ WHATSAPP_ENABLED: false }).send('081234567890', 'Pesan'),
    );

    expect(error.kind).toBe('CONFIGURATION');
    expect(error.message).toContain('dinonaktifkan');
  });

  it.each([
    [{ WHAAPI_TOKEN: '' }, 'token kosong'],
    [{ WHAAPI_CHANNEL_ID: '' }, 'channel kosong'],
  ])('menolak konfigurasi WhaAPI yang tidak lengkap: %s', async (overrides) => {
    const error = await captureChannelError(() =>
      provider(overrides).send('081234567890', 'Pesan'),
    );

    expect(error.kind).toBe('CONFIGURATION');
    expect(error.message).toContain('belum lengkap');
  });

  it('melewati penerima di luar allow-list tanpa memanggil provider eksternal', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    await provider({
      WHATSAPP_ALLOWED_RECIPIENTS: ' 6281111111111, , 6282222222222 ',
    }).send('081234567890', 'Pesan');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mengirim payload terotorisasi dan menormalisasi nomor lokal 08 menjadi 62', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(httpResponse(200));

    await provider().send('0812-3456-7890', 'Halo SOP');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe('https://whaapi.example.test/api/v1/send-message');
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      app_id: 'channel-1',
      message: 'Halo SOP',
      phone_number: '6281234567890',
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('mempertahankan nomor internasional digit-only tanpa prefix nol', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(httpResponse(200));

    await provider().send('+62 812 3456 7890', 'Halo');

    const [, init] = fetchSpy.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body)).phone_number).toBe('6281234567890');
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
  ] as const)('memetakan HTTP %s menjadi error channel %s', async (status, expectedKind) => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(httpResponse(status, `provider error ${status}`));

    const error = await captureChannelError(() => provider().send('081234567890', 'Pesan'));

    expect(error.kind).toBe(expectedKind);
    expect(error.message).toBe(`WhaAPI HTTP ${status}`);
  });

  it('tetap memetakan HTTP error ketika response body gagal dibaca', async () => {
    const response = httpResponse(500);
    jest
      .spyOn(response, 'text')
      .mockRejectedValue(new Error('body unavailable'));
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    const error = await captureChannelError(() => provider().send('081234567890', 'Pesan'));

    expect(error.kind).toBe('UNAVAILABLE');
  });

  it('memetakan AbortError menjadi TIMEOUT', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(abortError);

    const error = await captureChannelError(() => provider().send('081234567890', 'Pesan'));

    expect(error.kind).toBe('TIMEOUT');
    expect(error.message).toContain('timeout');
  });

  it('memetakan Error jaringan biasa menjadi UNKNOWN dengan pesan asal', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('socket reset'));

    const error = await captureChannelError(() => provider().send('081234567890', 'Pesan'));

    expect(error.kind).toBe('UNKNOWN');
    expect(error.message).toBe('socket reset');
  });

  it('memetakan throwable non-Error menjadi UNKNOWN', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue('raw failure');

    const error = await captureChannelError(() => provider().send('081234567890', 'Pesan'));

    expect(error.kind).toBe('UNKNOWN');
    expect(error.message).toBe('raw failure');
  });

  it('menerima destination pendek yang ada di allow-list dan tetap mengirim', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(httpResponse(200));

    await provider({ WHATSAPP_ALLOWED_RECIPIENTS: '1234' }).send('1234', 'Ping');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
