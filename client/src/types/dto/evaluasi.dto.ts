import type { PenyusunWorkbenchData } from "./sop.dto";

export type StatusHasilEvaluasi = "SESUAI" | "PERLU_PERBAIKAN";
export const STATUS_HASIL_EVALUASI = {
  SESUAI: "SESUAI",
  PERLU_PERBAIKAN: "PERLU_PERBAIKAN",
} as const;

export interface EvaluasiBatchSubmitError {
  kind: "none" | "no_selection" | "incomplete" | "blocked";
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

export interface EvaluasiGrafikTahunanPerOpd {
  opdId: string
  opdNama: string
  jumlahEvaluasi: number
  rataRataSkor: number | null
}

export interface EvaluasiGrafikTahunanRingkasanTahun {
  tahun: number
  totalPenilaian: number
  jumlahOpdDenganPenilaian: number
  rataRataSkorOpd: number | null
  perOpd: EvaluasiGrafikTahunanPerOpd[]
}

/** GET `/evaluasi/laporan/grafik-tahunan` — payload `data`. */
export interface EvaluasiGrafikTahunanData {
  totalOpdAktif: number
  daftarOpd: Array<{ opdId: string; opdNama: string }>
  ringkasanPerTahun: EvaluasiGrafikTahunanRingkasanTahun[]
}

export interface EvaluasiGrafikTahunanQueryParams {
  /** Satu tahun; dipakai bila tidak mengirim `tahunDari` / `tahunSampai`. */
  tahun?: number
  tahunDari?: number
  tahunSampai?: number
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

/** Wajib saat PATCH selesai — server menolak tanpa skor OPD 1–5. */
export interface SelesaiEvaluasiDto {
  nilaiOPD: number;
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

/** GET `/evaluasi/workspace/opd/:opdId` — agregat halaman workspace evaluator. */
export type EvaluasiWorkspaceTampilanAlur =
  | "perlu_evaluasi"
  | "sedang_dievaluasi"
  | "selesai_pengajuan_ini";

export interface EvaluasiWorkspaceNilaiPerDetail {
  detailSopId: string;
  hasil: StatusHasilEvaluasi | null;
  catatan: string | null;
  version: number;
}

export interface EvaluasiWorkspacePengajuanAktif {
  id: string;
  status: string;
  nilaiPerDetail: EvaluasiWorkspaceNilaiPerDetail[];
}

export interface EvaluasiWorkspaceDaftarSopRow {
  detailSopId: string;
  sopId: string;
  judul: string;
  nomorSOP: string;
  statusDetail: string;
  tampilanAlur: EvaluasiWorkspaceTampilanAlur;
  evaluatorTerakhir: { nama: string; pada: string } | null;
}

export interface EvaluasiWorkspaceRiwayatOpdEntry {
  tanggal: string;
  evaluatorNama: string;
  catatan?: string | null;
  nilaiOPD?: number | null;
  pengajuanEvaluasiId: string;
}

export interface EvaluasiWorkspaceRiwayatNilaiEntry {
  tanggal: string;
  evaluatorNama: string;
  hasil: StatusHasilEvaluasi;
  catatan?: string | null;
  pengajuanEvaluasiId: string;
}

export interface EvaluasiWorkspacePreview {
  detailSopId: string;
  workbench: PenyusunWorkbenchData;
}

export interface EvaluasiWorkspaceOpdResponse {
  opd: { id: string; nama: string };
  pengajuanAktif: EvaluasiWorkspacePengajuanAktif | null;
  daftarSop: EvaluasiWorkspaceDaftarSopRow[];
  riwayatOpd: EvaluasiWorkspaceRiwayatOpdEntry[];
  preview: EvaluasiWorkspacePreview | null;
  riwayatNilaiSopTerpilih: EvaluasiWorkspaceRiwayatNilaiEntry[];
}

export interface EvaluasiWorkspaceQueryParams {
  detailSopId?: string;
  expand?: string;
  riwayatLimit?: number;
}
