export type PeranTTE =
  | "KEPALA_OPD"
  | "PJ_EVALUATOR"
  | "PJ_PENYUSUN";

export interface KredensialTTE {
  id: string;
  userId: string;
  emailTerverifikasi: boolean;
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
  id: string;
  nip: string;
  namaLengkap: string;
  jabatan?: string;
  signedAt?: string;
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
