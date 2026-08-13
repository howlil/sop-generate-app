import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationChannelError,
  type NotificationChannel,
  type NotificationChannelErrorKind,
  type NotificationSendOptions,
  type NotificationSendReceipt,
} from './notification-channel.interface';

type WagoErrorBody = Readonly<{
  error?: unknown;
  message?: unknown;
}>;

type WagoSuccessBody = Readonly<{
  messageId?: unknown;
}>;

@Injectable()
export class WagoProvider implements NotificationChannel {
  private readonly logger = new Logger(WagoProvider.name);
  private readonly enabled: boolean;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('WAGO_BASE_URL', '').trim().replace(/\/+$/, '');
    this.apiKey = config.get<string>('WAGO_API_KEY', '').trim();
    this.enabled = this.baseUrl !== '' && this.apiKey !== '';
    this.timeoutMs = config.get<number>('WAGO_REQUEST_TIMEOUT_MS', 10_000);
  }

  async send(
    destination: string,
    message: string,
    options?: NotificationSendOptions,
  ): Promise<NotificationSendReceipt> {
    if (!this.enabled) {
      throw new NotificationChannelError(
        'CONFIGURATION',
        'WhatsApp notification membutuhkan WAGO_BASE_URL dan WAGO_API_KEY',
      );
    }

    const phoneNumber = this.normalizePhone(destination);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      };
      if (options?.idempotencyKey) {
        headers['Idempotency-Key'] = options.idempotencyKey;
      }

      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: phoneNumber,
          text: message,
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const successBody = await this.readSuccessBody(response);
        const transportMessageId =
          typeof successBody.messageId === 'string' && successBody.messageId.trim() !== ''
            ? successBody.messageId
            : null;
        if (transportMessageId === null) {
          this.logger.warn(
            `Wago menerima pesan tanpa messageId tujuan=${this.maskPhone(phoneNumber)}`,
          );
        } else {
          this.logger.log(`Wago menerima pesan ke ${this.maskPhone(phoneNumber)}`);
        }
        return { transportMessageId, status: 'pending' };
      }

      const errorBody = await this.readErrorBody(response);
      const errorCode = typeof errorBody.error === 'string' ? errorBody.error : '';

      if (response.status === 409 && errorCode === 'DUPLICATE_MESSAGE') {
        this.logger.log(`Wago mengenali retry duplikat ke ${this.maskPhone(phoneNumber)}`);
        return { transportMessageId: null, status: 'pending' };
      }

      const kind = this.errorToKind(response.status, errorCode);
      const detail =
        typeof errorBody.message === 'string' ? errorBody.message : `Wago HTTP ${response.status}`;
      this.logger.warn(
        `Wago HTTP ${response.status} code=${errorCode || 'UNKNOWN'} ` +
          `tujuan=${this.maskPhone(phoneNumber)}`,
      );
      throw new NotificationChannelError(kind, detail);
    } catch (error) {
      if (error instanceof NotificationChannelError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NotificationChannelError('TIMEOUT', 'Wago request timeout');
      }
      throw new NotificationChannelError(
        'UNAVAILABLE',
        error instanceof Error ? error.message : 'Wago tidak tersedia',
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private async readSuccessBody(response: Response): Promise<WagoSuccessBody> {
    try {
      const parsed: unknown = await response.json();
      if (typeof parsed !== 'object' || parsed === null) return {};
      const record = parsed as Record<string, unknown>;
      return { messageId: record.messageId };
    } catch {
      return {};
    }
  }

  private async readErrorBody(response: Response): Promise<WagoErrorBody> {
    try {
      const parsed: unknown = await response.json();
      if (typeof parsed !== 'object' || parsed === null) {
        return {};
      }
      const record = parsed as Record<string, unknown>;
      return {
        error: record.error,
        message: record.message,
      };
    } catch {
      return {};
    }
  }

  private errorToKind(status: number, errorCode: string): NotificationChannelErrorKind {
    if (status === 401 || errorCode === 'UNAUTHORIZED') {
      return 'UNAUTHORIZED';
    }
    if (errorCode === 'API_KEY_REQUIRED') {
      return 'CONFIGURATION';
    }
    if (
      errorCode === 'RECIPIENT_NOT_ALLOWED' ||
      errorCode === 'RECIPIENT_OPTED_OUT' ||
      errorCode === 'INVALID_PHONE' ||
      errorCode === 'PHONE_NOT_ON_WHATSAPP'
    ) {
      return 'BAD_RECIPIENT';
    }
    if (
      status === 429 ||
      errorCode.endsWith('_RATE_LIMITED') ||
      errorCode === 'WA_REACHOUT_RESTRICTED'
    ) {
      return 'RATE_LIMITED';
    }
    if (
      status >= 500 ||
      errorCode === 'WHATSAPP_NOT_CONNECTED' ||
      errorCode === 'OUTBOUND_PAUSED' ||
      errorCode === 'MESSAGE_REJECTED'
    ) {
      return 'UNAVAILABLE';
    }
    return 'UNKNOWN';
  }

  private normalizePhone(phone: string): string {
    let normalized = phone.replace(/[^0-9]/g, '');
    if (normalized.startsWith('0')) {
      normalized = `62${normalized.slice(1)}`;
    }
    return normalized;
  }

  private maskPhone(phone: string): string {
    const normalized = phone.replace(/[^0-9]/g, '');
    if (normalized.length <= 4) {
      return '***';
    }
    return `${normalized.slice(0, 4)}***${normalized.slice(-2)}`;
  }
}
