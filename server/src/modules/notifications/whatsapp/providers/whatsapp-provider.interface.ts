export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export type WhatsappProviderErrorKind =
  | 'BAD_RECIPIENT'
  | 'INVALID_RESPONSE'
  | 'RATE_LIMITED'
  | 'SESSION_NOT_READY'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export class WhatsappProviderError extends Error {
  constructor(
    readonly kind: WhatsappProviderErrorKind,
    message: string,
    readonly retryAfterMs?: number,
    readonly ambiguousDelivery = false,
  ) {
    super(message);
    this.name = 'WhatsappProviderError';
  }
}

export interface WhatsappProvider {
  assertReady(): Promise<void>;
  sendText(input: Readonly<{ nomorTujuan: string; text: string }>): Promise<void>;
}
