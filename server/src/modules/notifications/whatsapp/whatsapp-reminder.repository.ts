import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PeranPengguna } from '../../../generated/prisma';
import type {
  ActionablePengajuan,
  ActiveWhatsappRecipient,
  ClaimedWhatsappReminder,
  DesiredWhatsappReminder,
} from './whatsapp-reminder.types';
import { ACTIONABLE_REMINDER_STATUSES } from './whatsapp-reminder.types';

const NOTIFICATION_ROLES: readonly PeranPengguna[] = [
  PeranPengguna.EVALUATOR,
  PeranPengguna.PJ_EVALUATOR,
  PeranPengguna.PJ_PENYUSUN,
  PeranPengguna.KEPALA_OPD,
] as const;

@Injectable()
export class WhatsappReminderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActionablePengajuan(): Promise<ActionablePengajuan[]> {
    const rows = await this.prisma.pengajuanEvaluasi.findMany({
      where: { status: { in: [...ACTIONABLE_REMINDER_STATUSES] } },
      select: {
        pengajuanEvaluasiId: true,
        opdId: true,
        nomorBA: true,
        status: true,
        opd: { select: { nama: true } },
        _count: { select: { nilaiEvaluasi: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => ({
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      opdId: row.opdId,
      opdNama: row.opd.nama,
      nomorBA: row.nomorBA,
      status: row.status,
      jumlahSop: row._count.nilaiEvaluasi,
    }));
  }

  async findActiveRecipients(): Promise<ActiveWhatsappRecipient[]> {
    return this.prisma.pengguna.findMany({
      where: { deletedAt: null, peran: { in: [...NOTIFICATION_ROLES] } },
      select: { penggunaId: true, opdId: true, nama: true, nohp: true, peran: true },
      orderBy: { penggunaId: 'asc' },
    });
  }

  async findExistingReminders(): Promise<
    Array<{
      pengingatWhatsAppId: string;
      pengajuanEvaluasiId: string;
      penggunaId: string;
      jenis: DesiredWhatsappReminder['jenis'];
    }>
  > {
    return this.prisma.pengingatWhatsApp.findMany({
      select: {
        pengingatWhatsAppId: true,
        pengajuanEvaluasiId: true,
        penggunaId: true,
        jenis: true,
      },
    });
  }

  async upsertDesiredReminder(reminder: DesiredWhatsappReminder, now: Date): Promise<void> {
    await this.prisma.pengingatWhatsApp.upsert({
      where: {
        pengajuanEvaluasiId_penggunaId_jenis: {
          pengajuanEvaluasiId: reminder.pengajuanEvaluasiId,
          penggunaId: reminder.penggunaId,
          jenis: reminder.jenis,
        },
      },
      create: { ...reminder, nextSendAt: now },
      update: { nomorTujuan: reminder.nomorTujuan },
    });
  }

  async deleteReminderIds(ids: readonly string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }
    const result = await this.prisma.pengingatWhatsApp.deleteMany({
      where: { pengingatWhatsAppId: { in: [...ids] } },
    });
    return result.count;
  }

  async findDueCandidateIds(now: Date, take: number): Promise<string[]> {
    const rows = await this.prisma.pengingatWhatsApp.findMany({
      where: {
        nextSendAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      select: { pengingatWhatsAppId: true },
      orderBy: [{ nextSendAt: 'asc' }, { createdAt: 'asc' }],
      take,
    });
    return rows.map((row) => row.pengingatWhatsAppId);
  }

  async tryClaim(
    pengingatWhatsAppId: string,
    lockToken: string,
    now: Date,
    lockedUntil: Date,
  ): Promise<boolean> {
    const result = await this.prisma.pengingatWhatsApp.updateMany({
      where: {
        pengingatWhatsAppId,
        nextSendAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      data: { lockToken, lockedUntil },
    });
    return result.count === 1;
  }

  async findClaimed(
    pengingatWhatsAppId: string,
    lockToken: string,
  ): Promise<ClaimedWhatsappReminder | null> {
    const row = await this.prisma.pengingatWhatsApp.findFirst({
      where: { pengingatWhatsAppId, lockToken },
      select: {
        pengingatWhatsAppId: true,
        pengajuanEvaluasiId: true,
        penggunaId: true,
        jenis: true,
        nomorTujuan: true,
        consecutiveFailures: true,
        lockToken: true,
        pengajuanEvaluasi: {
          select: {
            pengajuanEvaluasiId: true,
            opdId: true,
            nomorBA: true,
            status: true,
            opd: { select: { nama: true } },
            _count: { select: { nilaiEvaluasi: true } },
          },
        },
        pengguna: {
          select: {
            penggunaId: true,
            opdId: true,
            nama: true,
            nohp: true,
            peran: true,
            deletedAt: true,
          },
        },
      },
    });
    if (row === null) {
      return null;
    }
    return {
      pengingatWhatsAppId: row.pengingatWhatsAppId,
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      penggunaId: row.penggunaId,
      jenis: row.jenis,
      nomorTujuan: row.nomorTujuan,
      consecutiveFailures: row.consecutiveFailures,
      lockToken: row.lockToken,
      pengajuanEvaluasi: {
        pengajuanEvaluasiId: row.pengajuanEvaluasi.pengajuanEvaluasiId,
        opdId: row.pengajuanEvaluasi.opdId,
        opdNama: row.pengajuanEvaluasi.opd.nama,
        nomorBA: row.pengajuanEvaluasi.nomorBA,
        status: row.pengajuanEvaluasi.status,
        jumlahSop: row.pengajuanEvaluasi._count.nilaiEvaluasi,
      },
      pengguna: row.pengguna,
    };
  }

  async markSuccess(
    pengingatWhatsAppId: string,
    lockToken: string,
    sentAt: Date,
    nextSendAt: Date,
  ): Promise<boolean> {
    const result = await this.prisma.pengingatWhatsApp.updateMany({
      where: { pengingatWhatsAppId, lockToken },
      data: {
        lastSentAt: sentAt,
        nextSendAt,
        consecutiveFailures: 0,
        lastErrorKind: null,
        lockToken: null,
        lockedUntil: null,
      },
    });
    return result.count === 1;
  }

  async markFailure(
    pengingatWhatsAppId: string,
    lockToken: string,
    nextSendAt: Date,
    errorKind: string,
  ): Promise<boolean> {
    const result = await this.prisma.pengingatWhatsApp.updateMany({
      where: { pengingatWhatsAppId, lockToken },
      data: {
        nextSendAt,
        consecutiveFailures: { increment: 1 },
        lastErrorKind: errorKind,
        lockToken: null,
        lockedUntil: null,
      },
    });
    return result.count === 1;
  }

  async deleteClaimed(pengingatWhatsAppId: string, lockToken: string): Promise<boolean> {
    const result = await this.prisma.pengingatWhatsApp.deleteMany({
      where: { pengingatWhatsAppId, lockToken },
    });
    return result.count === 1;
  }
}
