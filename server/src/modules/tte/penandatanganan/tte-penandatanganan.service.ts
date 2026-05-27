import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { JwtAccessPayload } from '../../../common';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import { TandaTanganiDto } from '../shared/dto/tanda-tangani.dto';
import { buildTteQrPayload } from '../shared/utils/tte-verifikasi-qr.util';
import { hashDokumenKanonik, mapTtePeranResponse, runTteRepositoryMutation } from '../shared/utils/tte-support';
import { TteRepository } from '../shared/repository/tte.repository';
import type { TteBatchSignSopPengajuanResponse, TteRiwayatResponse } from '../shared/types/tte.types';

@Injectable()
export class TtePenandatangananService {
  private readonly publicTteVerifyBaseUrl: string | undefined;

  constructor(
    private readonly tteRepository: TteRepository,
    configService: ConfigService,
  ) {
    this.publicTteVerifyBaseUrl = configService.get<string>('PUBLIC_TTE_VERIFY_BASE_URL');
  }

  async tandaTanganiBa(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteRiwayatResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    await this.assertPinValid(user.sub, dto.pin);
    const hashDokumen = hashDokumenKanonik({
      jenis: JenisDokumenTte.BERITA_ACARA_EVALUASI,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      refId: pengajuanEvaluasiId,
    });
    if (pengguna.peran === PeranPengguna.PJ_EVALUATOR) {
      const result = await runTteRepositoryMutation(() =>
        this.tteRepository.transaksiTandaTanganiBaEvaluator({
          pengajuanEvaluasiId,
          userId: user.sub,
          peran: PeranPengguna.PJ_EVALUATOR,
          hashDokumen,
          nomorDokumen: dto.nomorDokumen,
          judulDokumen: dto.judulDokumen,
        }),
      );
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
      }
      if (result.error === 'BAD_STATUS') {
        throw new ConflictException(
          `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}`,
        );
      }
      if (result.error === 'ALREADY_SIGNED') {
        throw new ConflictException('Berita Acara sudah ditandatangani untuk peran ini');
      }
      if (result.error === 'INVALID_DOC_PARENT') {
        throw new ConflictException(
          'Data dokumen TTE tidak konsisten: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)',
        );
      }
      if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
        throw new ConflictException('Gagal menyelesaikan penandatanganan');
      }
      return this.mapRiwayat(result.riwayat);
    }
    if (pengguna.peran === PeranPengguna.PJ_PENYUSUN) {
      const result = await runTteRepositoryMutation(() =>
        this.tteRepository.transaksiTandaTanganiBaPjPenyusun({
          pengajuanEvaluasiId,
          userId: user.sub,
          userOpdId: pengguna.opdId,
          peran: PeranPengguna.PJ_PENYUSUN,
          hashDokumen,
          nomorDokumen: dto.nomorDokumen,
          judulDokumen: dto.judulDokumen,
        }),
      );
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
      }
      if (result.error === 'FORBIDDEN_OPD') {
        throw new ForbiddenException('Pengajuan tidak termasuk OPD Anda');
      }
      if (result.error === 'BAD_STATUS') {
        throw new ConflictException(
          `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}`,
        );
      }
      if (result.error === 'ALREADY_SIGNED') {
        throw new ConflictException('Berita Acara sudah ditandatangani untuk peran ini');
      }
      if (result.error === 'INVALID_DOC_PARENT') {
        throw new ConflictException(
          'Data dokumen TTE tidak konsisten: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)',
        );
      }
      if (result.error === 'DOC_MISMATCH') {
        throw new ConflictException('Dokumen TTE tidak cocok dengan pengajuan evaluasi');
      }
      if (result.error === 'SOP_STATUS_DRIFT') {
        throw new ConflictException(
          `Status sebagian SOP sudah berubah (${String((result as { updatedCount?: number }).updatedCount ?? 0)}/${String((result as { expectedCount?: number }).expectedCount ?? 0)}). Muat ulang pengajuan lalu coba tanda tangani lagi.`,
        );
      }
      if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
        throw new ConflictException('Gagal menyelesaikan penandatanganan');
      }
      return this.mapRiwayat(result.riwayat);
    }
    throw new ForbiddenException(
      'Hanya PJ Evaluator atau PJ Penyusun yang dapat menandatangani Berita Acara',
    );
  }

  async tandaTanganiSemuaSopPengajuan(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteBatchSignSopPengajuanResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    if (pengguna.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Hanya Kepala OPD yang dapat menandatangani seluruh SOP');
    }
    await this.assertPinValid(user.sub, dto.pin);
    const hashDokumen = hashDokumenKanonik({
      jenis: JenisDokumenTte.SOP_BERLAKU,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      refId: pengajuanEvaluasiId,
    });
    const signedAt = new Date();
    const result = await runTteRepositoryMutation(() =>
      this.tteRepository.transaksiTandaTanganiSemuaSopPengajuan({
        pengajuanEvaluasiId,
        userId: user.sub,
        userOpdId: pengguna.opdId,
        peran: PeranPengguna.KEPALA_OPD,
        signedAt,
        hashDokumen,
        nomorDokumen: dto.nomorDokumen,
        judulDokumen: dto.judulDokumen,
      }),
    );
    if (result.error === 'NOT_FOUND') {
      throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
    }
    if (result.error === 'FORBIDDEN_OPD') {
      throw new ForbiddenException('Pengajuan tidak termasuk OPD Anda');
    }
    if (result.error === 'BAD_PENGAJUAN_STATUS') {
      throw new ConflictException(
        `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}. Pengesahan massal SOP dalam pengajuan evaluasi hanya diizinkan pada status ${String((result as { expectedStatus?: StatusPengajuanEvaluasi }).expectedStatus ?? StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN)}.`,
      );
    }
    if (result.error === 'EMPTY_SOP') {
      throw new BadRequestException('Pengajuan tidak memiliki SOP untuk ditandatangani');
    }
    if (result.error === 'BAD_SOP_STATUS') {
      throw new ConflictException(
        `SOP ${String((result as { nomorSOP?: string }).nomorSOP ?? (result as { detailSopId?: string }).detailSopId)} (${String((result as { judulSOP?: string }).judulSOP ?? '-')}) tidak dapat ditandatangani dari status ${String((result as { status?: StatusSOP }).status)}. Status yang diwajibkan: ${String((result as { expectedStatus?: StatusSOP }).expectedStatus ?? StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI)}.`,
      );
    }
    if (result.error === 'ALREADY_SIGNED') {
      throw new ConflictException(
        `SOP ${String((result as { detailSopId?: string }).detailSopId)} sudah ditandatangani oleh Kepala OPD`,
      );
    }
    if (result.error === 'INVALID_DOC_PARENT') {
      throw new ConflictException(
        `Data dokumen TTE tidak konsisten untuk SOP ${String((result as { detailSopId?: string }).detailSopId)}: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)`,
      );
    }
    if (!result.ok) {
      throw new ConflictException('Gagal menandatangani seluruh SOP dalam pengajuan');
    }
    return {
      pengajuanEvaluasiId,
      totalSopDitandatangani: result.totalSopDitandatangani,
      ditandatanganiPada: signedAt.toISOString(),
    };
  }

  private mapRiwayat(row: {
    userId: string;
    dokumenTteId: string;
    peran: PeranPengguna;
    ditandatanganiPada: Date;
    dokumenTte: {
      dokumenTteId: string;
      nomorDokumen: string;
      judulDokumen: string;
      hashDokumen: string;
      jenisDokumen: JenisDokumenTte;
      detailSopId: string | null;
      pengajuanEvaluasiId: string | null;
    };
    user: { penggunaId: string; nama: string; nip: string };
  }): TteRiwayatResponse {
    const peranMap = mapTtePeranResponse(row.peran);
    const qr = buildTteQrPayload({
      publicVerifyBaseUrl: this.publicTteVerifyBaseUrl,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      hashDokumen: row.dokumenTte.hashDokumen,
    });
    return {
      id: `${row.dokumenTte.dokumenTteId}:${row.userId}`,
      userId: row.userId,
      peran: peranMap,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      nomorDokumen: row.dokumenTte.nomorDokumen,
      jenisDokumen: String(row.dokumenTte.jenisDokumen),
      judulDokumen: row.dokumenTte.judulDokumen,
      hashDokumen: row.dokumenTte.hashDokumen,
      sopDetailId: row.dokumenTte.detailSopId ?? undefined,
      pengajuanEvaluasiId: row.dokumenTte.pengajuanEvaluasiId ?? undefined,
      ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      user: { id: row.user.penggunaId, nama: row.user.nama, nip: row.user.nip },
      qrVerificationUrl: qr.qrVerificationUrl,
      qrPayload: qr.qrPayload,
    };
  }

  private async assertPinValid(userId: string, pin: string): Promise<void> {
    const row = await this.tteRepository.findKredensial(userId);
    if (row === null) {
      throw new BadRequestException('Kredensial TTE belum dibuat');
    }
    const ok = await bcrypt.compare(pin, row.hashPin);
    if (!ok) {
      throw new ForbiddenException('PIN TTE tidak valid');
    }
  }
}
