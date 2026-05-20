import { Injectable } from '@nestjs/common';
import type { JwtAccessPayload } from '../../common';
import { RegisterTteDto } from './dto/register-tte.dto';
import { TandaTanganiDto } from './dto/tanda-tangani.dto';
import { UpdateTtePinDto } from './dto/update-tte-pin.dto';
import { TtePenandatangananService } from './tte-penandatanganan.service';
import { TteProfilService } from './tte-profil.service';
import { TteVerifikasiService } from './tte-verifikasi.service';

/** Respons profil TTE untuk klien — PIN disimpan di baris `Pengguna`. */
export type TteProfilResponse = {
  readonly id: string;
  readonly userId: string;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user?: {
    readonly id: string;
    readonly nama: string;
    readonly email: string;
    readonly nip: string;
    readonly jabatan: string;
    readonly pangkat: string;
  };
};

export type TteRiwayatResponse = {
  readonly id: string;
  readonly userId: string;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly dokumenTteId: string;
  readonly nomorDokumen: string;
  readonly jenisDokumen: string;
  readonly judulDokumen: string;
  readonly hashDokumen: string;
  readonly sopDetailId?: string;
  readonly pengajuanEvaluasiId?: string;
  readonly ditandatanganiPada: string;
  readonly user?: { readonly id: string; readonly nama: string; readonly nip: string };
  readonly qrVerificationUrl: string | null;
  readonly qrPayload: string;
};

export type TtePengesahanPublicResponse = {
  readonly userId: string;
  readonly dokumenTteId: string;
  readonly ditandatanganiPada: string;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly penandatangan: {
    readonly nama: string;
    readonly nip: string;
    readonly jabatan: string;
  };
  readonly dokumen: {
    readonly dokumenTteId: string;
    readonly nomorDokumen: string;
    readonly judulDokumen: string;
    readonly jenisDokumen: string;
    readonly hashDokumen: string;
    readonly sopDetailId?: string;
    readonly pengajuanEvaluasiId?: string;
  };
  readonly qrVerificationUrl: string | null;
  readonly qrPayload: string;
};

export type TteBatchSignSopPengajuanResponse = {
  readonly pengajuanEvaluasiId: string;
  readonly totalSopDitandatangani: number;
  readonly ditandatanganiPada: string;
};

/**
 * Fasad TTE: mendelegasikan ke layanan profil, penandatanganan, dan verifikasi.
 */
@Injectable()
export class TteService {
  constructor(
    private readonly profilService: TteProfilService,
    private readonly penandatangananService: TtePenandatangananService,
    private readonly verifikasiService: TteVerifikasiService,
  ) {}

  getProfil(user: JwtAccessPayload): Promise<TteProfilResponse | null> {
    return this.profilService.getProfil(user);
  }

  registerProfil(user: JwtAccessPayload, dto: RegisterTteDto): Promise<TteProfilResponse> {
    return this.profilService.registerProfil(user, dto);
  }

  updateProfilPin(user: JwtAccessPayload, dto: UpdateTtePinDto): Promise<TteProfilResponse> {
    return this.profilService.updateProfilPin(user, dto);
  }

  mintTokenVerifikasi(user: JwtAccessPayload): Promise<{ token: string }> {
    return this.profilService.mintTokenVerifikasi(user);
  }

  konfirmasiEmail(token: string): Promise<{ message: string }> {
    return this.profilService.konfirmasiEmail(token);
  }

  getPengesahanPublic(
    dokumenTteId: string,
    userId: string,
  ): Promise<TtePengesahanPublicResponse> {
    return this.verifikasiService.getPengesahanPublic(dokumenTteId, userId);
  }

  tandaTanganiBa(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteRiwayatResponse> {
    return this.penandatangananService.tandaTanganiBa(user, pengajuanEvaluasiId, dto);
  }

  tandaTanganiSemuaSopPengajuan(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteBatchSignSopPengajuanResponse> {
    return this.penandatangananService.tandaTanganiSemuaSopPengajuan(user, pengajuanEvaluasiId, dto);
  }
}
