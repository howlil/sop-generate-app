import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_EVOLUTION_API_BASE_URL,
  normalizeEvolutionApiBaseUrl,
} from '../../../../config/evolution-api.config';
import {
  WhatsappProviderError,
  type WhatsappProvider,
  type WhatsappProviderErrorKind,
} from './whatsapp-provider.interface';

const MAX_ERROR_BODY_LENGTH = 500;

@Injectable()
export class EvolutionApiProvider implements WhatsappProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = normalizeEvolutionApiBaseUrl(
      config.get<string>('EVOLUTION_API_BASE_URL', DEFAULT_EVOLUTION_API_BASE_URL),
    );
    this.apiKey = config.get<string>('EVOLUTION_API_KEY', '');
    this.instanceName = config.get<string>('EVOLUTION_API_INSTANCE', 'sop-production');
    this.timeoutMs = config.get<number>('WHATSAPP_REQUEST_TIMEOUT_MS', 10_000);
  }

  async assertReady(): Promise<void> {
    const response = await this.request(
      `/instance/connectionState/${encodeURIComponent(this.instanceName)}`,
      {
        method: 'GET',
      },
    );
    const payload = await this.safeJson(response);
    const state = this.readConnectionState(payload);
    if (state !== 'open') {
      throw new WhatsappProviderError(
        'SESSION_NOT_READY',
        `Instance Evolution API ${this.instanceName} belum siap (state=${state ?? 'UNKNOWN'})`,
      );
    }
  }

  async sendText(input: Readonly<{ nomorTujuan: string; text: string }>): Promise<void> {
    const response = await this.request(
      `/message/sendText/${encodeURIComponent(this.instanceName)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: input.nomorTujuan,
          text: input.text,
        }),
      },
    );
    await this.safeJson(response);
  }

  private async request(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          apikey: this.apiKey,
          ...init.headers,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw await this.toHttpError(response);
      }
      return response;
    } catch (error) {
      if (error instanceof WhatsappProviderError) {
        throw error;
      }
      if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
        throw new WhatsappProviderError(
          'TIMEOUT',
          `Request Evolution API melewati timeout ${this.timeoutMs} ms`,
          undefined,
          init.method === 'POST',
        );
      }
      throw new WhatsappProviderError(
        'UNAVAILABLE',
        error instanceof Error ? error.message : 'Evolution API tidak dapat dihubungi',
        undefined,
        init.method === 'POST',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async toHttpError(response: Response): Promise<WhatsappProviderError> {
    const body = (await response.text()).slice(0, MAX_ERROR_BODY_LENGTH);
    const kind: WhatsappProviderErrorKind =
      response.status === 400
        ? 'BAD_RECIPIENT'
        : response.status === 401 || response.status === 403
          ? 'UNAUTHORIZED'
          : response.status === 404 || response.status === 503
            ? 'SESSION_NOT_READY'
            : response.status === 429
              ? 'RATE_LIMITED'
              : response.status >= 500
                ? 'UNAVAILABLE'
                : 'UNKNOWN';
    const retryAfterSeconds = Number(response.headers.get('retry-after'));
    const retryAfterMs =
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1_000
        : undefined;
    return new WhatsappProviderError(
      kind,
      `Evolution API merespons HTTP ${response.status}${body.length > 0 ? `: ${body}` : ''}`,
      retryAfterMs,
    );
  }

  private async safeJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (text.trim().length === 0) {
      return {};
    }
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new WhatsappProviderError(
        'INVALID_RESPONSE',
        'Respons Evolution API bukan JSON yang valid',
      );
    }
  }

  private readConnectionState(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }
    const root = payload as Record<string, unknown>;
    const instance = root.instance;
    if (typeof instance === 'object' && instance !== null) {
      const state = (instance as Record<string, unknown>).state;
      return typeof state === 'string' ? state : null;
    }
    const state = root.state;
    return typeof state === 'string' ? state : null;
  }
}
