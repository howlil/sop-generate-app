import { ConfigService } from '@nestjs/config';
import { EvolutionApiProvider } from './evolution-api.provider';
import { WhatsappProviderError } from './whatsapp-provider.interface';

function config(overrides: Record<string, unknown> = {}): ConfigService {
  const values: Record<string, unknown> = {
    EVOLUTION_API_BASE_URL: 'http://evolution.test:8080/',
    EVOLUTION_API_KEY: 'secret-api-key-123',
    EVOLUTION_API_INSTANCE: 'sop-staging',
    WHATSAPP_REQUEST_TIMEOUT_MS: 10_000,
    ...overrides,
  };
  return {
    get: jest.fn((key: string, fallback: unknown) => values[key] ?? fallback),
  } as unknown as ConfigService;
}

describe('EvolutionApiProvider', () => {
  afterEach(() => jest.restoreAllMocks());

  it('menerima instance open sebagai siap', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ instance: { instanceName: 'sop-staging', state: 'open' } }), {
          status: 200,
        }),
      );
    await expect(new EvolutionApiProvider(config()).assertReady()).resolves.toBeUndefined();
  });

  it('memakai domain Evolution API default', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ instance: { instanceName: 'sop-production', state: 'open' } }),
          { status: 200 },
        ),
      );
    await new EvolutionApiProvider(
      config({ EVOLUTION_API_BASE_URL: undefined, EVOLUTION_API_INSTANCE: undefined }),
    ).assertReady();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://evolution.example.test/instance/connectionState/sop-production',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('menolak instance yang belum siap', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({ instance: { instanceName: 'sop-staging', state: 'connecting' } }),
          { status: 200 },
        ),
      );
    await expect(new EvolutionApiProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'SESSION_NOT_READY',
    });
  });

  it('mengirim payload Evolution API dengan nomor internasional dan API key', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ key: { id: 'message-1' } }), { status: 201 }),
      );
    await new EvolutionApiProvider(config()).sendText({
      nomorTujuan: '628111111111',
      text: 'Pesan pengingat',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://evolution.test:8080/message/sendText/sop-staging',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          number: '628111111111',
          text: 'Pesan pengingat',
        }),
        // Jest asymmetric matchers are typed as `any`; scoped suppression keeps production strict.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.objectContaining({ apikey: 'secret-api-key-123' }),
      }),
    );
  });

  it.each([
    [400, 'BAD_RECIPIENT'],
    [401, 'UNAUTHORIZED'],
    [403, 'UNAUTHORIZED'],
    [404, 'SESSION_NOT_READY'],
    [503, 'SESSION_NOT_READY'],
    [500, 'UNAVAILABLE'],
  ] as const)('memetakan HTTP %i menjadi %s', async (status, kind) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('error', { status }));
    await expect(
      new EvolutionApiProvider(config()).sendText({ nomorTujuan: '628111111111', text: 'test' }),
    ).rejects.toMatchObject({ kind });
  });

  it('mengambil Retry-After saat rate limited', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response('slow down', { status: 429, headers: { 'retry-after': '120' } }),
      );
    try {
      await new EvolutionApiProvider(config()).sendText({
        nomorTujuan: '628111111111',
        text: 'test',
      });
      throw new Error('Expected provider to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(WhatsappProviderError);
      expect(error).toMatchObject({ kind: 'RATE_LIMITED', retryAfterMs: 120_000 });
    }
  });

  it('menolak respons sukses yang bukan JSON', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not-json', { status: 200 }));
    await expect(new EvolutionApiProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'INVALID_RESPONSE',
    });
  });

  it('memetakan network error menjadi unavailable tanpa membocorkan API key', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(new EvolutionApiProvider(config()).assertReady()).rejects.toMatchObject({
      kind: 'UNAVAILABLE',
      message: 'ECONNREFUSED',
      ambiguousDelivery: false,
    });
  });

  it('menandai network error POST sebagai delivery ambigu untuk mencegah duplikasi', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNRESET'));
    await expect(
      new EvolutionApiProvider(config()).sendText({ nomorTujuan: '628111111111', text: 'test' }),
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
      new EvolutionApiProvider(config({ WHATSAPP_REQUEST_TIMEOUT_MS: 5 })).sendText({
        nomorTujuan: '628111111111',
        text: 'test',
      }),
    ).rejects.toMatchObject({
      kind: 'TIMEOUT',
      ambiguousDelivery: true,
    });
  });
});
