import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildTteQrPayload } from './tte-verifikasi-qr.util';
import { mapTtePeranResponse } from './tte-support';
import { TteRepository } from './tte.repository';
import type { TtePengesahanPublicResponse } from './tte.service';

@Injectable()
export class TteVerifikasiService {
  private readonly publicTteVerifyBaseUrl: string | undefined;

  constructor(
    private readonly tteRepository: TteRepository,
    private readonly configService: ConfigService,
  ) {
    this.publicTteVerifyBaseUrl = this.configService.get<string>('PUBLIC_TTE_VERIFY_BASE_URL');
  }

  async getPengesahanPublic(
    dokumenTteId: string,
    userId: string,
  ): Promise<TtePengesahanPublicResponse> {
    const row = await this.tteRepository.findRiwayatPengesahanByUserAndDokumen(userId, dokumenTteId);
    if (row === null || row.dokumenTte === null || row.user === null) {
      throw new NotFoundException('Data pengesahan tidak ditemukan');
    }
    const qr = buildTteQrPayload({
      publicVerifyBaseUrl: this.publicTteVerifyBaseUrl,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      hashDokumen: row.dokumenTte.hashDokumen,
    });
    const peran = mapTtePeranResponse(row.peran);
    return {
      userId: row.userId,
      dokumenTteId: row.dokumenTteId,
      ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      peran,
      penandatangan: {
        nama: row.user.nama,
        nip: row.user.nip,
        jabatan: row.user.jabatan ?? '',
      },
      dokumen: {
        dokumenTteId: row.dokumenTte.dokumenTteId,
        nomorDokumen: row.dokumenTte.nomorDokumen,
        judulDokumen: row.dokumenTte.judulDokumen,
        jenisDokumen: String(row.dokumenTte.jenisDokumen),
        hashDokumen: row.dokumenTte.hashDokumen,
        sopDetailId: row.dokumenTte.detailSopId ?? undefined,
        pengajuanEvaluasiId: row.dokumenTte.pengajuanEvaluasiId ?? undefined,
      },
      qrVerificationUrl: qr.qrVerificationUrl,
      qrPayload: qr.qrPayload,
    };
  }
}
