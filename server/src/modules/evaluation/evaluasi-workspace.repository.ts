import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';

/** Selaras pipeline evaluasi pada `OpdRepository.findEvaluasiRingkas`. */
const STATUS_PIPELINE_EVALUASI: readonly StatusSOP[] = [
  StatusSOP.DIAJUKAN_EVALUASI,
  StatusSOP.SEDANG_DIEVALUASI,
  StatusSOP.REVISI_DARI_TIM_EVALUASI,
  StatusSOP.SIAP_DIVERIFIKASI,
] as const;

const STATUS_PIPELINE_SET = new Set<string>(STATUS_PIPELINE_EVALUASI);

export type EvaluasiWorkspaceDaftarRowRepo = {
  readonly detailSopId: string;
  readonly sopId: string;
  readonly judul: string;
  readonly nomorSOP: string;
  readonly statusDetail: StatusSOP;
};

export type EvaluasiWorkspaceNilaiRepo = {
  readonly detailSopId: string;
  readonly hasil: string | null;
  readonly catatan: string | null;
  readonly version: number;
};

export type EvaluasiWorkspacePengajuanAktifRepo = {
  readonly pengajuanEvaluasiId: string;
  readonly status: StatusPengajuanEvaluasi;
  readonly nilaiEvaluasi: EvaluasiWorkspaceNilaiRepo[];
};

export type EvaluasiWorkspaceRiwayatOpdRepoRow = {
  readonly pengajuanEvaluasiId: string;
  readonly tanggalDiselesaikan: Date | null;
  readonly catatan: string | null;
  readonly nilaiOPD: number | null;
  readonly evaluatorNama: string;
};

export type EvaluasiWorkspaceRiwayatNilaiRepoRow = {
  readonly pengajuanEvaluasiId: string;
  readonly tanggalDiselesaikan: Date | null;
  readonly evaluatorNama: string;
  readonly hasil: string;
  readonly catatan: string | null;
};

@Injectable()
export class EvaluasiWorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpdRingkas(opdId: string): Promise<{ opdId: string; nama: string } | null> {
    return this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
      select: { opdId: true, nama: true },
    });
  }

  async findDaftarDetailPipeline(opdId: string): Promise<EvaluasiWorkspaceDaftarRowRepo[]> {
    const sops = await this.prisma.sOP.findMany({
      where: { opdId },
      select: {
        sopId: true,
        judul: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: {
            detailSopId: true,
            nomorSOP: true,
            status: true,
          },
        },
      },
      orderBy: { judul: 'asc' },
    });
    const out: EvaluasiWorkspaceDaftarRowRepo[] = [];
    for (const row of sops) {
      const d = row.detailSops[0];
      if (d === undefined) {
        continue;
      }
      if (!STATUS_PIPELINE_SET.has(String(d.status))) {
        continue;
      }
      out.push({
        detailSopId: d.detailSopId,
        sopId: row.sopId,
        judul: row.judul,
        nomorSOP: d.nomorSOP,
        statusDetail: d.status,
      });
    }
    return out;
  }

  async findPengajuanAktif(opdId: string): Promise<EvaluasiWorkspacePengajuanAktifRepo | null> {
    const row = await this.prisma.pengajuanEvaluasi.findFirst({
      where: {
        opdId,
        status: {
          in: [
            StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
          ],
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        pengajuanEvaluasiId: true,
        status: true,
        nilaiEvaluasi: {
          select: {
            detailSopId: true,
            hasil: true,
            catatan: true,
            version: true,
          },
        },
      },
    });
    if (row === null) {
      return null;
    }
    return {
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      status: row.status,
      nilaiEvaluasi: row.nilaiEvaluasi.map((n) => ({
        detailSopId: n.detailSopId,
        hasil: n.hasil === null || n.hasil === undefined ? null : String(n.hasil),
        catatan: n.catatan ?? null,
        version: n.version,
      })),
    };
  }

  async findRiwayatOpdSelesai(opdId: string, limit: number): Promise<EvaluasiWorkspaceRiwayatOpdRepoRow[]> {
    const rows = await this.prisma.pengajuanEvaluasi.findMany({
      where: { opdId, status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI },
      orderBy: [{ tanggalDiselesaikan: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: {
        pengajuanEvaluasiId: true,
        tanggalDiselesaikan: true,
        catatan: true,
        nilaiOPD: true,
        diselesaikanOleh: { select: { nama: true } },
      },
    });
    return rows.map((r) => ({
      pengajuanEvaluasiId: r.pengajuanEvaluasiId,
      tanggalDiselesaikan: r.tanggalDiselesaikan,
      catatan: r.catatan ?? null,
      nilaiOPD: r.nilaiOPD ?? null,
      evaluatorNama: r.diselesaikanOleh?.nama ?? '—',
    }));
  }

  async findRiwayatNilaiUntukDetail(
    detailSopId: string,
    limit: number,
  ): Promise<EvaluasiWorkspaceRiwayatNilaiRepoRow[]> {
    const rows = await this.prisma.pengajuanEvaluasi.findMany({
      where: {
        status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
        nilaiEvaluasi: { some: { detailSopId } },
      },
      orderBy: [{ tanggalDiselesaikan: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: {
        pengajuanEvaluasiId: true,
        tanggalDiselesaikan: true,
        diselesaikanOleh: { select: { nama: true } },
        nilaiEvaluasi: {
          where: { detailSopId },
          take: 1,
          select: { hasil: true, catatan: true },
        },
      },
    });
    const out: EvaluasiWorkspaceRiwayatNilaiRepoRow[] = [];
    for (const r of rows) {
      const n = r.nilaiEvaluasi[0];
      if (n === undefined || n.hasil === null || n.hasil === undefined) {
        continue;
      }
      out.push({
        pengajuanEvaluasiId: r.pengajuanEvaluasiId,
        tanggalDiselesaikan: r.tanggalDiselesaikan,
        evaluatorNama: r.diselesaikanOleh?.nama ?? '—',
        hasil: String(n.hasil),
        catatan: n.catatan ?? null,
      });
    }
    return out;
  }

  async detailMilikiOpd(detailSopId: string, opdId: string): Promise<boolean> {
    const row = await this.prisma.detailSOP.findFirst({
      where: { detailSopId, sop: { opdId } },
      select: { detailSopId: true },
    });
    return row !== null;
  }

  async evaluatorTerakhirBatch(detailSopIds: string[]): Promise<Map<string, { nama: string; pada: string }>> {
    const map = new Map<string, { nama: string; pada: string }>();
    if (detailSopIds.length === 0) {
      return map;
    }
    const logs = await this.prisma.logNilaiEvaluasi.findMany({
      where: { detailSopId: { in: detailSopIds } },
      orderBy: { createdAt: 'desc' },
      select: {
        detailSopId: true,
        createdAt: true,
        evaluator: { select: { nama: true } },
      },
    });
    for (const log of logs) {
      if (map.has(log.detailSopId)) {
        continue;
      }
      map.set(log.detailSopId, {
        nama: log.evaluator.nama,
        pada: log.createdAt.toISOString(),
      });
    }
    return map;
  }
}
