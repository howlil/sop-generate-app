export type PeranTTE =
  | "KEPALA_OPD"
  | "PJ_EVALUATOR"
  | "PJ_PENYUSUN";

/** Profil TTE dari GET/POST `/tte/profil` — PIN disimpan di server pada data pengguna. */
export interface TteProfil {
  id: string;
  userId: string;
  peran: PeranTTE;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nama: string;
    email: string;
    nip: string;
    jabatan: string;
    pangkat: string;
  };
}

export interface RiwayatTandaTangan {
  id: string;
  userId: string;
  dokumenTteId: string;
  peran: PeranTTE;
  nomorDokumen: string;
  jenisDokumen: string;
  judulDokumen: string;
  hashDokumen: string;
  sopDetailId?: string;
  pengajuanEvaluasiId?: string;
  ditandatanganiPada: string;
  user?: { id: string; nama: string; nip: string };
  sopDetail?: {
    id: string;
    nomorSOP: string;
    judul: string;
  };
  pengajuanEvaluasi?: {
    id: string;
    nomorBA?: string;
  };
}

export interface TTESignaturePayload {
  /** Turunan `dokumenTteId:userId` — kompatibel dengan ringkasan baris riwayat. */
  id: string;
  dokumenTteId: string;
  userId: string;
  nip: string;
  namaLengkap: string;
  jabatan?: string;
  signedAt?: string;
}

/** Respons GET publik verifikasi pengesahan (`/tte/public/pengesahan/:dokumenTteId/:userId`). */
export interface TtePengesahanPublic {
  userId: string;
  dokumenTteId: string;
  ditandatanganiPada: string;
  peran: PeranTTE;
  penandatangan: {
    nama: string;
    nip: string;
    jabatan: string;
  };
  dokumen: {
    dokumenTteId: string;
    nomorDokumen: string;
    judulDokumen: string;
    jenisDokumen: string;
    hashDokumen: string;
    sopDetailId?: string;
    pengajuanEvaluasiId?: string;
  };
  qrVerificationUrl: string | null;
  qrPayload: string;
}

export type TTERole =
  | "kepala-opd"
  | "pj-evaluator"
  | "pj-penyusun";

export interface RegisterTteDto {
  pin: string;
}

export interface TandaTanganiBaDto {
  pin: string;
  nomorDokumen: string;
  judulDokumen: string;
}

export interface TandaTanganiSopDto {
  pin: string;
  nomorDokumen: string;
  judulDokumen: string;
}

export interface TandaTanganiBaMutationDto {
  pengajuanId: string;
  payload: TandaTanganiBaDto;
}

export interface TandaTanganiSopMutationDto {
  sopDetailId: string;
  payload: TandaTanganiSopDto;
}

export interface TandaTanganiSopPengajuanDto {
  pin: string;
  nomorDokumen: string;
  judulDokumen: string;
}

export interface TandaTanganiSopPengajuanMutationDto {
  pengajuanId: string;
  payload: TandaTanganiSopPengajuanDto;
}

export interface TandaTanganiSopPengajuanResponse {
  pengajuanEvaluasiId: string;
  totalSopDitandatangani: number;
  ditandatanganiPada: string;
}
