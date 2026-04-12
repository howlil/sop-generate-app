/**
 * Complete SOP types matching server schema
 * Note: Uses shared types from @/types/common
 */

import type {
  StatusSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
  JenisLampiran,
} from "@/types/common";

export interface Sop {
  id: string;
  opdId: string;
  judul: string;
  createdAt: string;
  updatedAt: string;
  totalVersi?: number;
  statusAktif?: StatusSOP;
  opd?: { nama: string };
  // Fields from SopDetail that pages access on the list view
  nomorSOP?: string;
  status?: StatusSOP | string;
  author?: string;
  versi?: number;
  lastEditedBy?: string;
  lastEditedAt?: string;
  terakhirDiperbarui?: string;
  peraturanId?: string;
  tanggal?: string;
  detailSopId?: string;
}

export interface SopDetail {
  id: string;
  sopId: string;
  status: StatusSOP;
  versi: number;
  nomorSOP: string;
  tanggalPembuatan: string;
  tanggalRevisi?: string;
  tanggalEfektif?: string;
  logoInstansi: string;
  namaLembaga: string;
  lebarKolomKegiatan?: number;
  lebarKolomPelaksana?: number;
  lebarKolomKelengkapan?: number;
  lebarKolomWaktu?: number;
  lebarKolomOutput?: number;
  lebarKolomKeterangan?: number;
  dibuatOlehId?: string;
  terakhirDieditOlehId?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  sop?: Sop;
  dibuatOleh?: { id: string; nama: string };
  terakhirDieditOleh?: { id: string; nama: string };
  lampiran?: LampiranTeks[];
  dasarHukum?: DasarHukum[];
  relasiSopKeluar?: SopTerkait[];
  relasiSopMasuk?: SopTerkait[];
  langkahSOP?: LangkahSOP[];
  swimlanes?: DetailSOPPelaksana[];
  nilaiEvaluasi?: { id: string; hasil?: string; catatan?: string }[];
}

export interface LampiranTeks {
  id: string;
  sopDetailId: string;
  judul: string;
  jenis: JenisLampiran;
  isi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DasarHukum {
  id: string;
  sopDetailId: string;
  judul: string;
  nomor: string;
  tahun: string;
  createdAt: string;
  updatedAt: string;
}

export interface SopTerkait {
  id: string;
  sopDetailId: string;
  sopTerkaitId: string;
  createdAt: string;
  updatedAt: string;

  sopDetail?: SopDetail;
  sopTerkait?: SopDetail;
}

export interface LangkahSOP {
  id: string;
  sopDetailId: string;
  urutan: number;
  kegiatan: string;
  jenis: JenisLangkahProsedur;
  kelengkapan: string;
  keluaran: string;
  waktu: number;
  satuanWaktu: SatuanWaktu;
  keterangan: string;
  pelaksanaId: string;
  langkahSelanjutnyaYaId?: string | null;
  langkahSelanjutnyaTidakId?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relation convenience fields
  pelaksana?: { id: string; namaPelaksana: string };
}

export interface DetailSOPPelaksana {
  id: string;
  sopDetailId: string;
  pelaksanaId: string;
  urutan: number;
  createdAt: string;
  updatedAt: string;

  pelaksana?: { id: string; opdId: string; namaPelaksana: string };
}

export interface Pelaksana {
  id: string;
  opdId: string;
  namaPelaksana: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DTO TYPES ====================

export interface CreateSopRequest {
  judul: string;
  opdId: string;
  logoInstansi?: string;
  namaLembaga?: string;
}

export interface UpdateMetadataDto {
  logoInstansi?: string;
  namaLembaga?: string;
  tanggalRevisi?: string;
  tanggalEfektif?: string;
  lebarKolomKegiatan?: number;
  lebarKolomPelaksana?: number;
  lebarKolomKelengkapan?: number;
  lebarKolomWaktu?: number;
  lebarKolomOutput?: number;
  lebarKolomKeterangan?: number;
}

export interface UpdateStatusDto {
  status: StatusSOP;
}

export interface CreateLangkahSOPDto {
  kegiatan: string;
  jenis?: JenisLangkahProsedur;
  urutan: number;
  kelengkapan: string;
  keluaran: string;
  waktu: number;
  satuanWaktu: SatuanWaktu;
  keterangan?: string;
  pelaksanaId: string;
  langkahSelanjutnyaYaId?: string;
  langkahSelanjutnyaTidakId?: string;
}

export interface UpdateLangkahSOPDto {
  kegiatan?: string;
  jenis?: JenisLangkahProsedur;
  urutan?: number;
  kelengkapan?: string;
  keluaran?: string;
  waktu?: number;
  satuanWaktu?: SatuanWaktu;
  keterangan?: string;
  pelaksanaId?: string;
  langkahSelanjutnyaYaId?: string | null;
  langkahSelanjutnyaTidakId?: string | null;
}

export interface CreatePelaksanaDto {
  opdId: string;
  namaPelaksana: string;
}

export interface CreateDetailSOPPelaksanaDto {
  pelaksanaId: string;
  urutan?: number;
}

export interface CreateLampiranTeksDto {
  judul: string;
  jenis: JenisLampiran;
  isi?: string;
}

export interface CreateDasarHukumDto {
  judul: string;
  nomor: string;
  tahun: string;
}

export interface CreateSopTerkaitDto {
  sopTerkaitId: string;
}

// ==================== UI CONSTANTS ====================

export const SOP_STATUS_FILTER_OPTIONS = [
  { value: "all" as const, label: "Semua Status" },
  { value: "DRAFT" as const, label: "DRAFT" },
  { value: "SEDANG_DISUSUN" as const, label: "SEDANG_DISUSUN" },
  { value: "SIAP_DIEVALUASI" as const, label: "SIAP_DIEVALUASI" },
  { value: "DIAJUKAN_EVALUASI" as const, label: "DIAJUKAN_EVALUASI" },
  { value: "SEDANG_DIEVALUASI" as const, label: "SEDANG_DIEVALUASI" },
  {
    value: "REVISI_DARI_TIM_EVALUASI" as const,
    label: "REVISI_DARI_TIM_EVALUASI",
  },
  { value: "SIAP_DIVERIFIKASI" as const, label: "SIAP_DIVERIFIKASI" },
  {
    value: "DIVERIFIKASI_BIRO_ORGANISASI" as const,
    label: "DIVERIFIKASI_BIRO_ORGANISASI",
  },
  { value: "BERLAKU" as const, label: "BERLAKU" },
  { value: "DICABUT" as const, label: "DICABUT" },
] as const;

export const DEFAULT_SOP_STATUS = "DRAFT";
