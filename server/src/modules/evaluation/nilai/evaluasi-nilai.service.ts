import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import {
  displayStatusTindakLanjut,
} from '../../../common/status/status-display';
import {
  HasilEvaluasi,
  JenisPengajuanEvaluasi,
  NilaiEvaluasi,
  PengajuanEvaluasi,
  PeranPengguna,
  Prisma,
  StatusTindakLanjut,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import { IsiNilaiEvaluasiDto } from './dto/isi-nilai-evaluasi.dto';
import type { NilaiEvaluasiPatchResponseDto } from './dto/nilai-evaluasi-patch-response.dto';
import { buildNilaiEvaluasiClientId } from './nilai-evaluasi-client-id';
import type { PengajuanEvaluasiSelesaiResponseDto } from './dto/pengajuan-evaluasi-selesai-response.dto';
import { SelesaiEvaluasiDto } from './dto/selesai-evaluasi.dto';
import { assertBolehKirimUlangSetelahRevisi } from './evaluasi-revisi.policy';
import { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import { PengajuanEvaluasiRepository } from '../pengajuan/pengajuan-evaluasi.repository';

/**
 * Kebijakan mutasi evaluasi:
 * - `isiNilai`: pengajuan `SEDANG_DIEVALUASI`; `PERLU_PERBAIKAN` wajib catatan + `statusTindakLanjut` TERBUKA; `DetailSOP` → REVISI.
 * - `tandaiTindakLanjutSelesai`: penyusun/PJ menandai umpan balik sudah ditindaklanjuti (SELESAI).
 * - `selesai`: semua baris `SESUAI`; pengajuan evaluasi → SELESAI_DIEVALUASI; dokumen → SIAP_DIVERIFIKASI.
 */
@Injectable()
export class EvaluasiNilaiService {
  constructor(
    private readonly evaluasiNilaiRepository: EvaluasiNilaiRepository,
    private readonly pengajuanEvaluasiRepository: PengajuanEvaluasiRepository,
  ) {}

  private assertHanyaEvaluator(user: JwtAccessPayload): void {
    if (user.peran !== PeranPengguna.EVALUATOR) {
      throw new ForbiddenException(
        'Hanya evaluator yang dapat menilai dan menyelesaikan pengajuan evaluasi',
      );
    }
  }

  /** Menyimpan satu nilai SOP dalam pengajuan aktif dan mencatat `LogNilaiEvaluasi`. */
  async isiNilai(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    detailSopId: string,
    dto: IsiNilaiEvaluasiDto,
  ): Promise<NilaiEvaluasiPatchResponseDto> {
    this.assertHanyaEvaluator(user);
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
        if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
          throw new NotFoundException(
            'Pengajuan evaluasi tidak ditemukan atau tidak aktif untuk diisi nilai',
          );
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
        const logCreatedAt = new Date();
        await tx.logNilaiEvaluasi.create({
          data: {
            pengajuanEvaluasiId,
            detailSopId,
            penggunaId: evaluatorId,
            createdAt: logCreatedAt,
            hasilSebelum: sebelumnya.hasil,
            hasilSesudah: hasil,
            catatanSebelum: sebelumnya.catatan ?? null,
            catatanSesudah: catatanNorm,
          },
        });
        const tindakLanjutData =
          hasil === HasilEvaluasi.PERLU_PERBAIKAN
            ? {
                statusTindakLanjut: StatusTindakLanjut.TERBUKA,
                ditindaklanjutiPada: null,
                ditindaklanjutiOlehId: null,
              }
            : {
                statusTindakLanjut: null,
                ditindaklanjutiPada: null,
                ditindaklanjutiOlehId: null,
              };
        const sesudah = await tx.nilaiEvaluasi.update({
          where: {
            pengajuanEvaluasiId_detailSopId: {
              pengajuanEvaluasiId,
              detailSopId,
            },
          },
          data: {
            hasil,
            catatan: catatanNorm,
            version: { increment: 1 },
            dinilaiOlehId: evaluatorId,
            ...tindakLanjutData,
          },
        });
        if (hasil === HasilEvaluasi.PERLU_PERBAIKAN) {
          await tx.detailSOP.updateMany({
            where: {
              detailSopId,
              status: {
                in: [StatusSOP.DIAJUKAN_EVALUASI, StatusSOP.SEDANG_DIEVALUASI],
              },
            },
            data: {
              status: StatusSOP.REVISI_DARI_EVALUATOR,
            },
          });
        }
        return sesudah;
      },
    );
    return EvaluasiNilaiService.keResponseNilaiDto(barisAkhir);
  }

  /** Penyusun / PJ: tandai catatan evaluasi sudah ditindaklanjuti sebelum kirim ulang. */
  async tandaiTindakLanjutSelesai(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    detailSopId: string,
  ): Promise<NilaiEvaluasiPatchResponseDto> {
    if (user.peran !== PeranPengguna.PENYUSUN && user.peran !== PeranPengguna.PJ_PENYUSUN) {
      throw new ForbiddenException(
        'Hanya penyusun atau PJ Penyusun yang dapat menandai tindak lanjut evaluasi',
      );
    }
    const opdId = await this.pengajuanEvaluasiRepository.findOpdIdPengguna(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('OPD pengguna tidak ditemukan');
    }
    const barisAkhir = await this.evaluasiNilaiRepository.runTransaction(
      async (tx: Prisma.TransactionClient): Promise<NilaiEvaluasi> => {
        const pengajuan = await tx.pengajuanEvaluasi.findUnique({
          where: { pengajuanEvaluasiId },
          select: { status: true, opdId: true },
        });
        if (pengajuan === null || pengajuan.opdId !== opdId) {
          throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
        }
        if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
          throw new BadRequestException(
            'Pengajuan tidak dalam status evaluasi aktif',
          );
        }
        const detail = await tx.detailSOP.findFirst({
          where: { detailSopId, sop: { opdId } },
          select: { status: true },
        });
        if (detail === null) {
          throw new NotFoundException('Detail SOP tidak ditemukan');
        }
        if (detail.status !== StatusSOP.REVISI_DARI_EVALUATOR) {
          throw new ConflictException(
            'Hanya dokumen berstatus revisi dari evaluator yang dapat ditandai tindak lanjut',
          );
        }
        const nilai = await tx.nilaiEvaluasi.findUnique({
          where: {
            pengajuanEvaluasiId_detailSopId: {
              pengajuanEvaluasiId,
              detailSopId,
            },
          },
        });
        if (nilai === null) {
          throw new NotFoundException('Baris nilai evaluasi tidak ditemukan');
        }
        if (nilai.hasil !== HasilEvaluasi.PERLU_PERBAIKAN) {
          throw new BadRequestException(
            'Hanya umpan balik Perlu perbaikan yang memerlukan tindak lanjut',
          );
        }
        if (nilai.statusTindakLanjut === StatusTindakLanjut.SELESAI) {
          throw new ConflictException('Umpan balik evaluasi sudah ditandai selesai');
        }
        if (nilai.statusTindakLanjut !== StatusTindakLanjut.TERBUKA) {
          throw new BadRequestException('Tidak ada umpan balik evaluasi yang menunggu tindak lanjut');
        }
        const sekarang = new Date();
        return tx.nilaiEvaluasi.update({
          where: {
            pengajuanEvaluasiId_detailSopId: {
              pengajuanEvaluasiId,
              detailSopId,
            },
          },
          data: {
            statusTindakLanjut: StatusTindakLanjut.SELESAI,
            ditindaklanjutiPada: sekarang,
            ditindaklanjutiOlehId: user.sub,
            version: { increment: 1 },
          },
        });
      },
    );
    return EvaluasiNilaiService.keResponseNilaiDto(barisAkhir);
  }

  /** Validasi guard kirim ulang: wajib status tindak lanjut SELESAI bila hasil perlu perbaikan. */
  async assertBolehKirimUlangSetelahRevisi(detailSopId: string): Promise<void> {
    const nilai = await this.evaluasiNilaiRepository.findNilaiRevisiAktifForDetail(detailSopId);
    assertBolehKirimUlangSetelahRevisi(nilai);
  }

  async findOpdIdByDetailSopId(detailSopId: string): Promise<string | null> {
    return this.evaluasiNilaiRepository.findOpdIdByDetailSopId(detailSopId);
  }

  async findUmpanBalikForDetail(
    detailSopId: string,
    opdId: string,
  ): Promise<Awaited<ReturnType<EvaluasiNilaiRepository['findUmpanBalikForDetail']>>> {
    return this.evaluasiNilaiRepository.findUmpanBalikForDetail(detailSopId, opdId);
  }

  /** Mengakhiri siklus evaluasi pengajuan (menuju PJ) hanya jika tiap dokumen SESUAI dan skor OPD terisi. */
  async selesai(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: SelesaiEvaluasiDto,
  ): Promise<PengajuanEvaluasiSelesaiResponseDto> {
    this.assertHanyaEvaluator(user);
    const evaluatorId = user.sub;
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
        const mandiri = pengajuan.jenis === JenisPengajuanEvaluasi.MANDIRI;
        if (mandiri && dto.nilaiOPD !== undefined) {
          throw new BadRequestException(
            'Evaluasi mandiri tidak menggunakan penilaian tingkat OPD; jangan kirim nilaiOPD.',
          );
        }
        if (!mandiri) {
          const skor = dto.nilaiOPD;
          if (
            skor === undefined ||
            skor === null ||
            !Number.isInteger(skor) ||
            skor < 1 ||
            skor > 5
          ) {
            throw new BadRequestException(
              'Skor evaluasi tingkat OPD (1–5) wajib untuk pengajuan terjadwal.',
            );
          }
        }
        const nilaiOpdFinal = mandiri ? null : dto.nilaiOPD!;
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
                StatusSOP.REVISI_DARI_EVALUATOR,
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
    const tindakDisplay = displayStatusTindakLanjut(row.statusTindakLanjut);
    return {
      id: buildNilaiEvaluasiClientId(row.pengajuanEvaluasiId, row.detailSopId),
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      sopDetailId: row.detailSopId,
      hasil:
        row.hasil === undefined || row.hasil === null
          ? undefined
          : (row.hasil as HasilEvaluasi),
      catatan: row.catatan ?? null,
      statusTindakLanjut: row.statusTindakLanjut ?? null,
      statusTindakLanjutLabel: tindakDisplay?.label ?? null,
      ditindaklanjutiPada: row.ditindaklanjutiPada?.toISOString() ?? null,
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
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
