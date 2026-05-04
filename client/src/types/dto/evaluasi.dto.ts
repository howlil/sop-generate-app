export type StatusHasilEvaluasi = "SESUAI" | "TIDAK_SESUAI";
export const STATUS_HASIL_EVALUASI = {
  SESUAI: "SESUAI",
  TIDAK_SESUAI: "TIDAK_SESUAI",
} as const;

export interface EvaluasiBatchSubmitError {
  kind: "none" | "no_selection" | "incomplete";
  items: { id: string; judul: string; nomorSOP: string }[];
  sopId?: string;
  message?: string;
}

export type StatusPengajuanEvaluasi =
  | "MENUNGGU_EVALUASI"
  | "SEDANG_DIEVALUASI"
  | "SELESAI_DIEVALUASI"
  | "DIVERIFIKASI_BIRO"
  | "DITANDATANGANI_KOORDINATOR"
  | "SELESAI";
export type JenisPengajuanEvaluasi = "TERJADWAL" | "MANDIRI";

export interface RekapEvaluasi {
  opdId: string;
  opdNama: string;
  tahun: number;
  totalPengajuan: number;
  totalTerjadwal: number;
  totalMandiri: number;
  nilaiRataRata?: number;
  detail: RekapDetail[];
}

export interface RekapDetail {
  pengajuanEvaluasiId: string;
  jenis: JenisPengajuanEvaluasi;
  status: StatusPengajuanEvaluasi;
  nilaiOPD?: number;
  tanggalEvaluasi: string;
  detailSopCount: number;
  hasilEvaluasi: {
    sesuai: number;
    tidakSesuai: number;
  };
  opdId?: string;
  opdNama?: string;
  totalPengajuan?: number;
  nilaiRataRata?: number;
}

export interface PengajuanEvaluasi {
  id: string;
  opdId: string;
  opdNama?: string;
  jenis: JenisPengajuanEvaluasi;
  status: StatusPengajuanEvaluasi;
  catatan?: string;
  nomorBA?: string;
  tanggalPermintaan?: string;
  tanggalEvaluasi?: string;
  tanggalVerifikasi?: string | null;
  namaBiro?: string;
  nilaiOPD?: number;
  diverifikasiOlehUserId?: string;
  ditandatanganiOlehKoordinatorUserId?: string;
  tanggalTTDBaKoordinator?: string;
  diselesaikanOlehId?: string;
  diselesaikanOleh?: {
    id?: string;
    nama?: string;
  };
  opd?: {
    id?: string;
    nama?: string;
  };
  timEvaluasi?: string;
  tteSignaturePayload?: unknown;
  nilaiEvaluasi?: NilaiEvaluasi[];
  tanggalDiselesaikan?: string;
  sopList?: Array<{
    id: string;
    sopDetailId: string;
    judul: string;
    nomor: string;
    nama: string;
    nomorSOP: string;
    status: string;
    hasil?: StatusHasilEvaluasi;
  }>;
  riwayatEvaluasi?: Array<{
    id: string;
    sopDetailId: string;
    evaluatorId: string;
    evaluatorNama: string;
    hasilSebelum?: StatusHasilEvaluasi;
    hasilSesudah?: StatusHasilEvaluasi;
    catatanSebelum?: string;
    catatanSesudah?: string;
    createdAt: string;
  }>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface NilaiEvaluasi {
  id: string;
  pengajuanEvaluasiId: string;
  sopDetailId: string;
  hasil?: StatusHasilEvaluasi;
  catatan?: string;
  version: number;
  dinilaiOlehId?: string;
  dinilaiOleh?: {
    id?: string;
    nama?: string;
  };
  sopDetail?: {
    id?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LogNilaiEvaluasi {
  id: string;
  pengajuanEvaluasiId?: string;
  sopDetailId: string;
  evaluatorId: string;
  evaluatorNama?: string;
  hasilSebelum?: StatusHasilEvaluasi;
  hasilSesudah?: StatusHasilEvaluasi;
  catatanSebelum?: string;
  catatanSesudah?: string;
  createdAt: string;
}

export interface BatchListSopItem {
  id: string;
  sopDetailId: string;
  judul: string;
  nomorSOP: string;
  status: string;
  hasil?: StatusHasilEvaluasi;
}

export interface CreatePengajuanEvaluasiDto {
  opdId: string;
  jenis: JenisPengajuanEvaluasi;
  sopDetailIds: string[];
  catatan?: string;
}

export interface IsiNilaiEvaluasiDto {
  hasil: StatusHasilEvaluasi;
  catatan?: string;
  version?: number;
}

export interface SelesaiEvaluasiDto {
  nilaiOPD?: number;
}

export interface UpdatePengajuanEvaluasiDto {
  status?: StatusPengajuanEvaluasi;
  catatan?: string;
  nilaiOPD?: number;
}

export interface CreateNilaiEvaluasiDto {
  pengajuanEvaluasiId: string;
  sopDetailId: string;
  hasil: StatusHasilEvaluasi;
  catatan?: string;
}

export interface UpdateNilaiEvaluasiDto {
  hasil?: StatusHasilEvaluasi;
  catatan?: string;
  version?: number;
}

export interface EvaluasiListQueryParams {
  opdId?: string;
  status?: string;
  jenis?: string;
}

export interface IsiNilaiEvaluasiMutationDto {
  pengajuanEvaluasiId: string;
  sopDetailId: string;
  payload: IsiNilaiEvaluasiDto;
}

export interface SelesaiEvaluasiMutationDto {
  pengajuanEvaluasiId: string;
  payload: SelesaiEvaluasiDto;
}

export interface RekapEvaluasiApiResponse {
  tahun: number;
  totalPengajuan: number;
  totalSelesai: number;
  overallNilaiRataRata: number | null;
  opd: Array<{
    opdId: string;
    opdNama: string;
    total: number;
    selesai: number;
    sesuai: number;
    tidakSesuai: number;
    nilaiRataRata: number | null;
    pengajuanDetails: Array<{
      pengajuanEvaluasiId: string;
      jenis: string;
      status: string;
      nilaiOPD: number | null;
      tanggalEvaluasi: string | null;
      detailSopCount: number;
      hasilEvaluasi: { sesuai: number; tidakSesuai: number };
    }>;
  }>;
}
