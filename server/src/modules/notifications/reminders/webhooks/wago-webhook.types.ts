export type WagoWebhookSignatureInput = Readonly<{
  webhookId: string;
  timestamp: string;
  signatureHeader: string;
  rawBody: Buffer;
}>;

export type TrustedWagoWebhookEvent =
  | Readonly<{
      version: '1';
      id: string;
      event: 'message.server_accepted';
      createdAt: Date;
      data: Readonly<{
        messageId: string;
        status: 'accepted';
      }>;
    }>
  | Readonly<{
      version: '1';
      id: string;
      event: 'message.rejected';
      createdAt: Date;
      data: Readonly<{
        messageId: string;
        status: 'rejected';
        error?: string;
      }>;
    }>;
