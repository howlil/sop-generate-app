import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JenisDokumenTte, Prisma } from '../../generated/prisma';
import type { PengajuanEvaluasiListQueryDto } from './dto/pengajuan-evaluasi-list-query.dto';

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
  ditandatanganiOlehKoordinatorUser: { select: { penggunaId: true, nama: true } },
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
    if (query.status !== undefined) {
      and.push({ status: query.status });
    }
    if (query.jenis !== undefined) {
      and.push({ jenis: query.jenis });
    }
    return and.length === 0 ? {} : { AND: and };
  }
}
