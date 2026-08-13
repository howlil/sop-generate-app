import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WagoWebhookSignatureInput } from './wago-webhook.types';

const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;
const SHA256_DIGEST_BYTES = 32;
const BASE64_SIGNATURE_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

@Injectable()
export class WagoWebhookSignatureService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.get<string>('WAGO_WEBHOOK_SECRET', '').trim();
  }

  verify(input: WagoWebhookSignatureInput, now = new Date()): void {
    if (this.secret === '') {
      throw new ServiceUnavailableException('Wago webhook receiver is not configured');
    }

    const timestampSeconds = this.parseTimestamp(input.timestamp);
    const nowSeconds = Math.floor(now.getTime() / 1000);
    if (Math.abs(nowSeconds - timestampSeconds) > WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS) {
      throw new UnauthorizedException('Wago webhook timestamp is outside the accepted window');
    }

    const expected = createHmac('sha256', this.secret)
      .update(`${input.webhookId}.${input.timestamp}.`, 'utf8')
      .update(input.rawBody)
      .digest();

    const matches = input.signatureHeader
      .trim()
      .split(/\s+/)
      .some((candidate) => this.matchesSignature(candidate, expected));

    if (!matches) {
      throw new UnauthorizedException('Invalid Wago webhook signature');
    }
  }

  private parseTimestamp(value: string): number {
    if (!/^\d+$/.test(value)) {
      throw new UnauthorizedException('Invalid Wago webhook timestamp');
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) {
      throw new UnauthorizedException('Invalid Wago webhook timestamp');
    }
    return parsed;
  }

  private matchesSignature(candidate: string, expected: Buffer): boolean {
    const [version, encoded, extra] = candidate.split(',');
    if (version !== 'v1' || encoded === undefined || extra !== undefined) return false;
    if (!BASE64_SIGNATURE_PATTERN.test(encoded)) return false;

    const decoded = Buffer.from(encoded, 'base64');
    if (decoded.length !== SHA256_DIGEST_BYTES || decoded.length !== expected.length) return false;
    return timingSafeEqual(decoded, expected);
  }
}
