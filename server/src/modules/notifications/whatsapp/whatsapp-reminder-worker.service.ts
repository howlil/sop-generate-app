import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PeranPengguna } from '../../../generated/prisma';
import { WhatsappMessageFactory } from './whatsapp-message.factory';
import {
  maskWhatsappNumber,
  normalizeIndonesianWhatsappNumber,
  parseWhatsappRecipientAllowlist,
} from './whatsapp-phone.util';
import { WhatsappReminderRepository } from './whatsapp-reminder.repository';
import {
  EXPECTED_ROLE_BY_REMINDER_KIND,
  EXPECTED_STATUS_BY_REMINDER_KIND,
  type ClaimedWhatsappReminder,
} from './whatsapp-reminder.types';
import {
  WHATSAPP_PROVIDER,
  WhatsappProviderError,
  type WhatsappProvider,
} from './providers/whatsapp-provider.interface';

const TRANSIENT_BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000] as const;
const CONFIGURATION_RETRY_MS = 5 * 60_000;

@Injectable()
export class WhatsappReminderWorkerService {
  private readonly logger = new Logger(WhatsappReminderWorkerService.name);
  private readonly maxConcurrency: number;
  private readonly leaseMs: number;
  private readonly reminderIntervalMs: number;
  private readonly allowlist: ReadonlySet<string>;

  constructor(
    private readonly repository: WhatsappReminderRepository,
    private readonly messageFactory: WhatsappMessageFactory,
    config: ConfigService,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsappProvider,
  ) {
    this.maxConcurrency = config.get<number>('WHATSAPP_MAX_CONCURRENCY', 3);
    this.leaseMs = config.get<number>('WHATSAPP_LOCK_LEASE_SECONDS', 60) * 1_000;
    this.reminderIntervalMs =
      config.get<number>('WHATSAPP_REMINDER_INTERVAL_MINUTES', 1_440) * 60_000;
    this.allowlist = parseWhatsappRecipientAllowlist(
      config.get<string>('WHATSAPP_ALLOWED_RECIPIENTS', ''),
    );
  }

  async processDue(now = new Date()): Promise<{ candidates: number; processed: number }> {
    const candidateIds = await this.repository.findDueCandidateIds(
      now,
      Math.max(this.maxConcurrency * 4, this.maxConcurrency),
    );
    if (candidateIds.length === 0) {
      return { candidates: 0, processed: 0 };
    }

    let readiness: Promise<void> | undefined;
    const getReadiness = (): Promise<void> => {
      readiness ??= this.provider.assertReady();
      return readiness;
    };
    let processed = 0;
    for (let offset = 0; offset < candidateIds.length; offset += this.maxConcurrency) {
      const batch = candidateIds.slice(offset, offset + this.maxConcurrency);
      const results = await Promise.all(
        batch.map((id) =>
          this.processOne(id, now, getReadiness).catch((error) => {
            this.logger.error(
              `Worker reminder gagal tak terduga id=${id}: ${error instanceof Error ? error.message : String(error)}`,
            );
            return false;
          }),
        ),
      );
      processed += results.filter(Boolean).length;
    }
    return { candidates: candidateIds.length, processed };
  }

  private async processOne(
    pengingatWhatsAppId: string,
    now: Date,
    getReadiness: () => Promise<void>,
  ): Promise<boolean> {
    const lockToken = randomUUID();
    const claimed = await this.repository.tryClaim(
      pengingatWhatsAppId,
      lockToken,
      now,
      new Date(now.getTime() + this.leaseMs),
    );
    if (!claimed) {
      return false;
    }
    const reminder = await this.repository.findClaimed(pengingatWhatsAppId, lockToken);
    if (reminder === null) {
      return false;
    }
    if (!this.isStillEligible(reminder)) {
      await this.repository.deleteClaimed(pengingatWhatsAppId, lockToken);
      return true;
    }

    try {
      await getReadiness();
      await this.provider.sendText({
        nomorTujuan: reminder.nomorTujuan,
        text: this.messageFactory.build(reminder),
      });
      const sentAt = new Date();
      await this.repository.markSuccess(
        pengingatWhatsAppId,
        lockToken,
        sentAt,
        new Date(sentAt.getTime() + this.reminderIntervalMs),
      );
      this.logger.log(
        `Reminder terkirim id=${pengingatWhatsAppId} jenis=${String(reminder.jenis)} ` +
          `tujuan=${maskWhatsappNumber(reminder.nomorTujuan)}`,
      );
      return true;
    } catch (error) {
      const providerError = this.normalizeError(error);
      const nextSendAt = this.nextAttemptAt(providerError, reminder.consecutiveFailures, now);
      await this.repository.markFailure(
        pengingatWhatsAppId,
        lockToken,
        nextSendAt,
        providerError.kind,
      );
      this.logger.warn(
        `Reminder gagal id=${pengingatWhatsAppId} jenis=${String(reminder.jenis)} ` +
          `tujuan=${maskWhatsappNumber(reminder.nomorTujuan)} error=${providerError.kind} ` +
          `retryAt=${nextSendAt.toISOString()}`,
      );
      return true;
    }
  }

  private isStillEligible(reminder: ClaimedWhatsappReminder): boolean {
    if (
      reminder.pengajuanEvaluasi.status !== EXPECTED_STATUS_BY_REMINDER_KIND[reminder.jenis] ||
      reminder.pengguna.deletedAt !== null ||
      reminder.pengguna.peran !== EXPECTED_ROLE_BY_REMINDER_KIND[reminder.jenis]
    ) {
      return false;
    }
    if (
      reminder.pengguna.peran === PeranPengguna.PJ_PENYUSUN ||
      reminder.pengguna.peran === PeranPengguna.KEPALA_OPD
    ) {
      if (reminder.pengguna.opdId !== reminder.pengajuanEvaluasi.opdId) {
        return false;
      }
    }
    const normalized = normalizeIndonesianWhatsappNumber(reminder.pengguna.nohp);
    return normalized === reminder.nomorTujuan && this.allowlist.has(reminder.nomorTujuan);
  }

  private normalizeError(error: unknown): WhatsappProviderError {
    if (error instanceof WhatsappProviderError) {
      return error;
    }
    return new WhatsappProviderError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Kegagalan provider tidak diketahui',
    );
  }

  private nextAttemptAt(
    error: WhatsappProviderError,
    consecutiveFailures: number,
    now: Date,
  ): Date {
    if (error.ambiguousDelivery || error.kind === 'BAD_RECIPIENT') {
      return new Date(now.getTime() + this.reminderIntervalMs);
    }
    if (error.retryAfterMs !== undefined) {
      return new Date(now.getTime() + error.retryAfterMs);
    }
    if (error.kind === 'UNAUTHORIZED' || error.kind === 'SESSION_NOT_READY') {
      return new Date(now.getTime() + CONFIGURATION_RETRY_MS);
    }
    const index = Math.min(consecutiveFailures, TRANSIENT_BACKOFF_MS.length - 1);
    return new Date(now.getTime() + TRANSIENT_BACKOFF_MS[index]);
  }
}
