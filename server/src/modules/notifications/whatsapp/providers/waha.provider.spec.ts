import { ConfigService } from '@nestjs/config';
import { WahaProvider } from './waha.provider';
import { WhatsappProviderError } from './whatsapp-provider.interface';

function config(overrides: Record<string, unknown> = {}): ConfigService {
  const values: Record<string, unknown> = {
    WAHA_BASE_URL: 'http://waha.test:3000/',
    WAHA_API_KEY: 'secret-api-key-123',
    WAHA_SESSION: 'sop-staging',
    WHATSAPP_REQUEST_TIMEOUT_MS: 10_000,
    ...overrides,
  };
  return {
    get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
  } as unknown as ConfigService;
}

describe('WahaProvider', () => {
  afterEach(() => jest.restoreAllMocks());

  it('menerima session WORKING sebagai siap', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ status: 'WORKING' }), { status: 200 }));
    await expect(new WahaProvider(config()).assertReady()).resolves.toBeUndefined();
  });

  it('menolak session yang belum siap', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ status: 'SCAN_QR' }), { status: 200 }));
    await expect(new WahaProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'SESSION_NOT_READY',
    });
  });

  it('mengirim payload WAHA dengan chatId asli dan API key', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ id: 'message-1' }), { status: 201 }));
    await new WahaProvider(config()).sendText({
      nomorTujuan: '628111111111',
      text: 'Pesan pengingat',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://waha.test:3000/api/sendText',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chatId: '628111111111@c.us',
          text: 'Pesan pengingat',
          session: 'sop-staging',
        }),
        // Jest asymmetric matchers are typed as `any`; scoped suppression keeps production strict.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.objectContaining({ 'X-Api-Key': 'secret-api-key-123' }),
      }),
    );
  });

  it.each([
    [400, 'BAD_RECIPIENT'],
    [401, 'UNAUTHORIZED'],
    [403, 'UNAUTHORIZED'],
    [404, 'SESSION_NOT_READY'],
    [500, 'UNAVAILABLE'],
  ] as const)('memetakan HTTP %i menjadi %s', async (status, kind) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('error', { status }));
    await expect(
      new WahaProvider(config()).sendText({ nomorTujuan: '628111111111', text: 'test' }),
    ).rejects.toMatchObject({ kind });
  });

  it('mengambil Retry-After saat rate limited', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('slow down', { status: 429, headers: { 'retry-after': '120' } }),
      );
    try {
      await new WahaProvider(config()).sendText({ nomorTujuan: '628111111111', text: 'test' });
      throw new Error('Expected provider to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(WhatsappProviderError);
      expect(error).toMatchObject({ kind: 'RATE_LIMITED', retryAfterMs: 120_000 });
    }
  });

  it('menolak respons sukses yang bukan JSON', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not-json', { status: 200 }));
    await expect(new WahaProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'INVALID_RESPONSE',
    });
  });

  it('memetakan network error menjadi unavailable tanpa membocorkan API key', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(new WahaProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'UNAVAILABLE',
      message: 'ECONNREFUSED',
      ambiguousDelivery: false,
    });
  });

  it('menandai network error POST sebagai delivery ambigu untuk mencegah duplikasi', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNRESET'));
    await expect(
      new WahaProvider(config()).sendText({ nomorTujuan: '628111111111', text: 'test' }),
    ).rejects.toMatchObject({
      kind: 'UNAVAILABLE',
      message: 'ECONNRESET',
      ambiguousDelivery: true,
    });
  });

  it('mendeteksi timeout dari signal abort meski fetch membungkusnya sebagai TypeError', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation((_input: string | URL | Request, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new TypeError('fetch aborted by runtime')),
            { once: true },
          );
        });
      });
    await expect(
      new WahaProvider(config({ WHATSAPP_REQUEST_TIMEOUT_MS: 5 })).sendText({
        nomorTujuan: '628111111111',
        text: 'test',
      }),
    ).rejects.toMatchObject({
      kind: 'TIMEOUT',
      ambiguousDelivery: true,
    });
  });
});
