import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JenisDokumenTte, Prisma } from '../../generated/prisma';
import type { PengajuanEvaluasiListQueryDto } from './dto/pengajuan-evaluasi-list-query.dto';
import type { PengajuanEvaluasiRingkasQueryDto } from './dto/pengajuan-evaluasi-ringkas-query.dto';

const pengajuanEvaluasiDetailInclude = Prisma.validator<Prisma.PengajuanEvaluasiInclude>()({
  opd: { select: { opdId: true, nama: true } },
  nilaiEvaluasi: {
    include: {
      detailSop: {
        select: {
          detailSopId: true,
          nomorSOP: true,
          status: true,
          sop: { select: { sopId: true, judul: true } },
        },
      },
      dinilaiOleh: { select: { penggunaId: true, nama: true } },
    },
  },
  diselesaikanOleh: { select: { penggunaId: true, nama: true } },
  diverifikasiOlehUser: { select: { penggunaId: true, nama: true } },
  ditandatanganiOlehPjPenyusunUser: { select: { penggunaId: true, nama: true } },
  dokumenTte: {
    where: { jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI },
    take: 1,
    orderBy: { createdAt: 'desc' },
    select: { nomorDokumen: true },
  },
  logNilaiEvaluasi: {
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      evaluator: { select: { nama: true } },
    },
  },
});

export type PengajuanEvaluasiDetailRow = Prisma.PengajuanEvaluasiGetPayload<{
  include: typeof pengajuanEvaluasiDetailInclude;
}>;

@Injectable()
export class PengajuanEvaluasiRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Menjalankan transaksi Prisma (alur create batch di service). */
  async runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async findOpdIdPengguna(penggunaId: string): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }

  async findManyFiltered(
    whereInput: Prisma.PengajuanEvaluasiWhereInput,
  ): Promise<PengajuanEvaluasiDetailRow[]> {
    return this.prisma.pengajuanEvaluasi.findMany({
      where: whereInput,
      include: pengajuanEvaluasiDetailInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findByIdFull(pengajuanEvaluasiId: string): Promise<PengajuanEvaluasiDetailRow | null> {
    return this.prisma.pengajuanEvaluasi.findUnique({
      where: { pengajuanEvaluasiId },
      include: pengajuanEvaluasiDetailInclude,
    });
  }

  buildWhereFromQuery(
    query: PengajuanEvaluasiListQueryDto,
    forcedOpdId?: string,
  ): Prisma.PengajuanEvaluasiWhereInput {
    const and: Prisma.PengajuanEvaluasiWhereInput[] = [];
    if (forcedOpdId !== undefined) {
      and.push({ opdId: forcedOpdId });
    } else if (query.opdId !== undefined) {
      and.push({ opdId: query.opdId });
    }
    if (query.statusIn !== undefined && query.statusIn.length > 0) {
      and.push({ status: { in: [...query.statusIn] } });
    } else if (query.status !== undefined) {
      and.push({ status: query.status });
    }
    if (query.jenis !== undefined) {
      and.push({ jenis: query.jenis });
    }
    return and.length === 0 ? {} : { AND: and };
  }

  /** Filter daftar ringkas + pencarian nama OPD (substring). */
  buildWhereRingkasFromQuery(
    query: PengajuanEvaluasiRingkasQueryDto,
    forcedOpdId?: string,
  ): Prisma.PengajuanEvaluasiWhereInput {
    const listFilters = this.buildWhereFromQuery(
      {
        opdId: query.opdId,
        status: query.status,
        statusIn: query.statusIn,
        jenis: query.jenis,
      },
      forcedOpdId,
    );
    const parts: Prisma.PengajuanEvaluasiWhereInput[] = [];
    if ('AND' in listFilters && Array.isArray(listFilters.AND)) {
      parts.push(...listFilters.AND);
    } else if (Object.keys(listFilters).length > 0) {
      parts.push(listFilters);
    }
    const term = query.search?.trim();
    if (term !== undefined && term.length > 0) {
      parts.push({
        opd: { nama: { contains: term } },
      });
    }
    return parts.length === 0 ? {} : { AND: parts };
  }

  async countWhere(where: Prisma.PengajuanEvaluasiWhereInput): Promise<number> {
    return this.prisma.pengajuanEvaluasi.count({ where });
  }

  async findRingkasPage(
    where: Prisma.PengajuanEvaluasiWhereInput,
    skip: number,
    take: number,
  ): Promise<
    {
      pengajuanEvaluasiId: string;
      opdId: string;
      opdNama: string;
      jenis: string;
      status: string;
      tanggalEvaluasi?: string;
      createdAt: string;
      nilaiOPD?: number;
      jumlahSop: number;
      jumlahSudahDinilai: number;
    }[]
  > {
    const rows = await this.prisma.pengajuanEvaluasi.findMany({
      where,
      skip,
      take,
      orderBy: [{ createdAt: 'desc' }],
      select: {
        pengajuanEvaluasiId: true,
        opdId: true,
        jenis: true,
        status: true,
        tanggalEvaluasi: true,
        createdAt: true,
        nilaiOPD: true,
        opd: { select: { nama: true } },
      },
    });
    const ids = rows.map((r) => r.pengajuanEvaluasiId);
    if (ids.length === 0) {
      return [];
    }
    const [totals, filled] = await Promise.all([
      this.prisma.nilaiEvaluasi.groupBy({
        by: ['pengajuanEvaluasiId'],
        where: { pengajuanEvaluasiId: { in: ids } },
        _count: { _all: true },
      }),
      this.prisma.nilaiEvaluasi.groupBy({
        by: ['pengajuanEvaluasiId'],
        where: {
          pengajuanEvaluasiId: { in: ids },
          hasil: { not: null },
        },
        _count: { _all: true },
      }),
    ]);
    const totalMap = new Map(totals.map((t) => [t.pengajuanEvaluasiId, t._count._all]));
    const filledMap = new Map(filled.map((t) => [t.pengajuanEvaluasiId, t._count._all]));
    return rows.map((r) => ({
      pengajuanEvaluasiId: r.pengajuanEvaluasiId,
      opdId: r.opdId,
      opdNama: r.opd.nama,
      jenis: String(r.jenis),
      status: String(r.status),
      tanggalEvaluasi: r.tanggalEvaluasi?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      nilaiOPD: r.nilaiOPD ?? undefined,
      jumlahSop: totalMap.get(r.pengajuanEvaluasiId) ?? 0,
      jumlahSudahDinilai: filledMap.get(r.pengajuanEvaluasiId) ?? 0,
    }));
  }
}
