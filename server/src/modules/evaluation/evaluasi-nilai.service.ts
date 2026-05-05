import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../common';
import {
  HasilEvaluasi,
  NilaiEvaluasi,
  PengajuanEvaluasi,
  Prisma,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import { IsiNilaiEvaluasiDto } from './dto/isi-nilai-evaluasi.dto';
import type { NilaiEvaluasiPatchResponseDto } from './dto/nilai-evaluasi-patch-response.dto';
import type { PengajuanEvaluasiSelesaiResponseDto } from './dto/pengajuan-evaluasi-selesai-response.dto';
import { SelesaiEvaluasiDto } from './dto/selesai-evaluasi.dto';
import { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import { SopCommentRepository } from '../sop/sop-comment/sop-comment.repository';

/**
 * Kebijakan mutasi evaluasi (tanpa enum baru `StatusPengajuanEvaluasi`):
 * - Scope dokumen = baris `NilaiEvaluasi` dalam pengajuan `SEDANG_DIEVALUASI` atau `MENUNGGU_EVALUASI` (saat pertama mengisi nilai, pengajuan dipromosikan ke `SEDANG_DIEVALUASI`).
 * - `isiNilai`: `PERLU_PERBAIKAN` wajib `catatan` non-kosong; catatan disalin ke `Komentar` untuk panel penyusun; `DetailSOP` → `REVISI_DARI_TIM_EVALUASI` jika status ∈ `DIAJUKAN_EVALUASI`|`SEDANG_DIEVALUASI`.
 * - `selesai`: setiap baris harus `hasil === SESUAI`; skor `nilaiOPD` wajib; pengajuan → `SELESAI_DIEVALUASI`; `DetailSOP` terkait → `SIAP_DIVERIFIKASI`.
 */
@Injectable()
export class EvaluasiNilaiService {
  constructor(
    private readonly evaluasiNilaiRepository: EvaluasiNilaiRepository,
    private readonly sopCommentRepository: SopCommentRepository,
  ) {}

  /** Menyimpan satu nilai SOP dalam pengajuan aktif dan mencatat `LogNilaiEvaluasi`. */
  async isiNilai(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    detailSopId: string,
    dto: IsiNilaiEvaluasiDto,
  ): Promise<NilaiEvaluasiPatchResponseDto> {
    const evaluatorId = user.sub;
    const expectedVersion = dto.version ?? 0;
    const hasil = dto.hasil;
    const catatanNorm = dto.catatan === undefined ? null : dto.catatan.trim();
    if (
      hasil === HasilEvaluasi.PERLU_PERBAIKAN &&
      (catatanNorm === null || catatanNorm === '')
    ) {
      throw new BadRequestException(
        'Catatan wajib diisi jika hasil Perlu Perbaikan',
      );
    }

    const barisAkhir = await this.evaluasiNilaiRepository.runTransaction(
      async (tx: Prisma.TransactionClient): Promise<NilaiEvaluasi> => {
        const pengajuan = await tx.pengajuanEvaluasi.findUnique({
          where: { pengajuanEvaluasiId },
          select: { status: true },
        });
        if (pengajuan === null) {
          throw new NotFoundException(
            'Pengajuan evaluasi tidak ditemukan atau tidak aktif untuk diisi nilai',
          );
        }
        const bolehIsiNilai =
          pengajuan.status === StatusPengajuanEvaluasi.SEDANG_DIEVALUASI ||
          pengajuan.status === StatusPengajuanEvaluasi.MENUNGGU_EVALUASI;
        if (!bolehIsiNilai) {
          throw new NotFoundException(
            'Pengajuan evaluasi tidak ditemukan atau tidak aktif untuk diisi nilai',
          );
        }
        if (pengajuan.status === StatusPengajuanEvaluasi.MENUNGGU_EVALUASI) {
          await tx.pengajuanEvaluasi.update({
            where: { pengajuanEvaluasiId },
            data: {
              status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
              tanggalEvaluasi: new Date(),
              version: { increment: 1 },
            },
          });
        }
        const sebelumnya = await tx.nilaiEvaluasi.findUnique({
          where: {
            pengajuanEvaluasiId_detailSopId: {
              pengajuanEvaluasiId,
              detailSopId,
            },
          },
        });
        if (sebelumnya === null) {
          throw new NotFoundException(
            'Baris nilai untuk dokumen SOP ini tidak ada dalam pengajuan',
          );
        }
        if (sebelumnya.version !== expectedVersion) {
          throw new ConflictException(
            'Konflik versi: data nilai sudah berubah, muat ulang lalu coba lagi',
          );
        }
        await tx.logNilaiEvaluasi.create({
          data: {
            pengajuanEvaluasiId,
            detailSopId,
            evaluatorId,
            hasilSebelum: sebelumnya.hasil,
            hasilSesudah: hasil,
            catatanSebelum: sebelumnya.catatan ?? null,
            catatanSesudah: catatanNorm,
          },
        });
        const sesudah = await tx.nilaiEvaluasi.update({
          where: { nilaiEvaluasiId: sebelumnya.nilaiEvaluasiId },
          data: {
            hasil,
            catatan: catatanNorm,
            version: { increment: 1 },
            dinilaiOlehId: evaluatorId,
          },
        });
        if (hasil === HasilEvaluasi.PERLU_PERBAIKAN && catatanNorm !== null) {
          await this.sopCommentRepository.createKomentarWithLogTx(tx, {
            detailSopId,
            userId: evaluatorId,
            isi: `[Evaluasi] ${catatanNorm}`,
          });
          await tx.detailSOP.updateMany({
            where: {
              detailSopId,
              status: {
                in: [StatusSOP.DIAJUKAN_EVALUASI, StatusSOP.SEDANG_DIEVALUASI],
              },
            },
            data: {
              status: StatusSOP.REVISI_DARI_TIM_EVALUASI,
            },
          });
        }
        return sesudah;
      },
    );
    return EvaluasiNilaiService.keResponseNilaiDto(barisAkhir);
  }

  /** Mengakhiri siklus evaluasi pengajuan (menuju PJ) hanya jika tiap dokumen SESUAI dan skor OPD terisi. */
  async selesai(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: SelesaiEvaluasiDto,
  ): Promise<PengajuanEvaluasiSelesaiResponseDto> {
    const evaluatorId = user.sub;
    const nilaiOpdFinal = dto.nilaiOPD;

    const yangDiupdate = await this.evaluasiNilaiRepository.runTransaction(
      async (
        tx: Prisma.TransactionClient,
      ): Promise<PengajuanEvaluasi | null> => {
        const pengajuan = await tx.pengajuanEvaluasi.findUnique({
          where: { pengajuanEvaluasiId },
          include: { nilaiEvaluasi: true },
        });
        if (pengajuan === null) {
          throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
        }
        if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
          throw new BadRequestException(
            'Pengajuan tidak dalam status pengisian evaluator',
          );
        }
        if (pengajuan.nilaiEvaluasi.length === 0) {
          throw new BadRequestException(
            'Pengajuan tidak memiliki dokumen untuk dinilai',
          );
        }
        for (const row of pengajuan.nilaiEvaluasi) {
          if (row.hasil !== HasilEvaluasi.SESUAI) {
            throw new BadRequestException(
              'Semua SOP harus bernilai Sesuai sebelum mengajukan hasil ke PJ Evaluator. Perbaiki atau lengkapi evaluasi per dokumen.',
            );
          }
        }
        const detailIds = pengajuan.nilaiEvaluasi.map((n) => n.detailSopId);
        await tx.detailSOP.updateMany({
          where: {
            detailSopId: { in: detailIds },
            status: {
              in: [
                StatusSOP.DIAJUKAN_EVALUASI,
                StatusSOP.SEDANG_DIEVALUASI,
                StatusSOP.REVISI_DARI_TIM_EVALUASI,
              ],
            },
          },
          data: { status: StatusSOP.SIAP_DIVERIFIKASI },
        });
        const selesai = new Date();
        await tx.pengajuanEvaluasi.update({
          where: { pengajuanEvaluasiId },
          data: {
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
            nilaiOPD: nilaiOpdFinal,
            tanggalDiselesaikan: selesai,
            tanggalEvaluasi: pengajuan.tanggalEvaluasi ?? selesai,
            diselesaikanOlehId: evaluatorId,
            version: { increment: 1 },
          },
        });
        return tx.pengajuanEvaluasi.findUnique({
          where: { pengajuanEvaluasiId },
        });
      },
    );
    return EvaluasiNilaiService.keResponseSelesaiDto(yangDiupdate);
  }

  private static keResponseNilaiDto(row: NilaiEvaluasi): NilaiEvaluasiPatchResponseDto {
    return {
      id: row.nilaiEvaluasiId,
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      sopDetailId: row.detailSopId,
      hasil:
        row.hasil === undefined || row.hasil === null
          ? undefined
          : (row.hasil as HasilEvaluasi),
      catatan: row.catatan ?? null,
      version: row.version,
      dinilaiOlehId: row.dinilaiOlehId ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private static keResponseSelesaiDto(
    row: PengajuanEvaluasi | null,
  ): PengajuanEvaluasiSelesaiResponseDto {
    if (row === null) {
      throw new ConflictException('Gagal memuat pengajuan setelah penyimpanan');
    }
    return {
      id: row.pengajuanEvaluasiId,
      opdId: row.opdId,
      status: String(row.status),
      nilaiOPD: row.nilaiOPD ?? undefined,
      tanggalEvaluasi: row.tanggalEvaluasi?.toISOString(),
      tanggalDiselesaikan: row.tanggalDiselesaikan?.toISOString(),
      diselesaikanOlehId: row.diselesaikanOlehId ?? undefined,
      catatan: row.catatan ?? undefined,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
