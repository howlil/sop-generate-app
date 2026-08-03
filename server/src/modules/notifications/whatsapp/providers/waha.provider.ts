import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WhatsappProviderError,
  type WhatsappProvider,
  type WhatsappProviderErrorKind,
} from './whatsapp-provider.interface';

const MAX_ERROR_BODY_LENGTH = 500;

@Injectable()
export class WahaProvider implements WhatsappProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly session: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('WAHA_BASE_URL', 'http://waha:3000').replace(/\/+$/, '');
    this.apiKey = config.get<string>('WAHA_API_KEY', '');
    this.session = config.get<string>('WAHA_SESSION', 'sop-staging');
    this.timeoutMs = config.get<number>('WHATSAPP_REQUEST_TIMEOUT_MS', 10_000);
  }

  async assertReady(): Promise<void> {
    const response = await this.request(`/api/sessions/${encodeURIComponent(this.session)}`, {
      method: 'GET',
    });
    const payload = await this.safeJson(response);
    const status = this.readString(payload, 'status');
    if (status !== 'WORKING') {
      throw new WhatsappProviderError(
        'SESSION_NOT_READY',
        `Session WAHA ${this.session} belum siap (status=${status ?? 'UNKNOWN'})`,
      );
    }
  }

  async sendText(input: Readonly<{ nomorTujuan: string; text: string }>): Promise<void> {
    const response = await this.request('/api/sendText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: `${input.nomorTujuan}@c.us`,
        text: input.text,
        session: this.session,
      }),
    });
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
          'X-Api-Key': this.apiKey,
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
          `Request WAHA melewati timeout ${this.timeoutMs} ms`,
          undefined,
          init.method === 'POST',
        );
      }
      throw new WhatsappProviderError(
        'UNAVAILABLE',
        error instanceof Error ? error.message : 'WAHA tidak dapat dihubungi',
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
          : response.status === 404
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
      `WAHA merespons HTTP ${response.status}${body.length > 0 ? `: ${body}` : ''}`,
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
      throw new WhatsappProviderError('INVALID_RESPONSE', 'Respons WAHA bukan JSON yang valid');
    }
  }

  private readString(payload: unknown, key: string): string | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }
    const value = (payload as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
}
