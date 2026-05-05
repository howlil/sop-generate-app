import { Injectable } from '@nestjs/common';
import {
  JenisDokumenTte,
  PeranPengguna,
  Prisma,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import { PrismaService } from '../../common/prisma/prisma.service';

export type TtePenggunaRingkas = {
  readonly penggunaId: string;
  readonly email: string;
  readonly nama: string;
  readonly nip: string;
  readonly jabatan: string;
  readonly pangkat: string;
  readonly peran: PeranPengguna;
  readonly opdId: string;
};

export type TteKredensialRow = {
  readonly kredensialTteId: string;
  readonly userId: string;
  readonly hashPin: string;
  readonly emailTerverifikasi: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

@Injectable()
export class TteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPenggunaAktif(userId: string): Promise<TtePenggunaRingkas | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId: userId, deletedAt: null },
      select: {
        penggunaId: true,
        email: true,
        nama: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        peran: true,
        opdId: true,
      },
    });
    return row;
  }

  async findKredensial(userId: string): Promise<TteKredensialRow | null> {
    return this.prisma.kredensialTTE.findUnique({
      where: { userId },
    });
  }

  async upsertKredensialPin(params: {
    userId: string;
    hashPin: string;
    emailTerverifikasi: boolean;
  }): Promise<TteKredensialRow> {
    return this.prisma.kredensialTTE.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        hashPin: params.hashPin,
        emailTerverifikasi: params.emailTerverifikasi,
      },
      update: {
        hashPin: params.hashPin,
        emailTerverifikasi: params.emailTerverifikasi,
        tokenVerifikasi: null,
        tokenExpiry: null,
      },
    });
  }

  async findRiwayatUser(userId: string) {
    return this.prisma.riwayatTandaTangan.findMany({
      where: { userId },
      orderBy: { ditandatanganiPada: 'desc' },
      include: {
        dokumenTte: true,
        user: {
          select: { penggunaId: true, nama: true, nip: true },
        },
      },
    });
  }

  async assertRiwayatBelumAda(
    tx: Prisma.TransactionClient,
    dokumenTteId: string,
    peran: PeranPengguna,
  ) {
    return tx.riwayatTandaTangan.findUnique({
      where: {
        dokumenTteId_peran: { dokumenTteId, peran },
      },
    });
  }

  /**
   * PJ Evaluator menandatangani BA: pengajuan SELESAI_DIEVALUASI → DIVERIFIKASI_BIRO.
   */
  async transaksiTandaTanganiBaEvaluator(params: {
    pengajuanEvaluasiId: string;
    userId: string;
    peran: PeranPengguna;
    hashDokumen: string;
    nomorDokumen: string;
    judulDokumen: string;
    signatureFields: {
      signatureValue: string;
      signatureAlgorithm: string;
      signatureFormat: string;
      certSerialNumber: string;
      certIssuer: string;
      certSubject: string;
      certFingerprint: string;
      certValidFrom: Date;
      certValidTo: Date;
      keyId: string;
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      const pengajuan = await tx.pengajuanEvaluasi.findUnique({
        where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
        include: { nilaiEvaluasi: { select: { detailSopId: true } } },
      });
      if (pengajuan === null) {
        return { error: 'NOT_FOUND' as const };
      }
      if (pengajuan.status !== StatusPengajuanEvaluasi.SELESAI_DIEVALUASI) {
        return { error: 'BAD_STATUS' as const, status: pengajuan.status };
      }
      let dokumen = await tx.dokumenTte.findUnique({
        where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
      });
      if (dokumen === null) {
        dokumen = await tx.dokumenTte.create({
          data: {
            nomorDokumen: params.nomorDokumen,
            judulDokumen: params.judulDokumen,
            hashDokumen: params.hashDokumen,
            jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
            pengajuanEvaluasiId: params.pengajuanEvaluasiId,
            metodeKanonikalisasi: 'SHA256-MOCK-BSRE-v1',
          },
        });
      } else {
        await tx.dokumenTte.update({
          where: { dokumenTteId: dokumen.dokumenTteId },
          data: {
            nomorDokumen: params.nomorDokumen,
            judulDokumen: params.judulDokumen,
            hashDokumen: params.hashDokumen,
          },
        });
      }
      const dup = await this.assertRiwayatBelumAda(tx, dokumen.dokumenTteId, params.peran);
      if (dup !== null) {
        return { error: 'ALREADY_SIGNED' as const };
      }
      await tx.riwayatTandaTangan.create({
        data: {
          userId: params.userId,
          dokumenTteId: dokumen.dokumenTteId,
          peran: params.peran,
          signatureValue: params.signatureFields.signatureValue,
          signatureAlgorithm: params.signatureFields.signatureAlgorithm,
          signatureFormat: params.signatureFields.signatureFormat,
          certSerialNumber: params.signatureFields.certSerialNumber,
          certIssuer: params.signatureFields.certIssuer,
          certSubject: params.signatureFields.certSubject,
          certFingerprint: params.signatureFields.certFingerprint,
          certValidFrom: params.signatureFields.certValidFrom,
          certValidTo: params.signatureFields.certValidTo,
          keyId: params.signatureFields.keyId,
        },
      });
      await tx.pengajuanEvaluasi.update({
        where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
        data: {
          status: StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO,
          diverifikasiOlehUserId: params.userId,
          version: { increment: 1 },
        },
      });
      const riwayat = await tx.riwayatTandaTangan.findFirst({
        where: {
          dokumenTteId: dokumen.dokumenTteId,
          userId: params.userId,
          peran: params.peran,
        },
        include: {
          dokumenTte: true,
          user: { select: { penggunaId: true, nama: true, nip: true } },
        },
      });
      return { ok: true as const, riwayat };
    });
  }

  /**
   * PJ Penyusun menandatangani BA: DIVERIFIKASI_BIRO → DITANDATANGANI_KOORDINATOR; DetailSOP SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI.
   */
  async transaksiTandaTanganiBaKoordinator(params: {
    pengajuanEvaluasiId: string;
    userId: string;
    userOpdId: string;
    peran: PeranPengguna;
    hashDokumen: string;
    nomorDokumen: string;
    judulDokumen: string;
    signatureFields: {
      signatureValue: string;
      signatureAlgorithm: string;
      signatureFormat: string;
      certSerialNumber: string;
      certIssuer: string;
      certSubject: string;
      certFingerprint: string;
      certValidFrom: Date;
      certValidTo: Date;
      keyId: string;
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      const pengajuan = await tx.pengajuanEvaluasi.findUnique({
        where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
        include: { nilaiEvaluasi: { select: { detailSopId: true } } },
      });
      if (pengajuan === null) {
        return { error: 'NOT_FOUND' as const };
      }
      if (pengajuan.opdId !== params.userOpdId) {
        return { error: 'FORBIDDEN_OPD' as const };
      }
      if (pengajuan.status !== StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO) {
        return { error: 'BAD_STATUS' as const, status: pengajuan.status };
      }
      const dokumen =
        (await tx.dokumenTte.findUnique({
          where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
        })) ??
        (await tx.dokumenTte.create({
          data: {
            nomorDokumen: params.nomorDokumen,
            judulDokumen: params.judulDokumen,
            hashDokumen: params.hashDokumen,
            jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
            pengajuanEvaluasiId: params.pengajuanEvaluasiId,
            metodeKanonikalisasi: 'SHA256-MOCK-BSRE-v1',
          },
        }));
      if (dokumen.pengajuanEvaluasiId !== params.pengajuanEvaluasiId) {
        return { error: 'DOC_MISMATCH' as const };
      }
      await tx.dokumenTte.update({
        where: { dokumenTteId: dokumen.dokumenTteId },
        data: {
          nomorDokumen: params.nomorDokumen,
          judulDokumen: params.judulDokumen,
          hashDokumen: params.hashDokumen,
        },
      });
      const dup = await this.assertRiwayatBelumAda(tx, dokumen.dokumenTteId, params.peran);
      if (dup !== null) {
        return { error: 'ALREADY_SIGNED' as const };
      }
      await tx.riwayatTandaTangan.create({
        data: {
          userId: params.userId,
          dokumenTteId: dokumen.dokumenTteId,
          peran: params.peran,
          signatureValue: params.signatureFields.signatureValue,
          signatureAlgorithm: params.signatureFields.signatureAlgorithm,
          signatureFormat: params.signatureFields.signatureFormat,
          certSerialNumber: params.signatureFields.certSerialNumber,
          certIssuer: params.signatureFields.certIssuer,
          certSubject: params.signatureFields.certSubject,
          certFingerprint: params.signatureFields.certFingerprint,
          certValidFrom: params.signatureFields.certValidFrom,
          certValidTo: params.signatureFields.certValidTo,
          keyId: params.signatureFields.keyId,
        },
      });
      const detailIds = pengajuan.nilaiEvaluasi.map((n) => n.detailSopId);
      await tx.detailSOP.updateMany({
        where: {
          detailSopId: { in: detailIds },
          status: StatusSOP.SIAP_DIVERIFIKASI,
        },
        data: { status: StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI },
      });
      const sekarang = new Date();
      await tx.pengajuanEvaluasi.update({
        where: { pengajuanEvaluasiId: params.pengajuanEvaluasiId },
        data: {
          status: StatusPengajuanEvaluasi.DITANDATANGANI_KOORDINATOR,
          ditandatanganiOlehKoordinatorUserId: params.userId,
          tanggalTTDBaKoordinator: sekarang,
          version: { increment: 1 },
        },
      });
      const riwayat = await tx.riwayatTandaTangan.findFirst({
        where: {
          dokumenTteId: dokumen.dokumenTteId,
          userId: params.userId,
          peran: params.peran,
        },
        include: {
          dokumenTte: true,
          user: { select: { penggunaId: true, nama: true, nip: true } },
        },
      });
      return { ok: true as const, riwayat };
    });
  }

  async transaksiTandaTanganiSop(params: {
    detailSopId: string;
    userId: string;
    userOpdId: string;
    peran: PeranPengguna;
    hashDokumen: string;
    nomorDokumen: string;
    judulDokumen: string;
    signatureFields: {
      signatureValue: string;
      signatureAlgorithm: string;
      signatureFormat: string;
      certSerialNumber: string;
      certIssuer: string;
      certSubject: string;
      certFingerprint: string;
      certValidFrom: Date;
      certValidTo: Date;
      keyId: string;
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      const detail = await tx.detailSOP.findUnique({
        where: { detailSopId: params.detailSopId },
        include: { sop: { select: { opdId: true } } },
      });
      if (detail === null || detail.sop === null) {
        return { error: 'NOT_FOUND' as const };
      }
      if (detail.sop.opdId !== params.userOpdId) {
        return { error: 'FORBIDDEN_OPD' as const };
      }
      /** Hanya setelah PJ Penyusun menandatangani BA (DetailSOP dipromosikan ke DIVERIFIKASI_BIRO_ORGANISASI). */
      const boleh = new Set<StatusSOP>([StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI]);
      if (!boleh.has(detail.status)) {
        return { error: 'BAD_SOP_STATUS' as const, status: detail.status };
      }
      let dokumen = await tx.dokumenTte.findUnique({
        where: { detailSopId: params.detailSopId },
      });
      if (dokumen === null) {
        dokumen = await tx.dokumenTte.create({
          data: {
            nomorDokumen: params.nomorDokumen,
            judulDokumen: params.judulDokumen,
            hashDokumen: params.hashDokumen,
            jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
            detailSopId: params.detailSopId,
            metodeKanonikalisasi: 'SHA256-MOCK-BSRE-v1',
          },
        });
      } else {
        await tx.dokumenTte.update({
          where: { dokumenTteId: dokumen.dokumenTteId },
          data: {
            nomorDokumen: params.nomorDokumen,
            judulDokumen: params.judulDokumen,
            hashDokumen: params.hashDokumen,
          },
        });
      }
      const dup = await this.assertRiwayatBelumAda(tx, dokumen.dokumenTteId, params.peran);
      if (dup !== null) {
        return { error: 'ALREADY_SIGNED' as const };
      }
      await tx.riwayatTandaTangan.create({
        data: {
          userId: params.userId,
          dokumenTteId: dokumen.dokumenTteId,
          peran: params.peran,
          signatureValue: params.signatureFields.signatureValue,
          signatureAlgorithm: params.signatureFields.signatureAlgorithm,
          signatureFormat: params.signatureFields.signatureFormat,
          certSerialNumber: params.signatureFields.certSerialNumber,
          certIssuer: params.signatureFields.certIssuer,
          certSubject: params.signatureFields.certSubject,
          certFingerprint: params.signatureFields.certFingerprint,
          certValidFrom: params.signatureFields.certValidFrom,
          certValidTo: params.signatureFields.certValidTo,
          keyId: params.signatureFields.keyId,
        },
      });
      await tx.detailSOP.update({
        where: { detailSopId: params.detailSopId },
        data: {
          status: StatusSOP.BERLAKU,
          terakhirDieditOlehId: params.userId,
        },
      });
      const riwayat = await tx.riwayatTandaTangan.findFirst({
        where: {
          dokumenTteId: dokumen.dokumenTteId,
          userId: params.userId,
          peran: params.peran,
        },
        include: {
          dokumenTte: true,
          user: { select: { penggunaId: true, nama: true, nip: true } },
        },
      });
      return { ok: true as const, riwayat };
    });
  }
}
