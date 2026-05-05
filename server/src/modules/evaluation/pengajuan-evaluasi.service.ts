import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../common';
import {
  HasilEvaluasi,
  JenisPengajuanEvaluasi,
  PeranPengguna,
  Prisma,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import type { CreatePengajuanEvaluasiDto } from './dto/create-pengajuan-evaluasi.dto';
import type { PengajuanEvaluasiListQueryDto } from './dto/pengajuan-evaluasi-list-query.dto';
import type { PengajuanEvaluasiDetailRow } from './pengajuan-evaluasi.repository';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';

/** Payload selaras kebutuhan client (`PengajuanEvaluasi` di `evaluasi.dto.ts`). */
type PengajuanEvaluasiApiPayload = Record<string, unknown>;

/** Detail SOP yang boleh dimasukkan batch evaluasi baru (alur penyusun → evaluator). */
const STATUS_DETAIL_SIAP_BATCH_EVALUASI: readonly StatusSOP[] = [
  StatusSOP.SIAP_DIEVALUASI,
  StatusSOP.DIAJUKAN_EVALUASI,
  StatusSOP.SEDANG_DIEVALUASI,
  StatusSOP.REVISI_DARI_TIM_EVALUASI,
] as const;

const statusBatchSet = new Set<string>(STATUS_DETAIL_SIAP_BATCH_EVALUASI);

/** Satu baris pipeline workspace (detail terbaru per SOP) untuk bootstrap mandiri. */
export type BarisPipelineEvaluasiOpd = Readonly<{
  detailSopId: string;
  statusDetail: StatusSOP;
}>;

/**
 * Daftar & detail pengajuan evaluasi (REST) serta pembukaan batch oleh PJ Evaluator.
 */
@Injectable()
export class PengajuanEvaluasiService {
  constructor(private readonly pengajuanEvaluasiRepository: PengajuanEvaluasiRepository) {}

  /** Daftar pengajuan — PJ Penyusun otomatis dibatasi ke OPD-nya. */
  async findAll(
    user: JwtAccessPayload,
    query: PengajuanEvaluasiListQueryDto,
  ): Promise<PengajuanEvaluasiApiPayload[]> {
    const forcedOpdId = await this.resolveForcedOpdFilter(user);
    const whereInput = this.pengajuanEvaluasiRepository.buildWhereFromQuery(query, forcedOpdId);
    const rows = await this.pengajuanEvaluasiRepository.findManyFiltered(whereInput);
    return rows.map((r) => PengajuanEvaluasiService.mapRow(r));
  }

  /** Satu pengajuan lengkap — PJ Penyusun hanya boleh mengakses OPD sendiri. */
  async findOne(user: JwtAccessPayload, pengajuanEvaluasiId: string): Promise<PengajuanEvaluasiApiPayload> {
    const row = await this.pengajuanEvaluasiRepository.findByIdFull(pengajuanEvaluasiId);
    if (row === null) {
      throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
    }
    await this.assertCanAccessPengajuan(user, row.opdId);
    return PengajuanEvaluasiService.mapRow(row);
  }

  /** Membuka batch evaluasi (SEDANG_DIEVALUASI + baris nilai per dokumen). Hanya PJ Evaluator. */
  async create(user: JwtAccessPayload, dto: CreatePengajuanEvaluasiDto): Promise<PengajuanEvaluasiApiPayload> {
    if (user.peran !== PeranPengguna.PJ_EVALUATOR) {
      throw new ForbiddenException('Hanya PJ Evaluator yang dapat membuat pengajuan evaluasi batch');
    }
    const idBaru = await this.pengajuanEvaluasiRepository.runTransaction(async (tx: Prisma.TransactionClient) => {
      const blocking = await tx.pengajuanEvaluasi.findFirst({
        where: {
          opdId: dto.opdId,
          status: {
            in: [
              StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
              StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
            ],
          },
        },
        select: { pengajuanEvaluasiId: true },
      });
      if (blocking !== null) {
        throw new ConflictException(
          'OPD ini masih memiliki pengajuan evaluasi aktif atau menunggu evaluasi. Selesaikan atau tutup terlebih dahulu.',
        );
      }
      for (const detailSopId of dto.sopDetailIds) {
        const detail = await tx.detailSOP.findFirst({
          where: { detailSopId, sop: { opdId: dto.opdId } },
          select: { detailSopId: true, status: true },
        });
        if (detail === null) {
          throw new BadRequestException(
            `Detail SOP ${detailSopId} tidak ditemukan atau bukan milik OPD yang dipilih.`,
          );
        }
        if (!statusBatchSet.has(String(detail.status))) {
          throw new BadRequestException(
            `Detail SOP ${detailSopId} berstatus ${String(detail.status)} dan tidak dapat dimasukkan batch evaluasi.`,
          );
        }
      }
      const sekarang = new Date();
      const catatanNorm =
        dto.catatan === undefined ? null : dto.catatan.trim() === '' ? null : dto.catatan.trim();
      const dibuat = await tx.pengajuanEvaluasi.create({
        data: {
          opdId: dto.opdId,
          jenis: dto.jenis,
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          catatan: catatanNorm,
          tanggalPermintaan: sekarang,
          tanggalEvaluasi: sekarang,
          nilaiEvaluasi: {
            create: dto.sopDetailIds.map((detailSopId) => ({ detailSopId })),
          },
        },
        select: { pengajuanEvaluasiId: true },
      });
      await tx.detailSOP.updateMany({
        where: {
          detailSopId: { in: dto.sopDetailIds },
          status: { in: [...STATUS_DETAIL_SIAP_BATCH_EVALUASI] },
        },
        data: { status: StatusSOP.SEDANG_DIEVALUASI },
      });
      return dibuat.pengajuanEvaluasiId;
    });
    const created = await this.pengajuanEvaluasiRepository.findByIdFull(idBaru);
    if (created === null) {
      throw new ConflictException('Gagal memuat pengajuan setelah pembuatan');
    }
    return PengajuanEvaluasiService.mapRow(created);
  }

  /**
   * Untuk workspace evaluator: jika belum ada pengajuan aktif dan ada dokumen eligibel,
   * buat pengajuan `MANDIRI` + baris `NilaiEvaluasi` (tanpa menunggu PJ membuka batch).
   * No-op jika sudah ada pengajuan aktif atau pemanggil bukan EVALUATOR.
   */
  async pastikanPengajuanMandiriUntukEvaluator(
    user: JwtAccessPayload,
    opdId: string,
    pipelineRows: ReadonlyArray<BarisPipelineEvaluasiOpd>,
  ): Promise<void> {
    if (user.peran !== PeranPengguna.EVALUATOR) {
      return;
    }
    const sopDetailIds = pipelineRows
      .filter((r) => statusBatchSet.has(String(r.statusDetail)))
      .map((r) => r.detailSopId);
    if (sopDetailIds.length === 0) {
      return;
    }
    await this.pengajuanEvaluasiRepository.runTransaction(async (tx: Prisma.TransactionClient) => {
      const blocking = await tx.pengajuanEvaluasi.findFirst({
        where: {
          opdId,
          status: {
            in: [
              StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
              StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
            ],
          },
        },
        select: { pengajuanEvaluasiId: true },
      });
      if (blocking !== null) {
        return;
      }
      for (const detailSopId of sopDetailIds) {
        const detail = await tx.detailSOP.findFirst({
          where: { detailSopId, sop: { opdId } },
          select: { detailSopId: true, status: true },
        });
        if (detail === null) {
          throw new BadRequestException(
            `Detail SOP ${detailSopId} tidak ditemukan atau bukan milik OPD.`,
          );
        }
        if (!statusBatchSet.has(String(detail.status))) {
          throw new BadRequestException(
            `Detail SOP ${detailSopId} berstatus ${String(detail.status)} dan tidak dapat masuk pengajuan mandiri.`,
          );
        }
      }
      const sekarang = new Date();
      await tx.pengajuanEvaluasi.create({
        data: {
          opdId,
          jenis: JenisPengajuanEvaluasi.MANDIRI,
          status: StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
          tanggalPermintaan: sekarang,
          nilaiEvaluasi: {
            create: sopDetailIds.map((detailSopId) => ({ detailSopId })),
          },
        },
        select: { pengajuanEvaluasiId: true },
      });
      await tx.detailSOP.updateMany({
        where: {
          detailSopId: { in: sopDetailIds },
          status: { in: [...STATUS_DETAIL_SIAP_BATCH_EVALUASI] },
        },
        data: { status: StatusSOP.SEDANG_DIEVALUASI },
      });
    });
  }

  private async resolveForcedOpdFilter(user: JwtAccessPayload): Promise<string | undefined> {
    if (user.peran === PeranPengguna.PJ_EVALUATOR || user.peran === PeranPengguna.EVALUATOR) {
      return undefined;
    }
    if (user.peran === PeranPengguna.PJ_PENYUSUN) {
      const opdId = await this.pengajuanEvaluasiRepository.findOpdIdPengguna(user.sub);
      if (opdId === null) {
        throw new ForbiddenException('OPD pengguna tidak ditemukan');
      }
      return opdId;
    }
    throw new ForbiddenException('Peran tidak diizinkan mengakses daftar pengajuan evaluasi');
  }

  private async assertCanAccessPengajuan(user: JwtAccessPayload, pengajuanOpdId: string): Promise<void> {
    if (user.peran === PeranPengguna.PJ_EVALUATOR || user.peran === PeranPengguna.EVALUATOR) {
      return;
    }
    if (user.peran === PeranPengguna.PJ_PENYUSUN) {
      const opdId = await this.pengajuanEvaluasiRepository.findOpdIdPengguna(user.sub);
      if (opdId === null || opdId !== pengajuanOpdId) {
        throw new ForbiddenException('Anda tidak dapat mengakses pengajuan evaluasi OPD lain');
      }
      return;
    }
    throw new ForbiddenException('Peran tidak diizinkan mengakses detail pengajuan evaluasi');
  }

  private static stringifyHasil(v: HasilEvaluasi | null | undefined): string | undefined {
    if (v === null || v === undefined) {
      return undefined;
    }
    return String(v);
  }

  private static mapRow(row: PengajuanEvaluasiDetailRow): PengajuanEvaluasiApiPayload {
    const dokBa = row.dokumenTte[0];
    const nomorBA =
      row.nomorBA ??
      (dokBa !== undefined && dokBa !== null ? dokBa.nomorDokumen : undefined);
    const sopList = row.nilaiEvaluasi.map((n) => ({
      id: n.nilaiEvaluasiId,
      sopDetailId: n.detailSopId,
      judul: n.detailSop.sop.judul,
      nomor: n.detailSop.nomorSOP,
      nama: n.detailSop.sop.judul,
      nomorSOP: n.detailSop.nomorSOP,
      status: String(n.detailSop.status),
      hasil: PengajuanEvaluasiService.stringifyHasil(n.hasil),
    }));
    const nilaiEvaluasi = row.nilaiEvaluasi.map((n) => ({
      id: n.nilaiEvaluasiId,
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      sopDetailId: n.detailSopId,
      hasil: PengajuanEvaluasiService.stringifyHasil(n.hasil),
      catatan: n.catatan ?? undefined,
      version: n.version,
      dinilaiOlehId: n.dinilaiOlehId ?? undefined,
      dinilaiOleh:
        n.dinilaiOleh !== null && n.dinilaiOleh !== undefined
          ? { id: n.dinilaiOleh.penggunaId, nama: n.dinilaiOleh.nama }
          : undefined,
      sopDetail: { id: n.detailSopId },
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));
    const riwayatEvaluasi = row.logNilaiEvaluasi.map((log) => ({
      id: log.logNilaiEvaluasiId,
      sopDetailId: log.detailSopId,
      evaluatorId: log.evaluatorId,
      evaluatorNama: log.evaluator.nama,
      hasilSebelum: PengajuanEvaluasiService.stringifyHasil(log.hasilSebelum),
      hasilSesudah: PengajuanEvaluasiService.stringifyHasil(log.hasilSesudah),
      catatanSebelum: log.catatanSebelum ?? undefined,
      catatanSesudah: log.catatanSesudah ?? undefined,
      createdAt: log.createdAt.toISOString(),
    }));
    const tanggalVerifikasi =
      row.status === StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO ? row.updatedAt.toISOString() : undefined;
    return {
      id: row.pengajuanEvaluasiId,
      opdId: row.opdId,
      opdNama: row.opd.nama,
      jenis: String(row.jenis),
      status: String(row.status),
      catatan: row.catatan ?? undefined,
      nomorBA,
      tanggalPermintaan: row.tanggalPermintaan?.toISOString(),
      tanggalEvaluasi: row.tanggalEvaluasi?.toISOString(),
      tanggalVerifikasi,
      namaBiro: undefined,
      nilaiOPD: row.nilaiOPD ?? undefined,
      diverifikasiOlehUserId: row.diverifikasiOlehUserId ?? undefined,
      ditandatanganiOlehKoordinatorUserId: row.ditandatanganiOlehKoordinatorUserId ?? undefined,
      tanggalTTDBaKoordinator: row.tanggalTTDBaKoordinator?.toISOString(),
      diselesaikanOlehId: row.diselesaikanOlehId ?? undefined,
      diselesaikanOleh:
        row.diselesaikanOleh !== null && row.diselesaikanOleh !== undefined
          ? { id: row.diselesaikanOleh.penggunaId, nama: row.diselesaikanOleh.nama }
          : undefined,
      opd: { id: row.opd.opdId, nama: row.opd.nama },
      timEvaluasi: row.diselesaikanOleh?.nama ?? '',
      tanggalDiselesaikan: row.tanggalDiselesaikan?.toISOString(),
      sopList,
      nilaiEvaluasi,
      riwayatEvaluasi,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
