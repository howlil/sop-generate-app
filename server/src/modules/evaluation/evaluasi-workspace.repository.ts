import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JenisPengajuanEvaluasi, StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';
import { STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK } from './pengajuan-evaluasi-status.constants';
/** Selaras pipeline evaluasi pada `OpdRepository.findEvaluasiRingkas`. */
const STATUS_PIPELINE_EVALUASI: readonly StatusSOP[] = [
  StatusSOP.DIAJUKAN_EVALUASI,
  StatusSOP.SEDANG_DIEVALUASI,
  StatusSOP.REVISI_DARI_EVALUATOR,
  StatusSOP.SIAP_DIVERIFIKASI,
] as const;

const STATUS_PIPELINE_SET = new Set<string>(STATUS_PIPELINE_EVALUASI);
const STATUS_PIPELINE_DENGAN_SIAP_SET = new Set<string>([
  ...STATUS_PIPELINE_EVALUASI.map(String),
  String(StatusSOP.SIAP_DIEVALUASI),
]);

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
  readonly jenis: JenisPengajuanEvaluasi;
  readonly nilaiEvaluasi: EvaluasiWorkspaceNilaiRepo[];
};

export type EvaluasiWorkspaceRiwayatOpdRepoRow = {
  readonly pengajuanEvaluasiId: string;
  readonly tanggalDiselesaikan: Date | null;
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

/** Bundle pengajuan + nilai beserta detail SOP untuk workspace per pengajuan. */
export type EvaluasiWorkspacePengajuanBundleRepo = {
  readonly pengajuanEvaluasiId: string;
  readonly opdId: string;
  readonly status: StatusPengajuanEvaluasi;
  readonly jenis: JenisPengajuanEvaluasi;
  readonly nilaiEvaluasi: readonly EvaluasiWorkspaceNilaiRepo[];
  readonly daftarRows: readonly EvaluasiWorkspaceDaftarRowRepo[];
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

  async findDaftarDetailPipeline(
    opdId: string,
    options?: { readonly includeSiapDievaluasi?: boolean },
  ): Promise<EvaluasiWorkspaceDaftarRowRepo[]> {
    const allowedStatus = options?.includeSiapDievaluasi === true
      ? STATUS_PIPELINE_DENGAN_SIAP_SET
      : STATUS_PIPELINE_SET;
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
      if (!allowedStatus.has(String(d.status))) {
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

  /**
   * Muat satu pengajuan beserta nilai dan metadata DetailSOP/SOP untuk daftar workspace.
   * Daftar SOP = persis anggota batch (`NilaiEvaluasi` pengajuan ini).
   */
  async findPengajuanBundleForWorkspace(
    pengajuanEvaluasiId: string,
  ): Promise<EvaluasiWorkspacePengajuanBundleRepo | null> {
    const row = await this.prisma.pengajuanEvaluasi.findUnique({
      where: { pengajuanEvaluasiId },
      select: {
        pengajuanEvaluasiId: true,
        opdId: true,
        status: true,
        jenis: true,
        nilaiEvaluasi: {
          select: {
            detailSopId: true,
            hasil: true,
            catatan: true,
            version: true,
            detailSop: {
              select: {
                status: true,
                nomorSOP: true,
                sop: { select: { sopId: true, judul: true } },
              },
            },
          },
        },
      },
    });
    if (row === null) {
      return null;
    }
    const nilaiEvaluasi: EvaluasiWorkspaceNilaiRepo[] = row.nilaiEvaluasi.map((n) => ({
      detailSopId: n.detailSopId,
      hasil: n.hasil === null || n.hasil === undefined ? null : String(n.hasil),
      catatan: n.catatan ?? null,
      version: n.version,
    }));
    const daftarRows: EvaluasiWorkspaceDaftarRowRepo[] = row.nilaiEvaluasi.map((n) => ({
      detailSopId: n.detailSopId,
      sopId: n.detailSop.sop.sopId,
      judul: n.detailSop.sop.judul,
      nomorSOP: n.detailSop.nomorSOP,
      statusDetail: n.detailSop.status,
    }));
    daftarRows.sort((a, b) => a.judul.localeCompare(b.judul, 'id'));
    return {
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      opdId: row.opdId,
      status: row.status,
      jenis: row.jenis,
      nilaiEvaluasi,
      daftarRows,
    };
  }

  async findPengajuanAktif(opdId: string): Promise<EvaluasiWorkspacePengajuanAktifRepo | null> {
    const row = await this.prisma.pengajuanEvaluasi.findFirst({
      where: {
        opdId,
        status: {
          in: [...STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK],
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        pengajuanEvaluasiId: true,
        status: true,
        jenis: true,
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
      jenis: row.jenis,
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
      where: {
        opdId,
        status: StatusPengajuanEvaluasi.SELESAI,
      },
      orderBy: [{ tanggalDiselesaikan: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
      select: {
        pengajuanEvaluasiId: true,
        tanggalDiselesaikan: true,
        nilaiOPD: true,
        diselesaikanOleh: { select: { nama: true } },
      },
    });
    return rows.map((r) => ({
      pengajuanEvaluasiId: r.pengajuanEvaluasiId,
      tanggalDiselesaikan: r.tanggalDiselesaikan,
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
        status: StatusPengajuanEvaluasi.SELESAI,
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
        pengguna: { select: { nama: true } },
      },
    });
    for (const log of logs) {
      if (map.has(log.detailSopId)) {
        continue;
      }
      map.set(log.detailSopId, {
        nama: log.pengguna.nama,
        pada: log.createdAt.toISOString(),
      });
    }
    return map;
  }
}
