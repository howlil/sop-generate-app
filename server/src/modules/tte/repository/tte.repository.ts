import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  PeranTTE,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';

@Injectable()
export class TteRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- KredensialTTE ----

  async findKredensial(userId: string) {
    return this.prisma.kredensialTTE.findUnique({ where: { userId } });
  }

  async upsertKredensial(userId: string, pin: string, peran: PeranTTE) {
    const hashPin = await bcrypt.hash(pin, 10);
    return this.prisma.kredensialTTE.upsert({
      where: { userId },
      update: { hashPin, peran },
      create: { userId, hashPin, peran },
    });
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const kredensial = await this.prisma.kredensialTTE.findUnique({
      where: { userId },
      select: { hashPin: true },
    });
    if (!kredensial) return false;
    return bcrypt.compare(pin, kredensial.hashPin);
  }

  // TTE-02: generate and store verification token
  async generateVerifikasiToken(userId: string) {
    const token = randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.prisma.kredensialTTE.update({
      where: { userId },
      data: { tokenVerifikasi: token, tokenExpiry: expiry },
    });
    return token;
  }

  // TTE-02: confirm email via token
  async konfirmasiEmail(token: string) {
    const kredensial = await this.prisma.kredensialTTE.findFirst({
      where: {
        tokenVerifikasi: token,
        tokenExpiry: { gt: new Date() },
      },
    });
    if (!kredensial) return null;

    return this.prisma.kredensialTTE.update({
      where: { id: kredensial.id },
      data: {
        emailTerverifikasi: true,
        tokenVerifikasi: null,
        tokenExpiry: null,
      },
    });
  }

  // ---- RiwayatTandaTangan ----

  async findRiwayatByUser(userId: string) {
    return this.prisma.riwayatTandaTangan.findMany({
      where: { userId },
      orderBy: { ditandatanganiPada: 'desc' },
      include: {
        sopDetail: { select: { id: true } },
        pengajuanEvaluasi: { select: { id: true, opdId: true } },
      },
    });
  }

  async findTteBa(pengajuanEvaluasiId: string, peran: PeranTTE) {
    return this.prisma.riwayatTandaTangan.findUnique({
      where: { pengajuanEvaluasiId_peran: { pengajuanEvaluasiId, peran } },
    });
  }

  async findTteSop(sopDetailId: string, peran: PeranTTE) {
    return this.prisma.riwayatTandaTangan.findUnique({
      where: { sopDetailId_peran: { sopDetailId, peran } },
    });
  }

  // TTE-05: Biro signs BA → DIVERIFIKASI_BIRO, SOPs → DIVERIFIKASI_BIRO_ORGANISASI
  async tandaTanganiBaOlehBiro(
    userId: string,
    pengajuanId: string,
    nomorDokumen: string,
    judulDokumen: string,
  ) {
    const hashDokumen = createHash('sha256')
      .update(`${userId}:${pengajuanId}:${Date.now()}`)
      .digest('hex');

    return this.prisma.$transaction(async (tx) => {
      // Get all NilaiEvaluasi sopDetailIds
      const nilaiList = await tx.nilaiEvaluasi.findMany({
        where: { pengajuanEvaluasiId: pengajuanId },
        select: { sopDetailId: true },
      });

      // Update all DetailSOP → DIVERIFIKASI_BIRO_ORGANISASI
      await tx.detailSOP.updateMany({
        where: { id: { in: nilaiList.map((n) => n.sopDetailId) } },
        data: { status: StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI },
      });

      // Update PengajuanEvaluasi → DIVERIFIKASI_BIRO
      await tx.pengajuanEvaluasi.update({
        where: { id: pengajuanId },
        data: {
          status: StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO,
          diverifikasiOlehUserId: userId,
        },
      });

      // Create RiwayatTandaTangan [TTE-12]
      return tx.riwayatTandaTangan.create({
        data: {
          userId,
          peran: PeranTTE.BIRO_ORGANISASI,
          nomorDokumen,
          jenisDokumen: 'BERITA_ACARA',
          judulDokumen,
          hashDokumen,
          pengajuanEvaluasiId: pengajuanId,
        },
      });
    });
  }

  // TTE-06: Koordinator signs BA → DITANDATANGANI_KOORDINATOR
  async tandaTanganiBaOlehKoordinator(
    userId: string,
    pengajuanId: string,
    nomorDokumen: string,
    judulDokumen: string,
  ) {
    const hashDokumen = createHash('sha256')
      .update(`${userId}:${pengajuanId}:${Date.now()}`)
      .digest('hex');

    return this.prisma.$transaction(async (tx) => {
      await tx.pengajuanEvaluasi.update({
        where: { id: pengajuanId },
        data: {
          status: StatusPengajuanEvaluasi.DITANDATANGANI_KOORDINATOR,
          ditandatanganiOlehKoordinatorUserId: userId,
          tanggalTTDBaKoordinator: new Date(),
        },
      });

      return tx.riwayatTandaTangan.create({
        data: {
          userId,
          peran: PeranTTE.KOORDINATOR_TIM_PENYUSUN,
          nomorDokumen,
          jenisDokumen: 'BERITA_ACARA',
          judulDokumen,
          hashDokumen,
          pengajuanEvaluasiId: pengajuanId,
        },
      });
    });
  }

  // TTE-07: Kepala OPD signs individual DetailSOP → BERLAKU
  async tandaTanganiSop(
    userId: string,
    sopDetailId: string,
    nomorDokumen: string,
    judulDokumen: string,
  ) {
    const hashDokumen = createHash('sha256')
      .update(`${userId}:${sopDetailId}:${Date.now()}`)
      .digest('hex');

    return this.prisma.$transaction(async (tx) => {
      // [P2-B]: atomically set any existing BERLAKU version → DIGANTIKAN
      const detail = await tx.detailSOP.findUniqueOrThrow({
        where: { id: sopDetailId },
        select: { sopId: true },
      });
      await tx.detailSOP.updateMany({
        where: {
          sopId: detail.sopId,
          status: StatusSOP.BERLAKU,
          id: { not: sopDetailId },
        },
        data: { status: StatusSOP.DIGANTIKAN },
      });

      await tx.detailSOP.update({
        where: { id: sopDetailId },
        data: { status: StatusSOP.BERLAKU },
      });

      return tx.riwayatTandaTangan.create({
        data: {
          userId,
          peran: PeranTTE.KEPALA_OPD,
          nomorDokumen,
          jenisDokumen: 'SOP',
          judulDokumen,
          hashDokumen,
          sopDetailId,
        },
      });
    });
  }

  // For EVL-09 / TTE-11 validation: check all nilai filled for a pengajuan
  async allNilaiIsiForPengajuan(pengajuanId: string): Promise<boolean> {
    const unfilled = await this.prisma.nilaiEvaluasi.count({
      where: { pengajuanEvaluasiId: pengajuanId, hasil: null },
    });
    return unfilled === 0;
  }

  async findPengajuan(id: string) {
    return this.prisma.pengajuanEvaluasi.findUnique({
      where: { id },
      select: { status: true, opdId: true },
    });
  }

  async findDetailSop(id: string) {
    return this.prisma.detailSOP.findUnique({
      where: { id },
      select: { status: true, sop: { select: { opdId: true } } },
    });
  }
}
