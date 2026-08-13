export const NOTIFICATION_CHANNEL = Symbol('NOTIFICATION_CHANNEL');

export type NotificationChannelErrorKind =
  | 'CONFIGURATION'
  | 'BAD_RECIPIENT'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export class NotificationChannelError extends Error {
  constructor(
    readonly kind: NotificationChannelErrorKind,
    message: string,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'NotificationChannelError';
  }
}

export type NotificationSendOptions = Readonly<{
  idempotencyKey?: string;
}>;

export type NotificationSendReceipt = Readonly<{
  transportMessageId: string | null;
  status: 'pending';
}>;

export interface NotificationChannel {
  /** Kirim pesan ke tujuan dan kembalikan identitas transport bila tersedia. */
  send(
    destination: string,
    message: string,
    options?: NotificationSendOptions,
  ): Promise<NotificationSendReceipt>;
}
