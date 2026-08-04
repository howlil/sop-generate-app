import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PeranPengguna, StatusPengajuanEvaluasi } from '../../../generated/prisma';
import {
  isWhatsappRecipientAllowed,
  normalizeIndonesianWhatsappNumber,
  parseWhatsappRecipientAllowlist,
} from './whatsapp-phone.util';
import type {
  ActionablePengajuan,
  ActiveWhatsappRecipient,
  DesiredWhatsappReminder,
} from './whatsapp-reminder.types';
import { REMINDER_KIND_BY_STATUS } from './whatsapp-reminder.types';

@Injectable()
export class WhatsappRecipientResolverService {
  private readonly logger = new Logger(WhatsappRecipientResolverService.name);
  private readonly allowlist: ReadonlySet<string>;
  private readonly loggedIssues = new Set<string>();

  constructor(config: ConfigService) {
    this.allowlist = parseWhatsappRecipientAllowlist(
      config.get<string>('WHATSAPP_ALLOWED_RECIPIENTS', ''),
    );
  }

  resolve(
    pengajuan: ActionablePengajuan,
    recipients: readonly ActiveWhatsappRecipient[],
  ): DesiredWhatsappReminder[] {
    const kind = REMINDER_KIND_BY_STATUS[pengajuan.status];
    if (kind === undefined) {
      return [];
    }
    const selected = this.selectRecipients(pengajuan, recipients);
    const desired: DesiredWhatsappReminder[] = [];
    const seenNumbers = new Set<string>();
    let invalidCount = 0;
    let outsideAllowlistCount = 0;

    for (const recipient of selected) {
      const normalized = normalizeIndonesianWhatsappNumber(recipient.nohp);
      if (normalized === null) {
        invalidCount += 1;
        continue;
      }
      if (!isWhatsappRecipientAllowed(this.allowlist, normalized)) {
        outsideAllowlistCount += 1;
        continue;
      }
      if (seenNumbers.has(normalized)) {
        continue;
      }
      seenNumbers.add(normalized);
      desired.push({
        pengajuanEvaluasiId: pengajuan.pengajuanEvaluasiId,
        penggunaId: recipient.penggunaId,
        jenis: kind,
        nomorTujuan: normalized,
      });
    }

    if (invalidCount > 0 || outsideAllowlistCount > 0) {
      this.warnOnce(
        `recipient:${pengajuan.pengajuanEvaluasiId}:${String(pengajuan.status)}:${invalidCount}:${outsideAllowlistCount}`,
        `Sebagian penerima reminder dilewati pengajuan=${pengajuan.pengajuanEvaluasiId} ` +
          `invalid=${invalidCount} outsideAllowlist=${outsideAllowlistCount}`,
      );
    }
    return desired;
  }

  private selectRecipients(
    pengajuan: ActionablePengajuan,
    recipients: readonly ActiveWhatsappRecipient[],
  ): ActiveWhatsappRecipient[] {
    switch (pengajuan.status) {
      case StatusPengajuanEvaluasi.SEDANG_DIEVALUASI:
        return recipients.filter((recipient) => recipient.peran === PeranPengguna.EVALUATOR);
      case StatusPengajuanEvaluasi.SELESAI_DIEVALUASI:
        return this.requireSingleton(
          pengajuan,
          recipients.filter((recipient) => recipient.peran === PeranPengguna.PJ_EVALUATOR),
          'PJ_EVALUATOR',
        );
      case StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR:
        return this.requireSingleton(
          pengajuan,
          recipients.filter(
            (recipient) =>
              recipient.peran === PeranPengguna.PJ_PENYUSUN && recipient.opdId === pengajuan.opdId,
          ),
          'PJ_PENYUSUN',
        );
      case StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN:
        return this.requireSingleton(
          pengajuan,
          recipients.filter(
            (recipient) =>
              recipient.peran === PeranPengguna.KEPALA_OPD && recipient.opdId === pengajuan.opdId,
          ),
          'KEPALA_OPD',
        );
      default:
        return [];
    }
  }

  private requireSingleton(
    pengajuan: ActionablePengajuan,
    recipients: ActiveWhatsappRecipient[],
    role: string,
  ): ActiveWhatsappRecipient[] {
    if (recipients.length === 1) {
      return recipients;
    }
    this.errorOnce(
      `singleton:${pengajuan.pengajuanEvaluasiId}:${String(pengajuan.status)}:${role}:${recipients.length}`,
      `Invariant penerima ${role} tidak terpenuhi pengajuan=${pengajuan.pengajuanEvaluasiId} ` +
        `opd=${pengajuan.opdId} jumlah=${recipients.length}; reminder tidak dibuat`,
    );
    return [];
  }

  private warnOnce(key: string, message: string): void {
    if (!this.loggedIssues.has(key)) {
      this.loggedIssues.add(key);
      this.logger.warn(message);
    }
  }

  private errorOnce(key: string, message: string): void {
    if (!this.loggedIssues.has(key)) {
      this.loggedIssues.add(key);
      this.logger.error(message);
    }
  }
}
