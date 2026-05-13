import { Injectable, NotFoundException } from '@nestjs/common';
import type { JwtAccessPayload } from '../core/auth/helpers/auth.shared';
import { PeranPengguna } from '../../generated/prisma';
import { SopCatalogService } from '../sop/sop-catalog/sop-catalog.service';
import { EvaluasiWorkspaceQueryDto } from './dto/evaluasi-workspace-query.dto';
import type { EvaluasiWorkspaceOpdResponseDto } from './dto/evaluasi-workspace-response.dto';
import { EvaluasiWorkspaceRepository } from './evaluasi-workspace.repository';
import { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

const DEFAULT_RIWAYAT_LIMIT = 30;
const PREVIEW_LOGS_LIMIT = 50;

function parseExpandFlags(expandRaw: string | undefined): Set<string> {
  const set = new Set<string>();
  if (expandRaw === undefined || expandRaw.trim() === '') {
    return set;
  }
  for (const part of expandRaw.split(',')) {
    const t = part.trim();
    if (t !== '') {
      set.add(t);
    }
  }
  return set;
}

function computeTampilanAlur(
  detailSopId: string,
  nilaiUntukDetail: { hasil: string | null } | undefined,
): 'perlu_evaluasi' | 'sedang_dievaluasi' | 'selesai_pengajuan_ini' {
  if (nilaiUntukDetail === undefined) {
    return 'perlu_evaluasi';
  }
  if (nilaiUntukDetail.hasil !== null && nilaiUntukDetail.hasil !== '') {
    return 'selesai_pengajuan_ini';
  }
  return 'sedang_dievaluasi';
}

@Injectable()
export class EvaluasiWorkspaceService {
  constructor(
    private readonly evaluasiWorkspaceRepository: EvaluasiWorkspaceRepository,
    private readonly sopCatalogService: SopCatalogService,
    private readonly pengajuanEvaluasiService: PengajuanEvaluasiService,
  ) {}

  async getWorkspaceOpd(
    user: JwtAccessPayload,
    opdId: string,
    query: EvaluasiWorkspaceQueryDto,
  ): Promise<EvaluasiWorkspaceOpdResponseDto> {
    const opdRow = await this.evaluasiWorkspaceRepository.findOpdRingkas(opdId);
    if (opdRow === null) {
      throw new NotFoundException('OPD tidak ditemukan');
    }
    await this.pengajuanEvaluasiService.assertUserCanAccessPengajuan(user, opdId);
    const riwayatLimit = query.riwayatLimit ?? DEFAULT_RIWAYAT_LIMIT;
    const includeSiapDievaluasi = user.peran === PeranPengguna.PJ_PENYUSUN;
    let [daftarRows, pengajuanAktifRepo, riwayatOpdRepo] = await Promise.all([
      this.evaluasiWorkspaceRepository.findDaftarDetailPipeline(opdId, { includeSiapDievaluasi }),
      this.evaluasiWorkspaceRepository.findPengajuanAktif(opdId),
      this.evaluasiWorkspaceRepository.findRiwayatOpdSelesai(opdId, riwayatLimit),
    ]);
    if (
      user.peran === PeranPengguna.EVALUATOR &&
      pengajuanAktifRepo === null &&
      daftarRows.length > 0
    ) {
      await this.pengajuanEvaluasiService.pastikanPengajuanMandiriUntukEvaluator(user, opdId, daftarRows);
      pengajuanAktifRepo = await this.evaluasiWorkspaceRepository.findPengajuanAktif(opdId);
    }
    const detailIds = daftarRows.map((r) => r.detailSopId);
    const evaluatorMap = await this.evaluasiWorkspaceRepository.evaluatorTerakhirBatch(detailIds);
    const nilaiByDetail = new Map(
      (pengajuanAktifRepo?.nilaiEvaluasi ?? []).map((n) => [n.detailSopId, n]),
    );
    const daftarSop = daftarRows.map((row) => ({
      detailSopId: row.detailSopId,
      sopId: row.sopId,
      judul: row.judul,
      nomorSOP: row.nomorSOP,
      statusDetail: String(row.statusDetail),
      tampilanAlur: computeTampilanAlur(row.detailSopId, nilaiByDetail.get(row.detailSopId)),
      evaluatorTerakhir: evaluatorMap.get(row.detailSopId) ?? null,
    }));
    const pengajuanAktif =
      pengajuanAktifRepo === null
        ? null
        : {
            id: pengajuanAktifRepo.pengajuanEvaluasiId,
            status: String(pengajuanAktifRepo.status),
            jenis: String(pengajuanAktifRepo.jenis),
            nilaiPerDetail: pengajuanAktifRepo.nilaiEvaluasi.map((n) => ({
              detailSopId: n.detailSopId,
              hasil: n.hasil,
              catatan: n.catatan,
              version: n.version,
            })),
          };
    const riwayatOpd = riwayatOpdRepo.map((r) => ({
      tanggal: (r.tanggalDiselesaikan ?? new Date(0)).toISOString(),
      evaluatorNama: r.evaluatorNama,
      nilaiOPD: r.nilaiOPD,
      pengajuanEvaluasiId: r.pengajuanEvaluasiId,
    }));
    const detailSopIdQuery = query.detailSopId;
    const riwayatNilaiSopTerpilih =
      detailSopIdQuery === undefined
        ? []
        : (
            await this.evaluasiWorkspaceRepository.findRiwayatNilaiUntukDetail(
              detailSopIdQuery,
              riwayatLimit,
            )
          ).map((r) => ({
            tanggal: (r.tanggalDiselesaikan ?? new Date(0)).toISOString(),
            evaluatorNama: r.evaluatorNama,
            hasil: r.hasil,
            catatan: r.catatan,
            pengajuanEvaluasiId: r.pengajuanEvaluasiId,
          }));
    const expand = parseExpandFlags(query.expand);
    const wantsPreview = expand.has('preview');
    let preview: EvaluasiWorkspaceOpdResponseDto['preview'] = null;
    if (wantsPreview && detailSopIdQuery !== undefined) {
      const boleh =
        (await this.evaluasiWorkspaceRepository.detailMilikiOpd(detailSopIdQuery, opdId)) &&
        detailIds.includes(detailSopIdQuery);
      if (boleh) {
        const workbench = await this.sopCatalogService.getPenyusunWorkbench(
          user,
          detailSopIdQuery,
          PREVIEW_LOGS_LIMIT,
        );
        preview = { detailSopId: detailSopIdQuery, workbench };
      }
    }
    return {
      opd: { id: opdRow.opdId, nama: opdRow.nama },
      pengajuanAktif,
      daftarSop,
      riwayatOpd,
      preview,
      riwayatNilaiSopTerpilih,
    };
  }

  /**
   * Workspace untuk satu pengajuan evaluasi (URL stabil).
   * Daftar SOP = anggota `NilaiEvaluasi` pengajuan ini, bukan seluruh pipeline OPD.
   */
  async getWorkspacePengajuan(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    query: EvaluasiWorkspaceQueryDto,
  ): Promise<EvaluasiWorkspaceOpdResponseDto> {
    const bundle = await this.evaluasiWorkspaceRepository.findPengajuanBundleForWorkspace(
      pengajuanEvaluasiId,
    );
    if (bundle === null) {
      throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
    }
    await this.pengajuanEvaluasiService.assertUserCanAccessPengajuan(user, bundle.opdId);
    const opdRow = await this.evaluasiWorkspaceRepository.findOpdRingkas(bundle.opdId);
    if (opdRow === null) {
      throw new NotFoundException('OPD tidak ditemukan');
    }
    const riwayatLimit = query.riwayatLimit ?? DEFAULT_RIWAYAT_LIMIT;
    const detailIds = bundle.daftarRows.map((r) => r.detailSopId);
    const allowedDetail = new Set(detailIds);
    const nilaiByDetail = new Map(bundle.nilaiEvaluasi.map((n) => [n.detailSopId, n]));
    const [evaluatorMap, riwayatOpdRepo] = await Promise.all([
      this.evaluasiWorkspaceRepository.evaluatorTerakhirBatch(detailIds),
      this.evaluasiWorkspaceRepository.findRiwayatOpdSelesai(bundle.opdId, riwayatLimit),
    ]);
    const daftarSop = bundle.daftarRows.map((row) => ({
      detailSopId: row.detailSopId,
      sopId: row.sopId,
      judul: row.judul,
      nomorSOP: row.nomorSOP,
      statusDetail: String(row.statusDetail),
      tampilanAlur: computeTampilanAlur(row.detailSopId, nilaiByDetail.get(row.detailSopId)),
      evaluatorTerakhir: evaluatorMap.get(row.detailSopId) ?? null,
    }));
    const pengajuanAktif = {
      id: bundle.pengajuanEvaluasiId,
      status: String(bundle.status),
      jenis: String(bundle.jenis),
      nilaiPerDetail: bundle.nilaiEvaluasi.map((n) => ({
        detailSopId: n.detailSopId,
        hasil: n.hasil,
        catatan: n.catatan,
        version: n.version,
      })),
    };
    const riwayatOpd = riwayatOpdRepo.map((r) => ({
      tanggal: (r.tanggalDiselesaikan ?? new Date(0)).toISOString(),
      evaluatorNama: r.evaluatorNama,
      nilaiOPD: r.nilaiOPD,
      pengajuanEvaluasiId: r.pengajuanEvaluasiId,
    }));
    const detailSopIdQuery = query.detailSopId;
    const riwayatNilaiSopTerpilih =
      detailSopIdQuery === undefined
        ? []
        : (
            await this.evaluasiWorkspaceRepository.findRiwayatNilaiUntukDetail(
              detailSopIdQuery,
              riwayatLimit,
            )
          ).map((r) => ({
            tanggal: (r.tanggalDiselesaikan ?? new Date(0)).toISOString(),
            evaluatorNama: r.evaluatorNama,
            hasil: r.hasil,
            catatan: r.catatan,
            pengajuanEvaluasiId: r.pengajuanEvaluasiId,
          }));
    const expand = parseExpandFlags(query.expand);
    const wantsPreview = expand.has('preview');
    let preview: EvaluasiWorkspaceOpdResponseDto['preview'] = null;
    if (wantsPreview && detailSopIdQuery !== undefined) {
      const boleh =
        allowedDetail.has(detailSopIdQuery) &&
        (await this.evaluasiWorkspaceRepository.detailMilikiOpd(detailSopIdQuery, bundle.opdId));
      if (boleh) {
        const workbench = await this.sopCatalogService.getPenyusunWorkbench(
          user,
          detailSopIdQuery,
          PREVIEW_LOGS_LIMIT,
        );
        preview = { detailSopId: detailSopIdQuery, workbench };
      }
    }
    return {
      opd: { id: opdRow.opdId, nama: opdRow.nama },
      pengajuanAktif,
      daftarSop,
      riwayatOpd,
      preview,
      riwayatNilaiSopTerpilih,
    };
  }
}
