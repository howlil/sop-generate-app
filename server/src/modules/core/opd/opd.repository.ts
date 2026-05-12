import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StatusSOP, type OPD, type Prisma } from '../../../generated/prisma';

export type OpdRingkasRow = {
  readonly opdId: string;
  readonly nama: string;
};

/** Hitungan SOP dalam pipeline evaluasi per OPD (DetailSOP dengan versi tertinggi per header). */
export type OpdEvaluasiRingkasRepoRow = {
  readonly opdId: string;
  readonly nama: string;
  readonly jumlahSop: number;
  readonly jumlahSopBaru: number;
};

const STATUS_PIPELINE_EVALUASI: readonly StatusSOP[] = [
  StatusSOP.DIAJUKAN_EVALUASI,
  StatusSOP.SEDANG_DIEVALUASI,
  StatusSOP.REVISI_DARI_EVALUATOR,
  StatusSOP.SIAP_DIVERIFIKASI,
] as const;

const STATUS_PIPELINE_SET = new Set<string>(STATUS_PIPELINE_EVALUASI);

@Injectable()
export class OpdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpdIdByPenggunaId(penggunaId: string): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }

  async findManyRingkasAktif(search?: string): Promise<OpdRingkasRow[]> {
    const trimmed = search?.trim();
    return this.prisma.oPD.findMany({
      where: {
        deletedAt: null,
        ...(trimmed ? { nama: { contains: trimmed } } : {}),
      },
      select: { opdId: true, nama: true },
      orderBy: { nama: 'asc' },
    });
  }

  /**
   * Daftar OPD aktif (filter nama) yang punya minimal satu SOP dengan DetailSOP terbaru
   * dalam status pipeline evaluasi.
   */
  async findEvaluasiRingkas(search?: string): Promise<OpdEvaluasiRingkasRepoRow[]> {
    const trimmed = search?.trim();
    const opdRows = await this.prisma.oPD.findMany({
      where: {
        deletedAt: null,
        ...(trimmed ? { nama: { contains: trimmed } } : {}),
      },
      select: { opdId: true, nama: true },
      orderBy: { nama: 'asc' },
    });
    if (opdRows.length === 0) {
      return [];
    }
    const opdIdSet = new Set(opdRows.map((r) => r.opdId));
    const sopRows = await this.prisma.sOP.findMany({
      where: { opdId: { in: [...opdIdSet] } },
      select: {
        opdId: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: { status: true },
        },
      },
    });
    const totals = new Map<string, { jumlahSop: number; jumlahSopBaru: number }>();
    for (const row of sopRows) {
      const detail = row.detailSops[0];
      if (detail === undefined) {
        continue;
      }
      const statusStr = detail.status as string;
      if (!STATUS_PIPELINE_SET.has(statusStr)) {
        continue;
      }
      const cur = totals.get(row.opdId) ?? { jumlahSop: 0, jumlahSopBaru: 0 };
      cur.jumlahSop += 1;
      if (detail.status === StatusSOP.DIAJUKAN_EVALUASI) {
        cur.jumlahSopBaru += 1;
      }
      totals.set(row.opdId, cur);
    }
    const result: OpdEvaluasiRingkasRepoRow[] = [];
    for (const opd of opdRows) {
      const t = totals.get(opd.opdId);
      if (t === undefined || t.jumlahSop < 1) {
        continue;
      }
      result.push({
        opdId: opd.opdId,
        nama: opd.nama,
        jumlahSop: t.jumlahSop,
        jumlahSopBaru: t.jumlahSopBaru,
      });
    }
    return result;
  }

  async findRingkasAktifById(opdId: string): Promise<OpdRingkasRow | null> {
    return this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
      select: { opdId: true, nama: true },
    });
  }

  async findAktifById(opdId: string): Promise<OPD | null> {
    return this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
    });
  }

  async create(data: Prisma.OPDCreateInput): Promise<OPD> {
    return this.prisma.oPD.create({ data });
  }

  async update(opdId: string, data: Prisma.OPDUpdateInput): Promise<OPD> {
    return this.prisma.oPD.update({
      where: { opdId },
      data,
    });
  }

  async softDelete(opdId: string): Promise<void> {
    await this.prisma.oPD.update({
      where: { opdId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Menghitung relasi yang menghalangi penghapusan (soft delete) OPD.
   */
  async summarizeBlockingRelations(opdId: string): Promise<{
    readonly pengguna: number;
    readonly sop: number;
    readonly pengajuanEvaluasi: number;
    readonly pelaksana: number;
    readonly riwayatOpdPengguna: number;
    readonly opdPeraturan: number;
  }> {
    const [
      pengguna,
      sop,
      pengajuanEvaluasi,
      pelaksana,
      riwayatOpdPengguna,
      opdPeraturan,
    ] = await Promise.all([
      this.prisma.pengguna.count({ where: { opdId, deletedAt: null } }),
      this.prisma.sOP.count({ where: { opdId } }),
      this.prisma.pengajuanEvaluasi.count({ where: { opdId } }),
      this.prisma.pelaksana.count({ where: { opdId } }),
      this.prisma.riwayatOpdPengguna.count({ where: { opdId } }),
      this.prisma.oPDPeraturan.count({ where: { opdId } }),
    ]);
    return {
      pengguna,
      sop,
      pengajuanEvaluasi,
      pelaksana,
      riwayatOpdPengguna,
      opdPeraturan,
    };
  }
}
