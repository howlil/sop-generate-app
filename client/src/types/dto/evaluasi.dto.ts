import type { PenyusunWorkbenchData } from "./sop.dto";
import type { TTESignaturePayload } from "./tte.dto";

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
  | "SEDANG_DIEVALUASI"
  | "SELESAI_DIEVALUASI"
  | "DIVERIFIKASI_PJ_EVALUATOR"
  | "DITANDATANGANI_PJ_PENYUSUN"
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
  nomorBA?: string;
  tanggalPermintaan?: string;
  tanggalEvaluasi?: string;
  tanggalVerifikasi?: string | null;
  namaPjEvaluator?: string;
  nilaiOPD?: number;
  diverifikasiOlehUserId?: string;
  ditandatanganiOlehPjPenyusunUserId?: string;
  namaPjPenyusun?: string;
  tanggalTTDBaPjPenyusun?: string;
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

/** Identifier stabil selaras server: `pengajuanEvaluasiId:detailSopId`. */
export function buildNilaiEvaluasiClientId(
  pengajuanEvaluasiId: string,
  detailSopId: string,
): string {
  return `${pengajuanEvaluasiId}:${detailSopId}`;
}

/** Satu baris daftar SOP dalam batch — GET `/evaluasi/pengajuan/:id` (`sopItems`). */
export interface PengajuanSopItemShell {
  detailSopId: string;
  sopId: string;
  judul: string;
  nomorSOP: string;
  statusDetailSop: string;
  hasilEvaluasi?: string;
  catatanRingkas?: string;
  evaluatorTerakhir?: { id: string; nama: string };
}

/** Entri log nilai dalam shell — paralel dengan `timelineNilai` di API. */
export interface PengajuanTimelineNilaiEntry {
  id: string;
  sopDetailId: string;
  evaluatorId: string;
  evaluatorNama: string;
  hasilSebelum?: StatusHasilEvaluasi;
  hasilSesudah?: StatusHasilEvaluasi;
  catatanSebelum?: string;
  catatanSesudah?: string;
  createdAt: string;
}

/** GET `/evaluasi/pengajuan/:id`. */
export interface PengajuanEvaluasiShellOpd {
  id: string;
  nama: string;
}

export interface PengajuanEvaluasiShell {
  id: string;
  opdId: string;
  opdNama: string;
  jenis: string;
  status: string;
  version: number;
  nomorBA?: string;
  tanggalPermintaan?: string;
  tanggalEvaluasi?: string;
  tanggalVerifikasi?: string;
  nilaiOPD?: number;
  diverifikasiOlehUserId?: string;
  namaPjEvaluator?: string;
  ditandatanganiOlehPjPenyusunUserId?: string;
  namaPjPenyusun?: string;
  tanggalTTDBaPjPenyusun?: string;
  diselesaikanOlehId?: string;
  diselesaikanOleh?: { id: string; nama: string };
  opd: PengajuanEvaluasiShellOpd;
  timEvaluasi?: string;
  tanggalDiselesaikan?: string;
  sopItems: PengajuanSopItemShell[];
  nilaiEvaluasi: NilaiEvaluasi[];
  timelineNilai: PengajuanTimelineNilaiEntry[];
  createdAt: string;
  updatedAt: string;
}

/** GET `/evaluasi/pengajuan/:id/sop-dokumen/:detailSopId`. */
export interface PengajuanSopWorkbenchResponse {
  detailSopId: string;
  workbench: PenyusunWorkbenchData;
}

export interface BeritaAcaraHasilPerSopRow {
  nomorSOP: string;
  judul: string;
  hasilEvaluasi?: string;
  ringkasanCatatanEvaluator?: string;
}

/** GET `/evaluasi/pengajuan/:id/berita-acara`. */
export interface BeritaAcaraEvaluasiView {
  namaOpd: string;
  nomorBA?: string;
  tanggalEvaluasi?: string;
  tanggalVerifikasiPjEvaluator?: string;
  nilaiKeseluruhanOpd?: number;
  hasilPerSop: BeritaAcaraHasilPerSopRow[];
  timEvaluasi: {
    penanggungJawabSelesai?: { id: string; nama: string };
    evaluatorNamaUnik: string[];
  };
  tteBeritaAcara?: {
    dokumenTteId: string;
    hashDokumen: string;
    versiDokumen: number;
    adaRiwayatTandaTanganPerPeran: Record<string, boolean>;
    payloadPjEvaluator?: TTESignaturePayload;
    payloadPjPenyusun?: TTESignaturePayload;
  };
}

export interface NilaiEvaluasi {
  /** Gabungan `pengajuanEvaluasiId:detailSopId` (bukan UUID surrogate DB). */
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
  /** Id komposit ter-encode untuk klien (bukan UUID); memuat pengajuan, detail SOP, pengguna, dan `createdAt`. */
  id: string;
  pengajuanEvaluasiId?: string;
  sopDetailId: string;
  /** Nilai sama dengan `penggunaId` evaluator di server (nama field tetap untuk kompatibilitas API). */
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
  jenis: JenisPengajuanEvaluasi;
  sopDetailIds: string[];
}

export interface IsiNilaiEvaluasiDto {
  hasil: StatusHasilEvaluasi;
  catatan?: string;
  version?: number;
}

/** Wajib untuk pengajuan TERJADWAL pada PATCH selesai; untuk MANDIRI tidak dikirim. */
export interface SelesaiEvaluasiDto {
  nilaiOPD?: number;
}

export interface UpdatePengajuanEvaluasiDto {
  status?: StatusPengajuanEvaluasi;
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
  /** Beberapa enum status (di-query sebagai `statusIn` berulang); mengalahkan `status` di server jika ada. */
  statusIn?: readonly string[];
  jenis?: string;
}

/** Meta pagination — selaras server `toPaginatedData`. */
export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Satu baris GET `/evaluasi/ringkas`. */
export interface PengajuanEvaluasiRingkasRow {
  pengajuanEvaluasiId: string;
  opdId: string;
  opdNama: string;
  jenis: string;
  status: string;
  tanggalEvaluasi?: string;
  createdAt: string;
  jumlahSop: number;
  jumlahSudahDinilai: number;
  nilaiOPD?: number;
}

export interface PengajuanEvaluasiRingkasPage {
  items: PengajuanEvaluasiRingkasRow[];
  meta: PaginationMetaDto;
}

/** Query GET `/evaluasi/ringkas`. */
export interface EvaluasiRingkasQueryParams {
  page?: number;
  limit?: number;
  opdId?: string;
  status?: string;
  statusIn?: readonly string[];
  jenis?: string;
  search?: string;
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
  jenis: JenisPengajuanEvaluasi;
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
