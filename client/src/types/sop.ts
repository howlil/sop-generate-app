/**
 * Complete SOP types matching server schema
 */

export type StatusSOP =
  | 'DRAFT'
  | 'SEDANG_DISUSUN'
  | 'SIAP_DIEVALUASI'
  | 'DIAJUKAN_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'REVISI_DARI_TIM_EVALUASI'
  | 'SIAP_DIVERIFIKASI'
  | 'DIVERIFIKASI_BIRO_ORGANISASI'
  | 'BERLAKU'
  | 'DIGANTIKAN'
  | 'DICABUT'

export type JenisLangkahProsedur = 'TERMINATOR' | 'TASK' | 'DECISION'
export type SatuanWaktu = 'm' | 'h' | 'd' | 'w' | 'mo' | 'y'
export type JenisLampiran = 'PERINGATAN' | 'KUALIFIKASI_PELAKSANAAN' | 'PERALATAN' | 'PENCATATAN_PENDATAAN'
export type BagianSOP = 'METADATA' | 'LANGKAH_SOP' | 'LAMPIRAN_TEKS' | 'DASAR_HUKUM' | 'PELAKSANA' | 'DIAGRAM' | 'SOP_TERKAIT'

export interface Sop {
  id: string
  opdId: string
  judul: string
  createdAt: string
  updatedAt: string
  totalVersi?: number
  statusAktif?: StatusSOP
  opd?: { nama: string }
}

export interface SopDetail {
  id: string
  sopId: string
  status: StatusSOP
  versi: number
  nomorSOP: string
  tanggalPembuatan: string
  tanggalRevisi?: string
  tanggalEfektif?: string
  logoInstansi: string
  namaLembaga: string
  lebarKolomKegiatan?: number
  lebarKolomPelaksana?: number
  lebarKolomKelengkapan?: number
  lebarKolomWaktu?: number
  lebarKolomOutput?: number
  lebarKolomKeterangan?: number
  dibuatOlehId?: string
  terakhirDieditOlehId?: string
  createdAt: string
  updatedAt: string
  
  // Relations
  sop?: Sop
  dibuatOleh?: { id: string; nama: string }
  terakhirDieditOleh?: { id: string; nama: string }
  lampiran?: LampiranTeks[]
  dasarHukum?: DasarHukum[]
  relasiSopKeluar?: SopTerkait[]
  relasiSopMasuk?: SopTerkait[]
  langkahSOP?: LangkahSOP[]
  swimlanes?: DetailSOPPelaksana[]
  nilaiEvaluasi?: NilaiEvaluasi[]
  logEditSop?: LogEditSOP[]
}

export interface CreateSopRequest {
  judul: string
  opdId: string
  logoInstansi: string
  namaLembaga: string
}

export interface UpdateMetadataDto {
  logoInstansi?: string
  namaLembaga?: string
  lebarKolomKegiatan?: number
  lebarKolomPelaksana?: number
  lebarKolomKelengkapan?: number
  lebarKolomWaktu?: number
  lebarKolomOutput?: number
  lebarKolomKeterangan?: number
}

export interface UpdateStatusDto {
  status: StatusSOP
}

// Lampiran Teks
export interface LampiranTeks {
  id: string
  sopDetailId: string
  jenis: JenisLampiran
  teks: string
}

export interface CreateLampiranTeksDto {
  jenis: JenisLampiran
  teks: string
}

// Dasar Hukum
export interface DasarHukum {
  sopDetailId: string
  peraturanId: string
  peraturan?: {
    id: string
    namaPeraturan: string
    nomor: string
    tahun: number
    tentang: string
  }
}

export interface CreateDasarHukumDto {
  peraturanId: string
}

// SOP Terkait
export interface SopTerkait {
  sopDetailId: string
  sopTerkaitDetailId: string
  sop?: { id: string; judul: string }
  sopTerkait?: { id: string; judul: string }
}

export interface CreateSopTerkaitDto {
  sopTerkaitDetailId: string
}

// Langkah SOP
export interface LangkahSOP {
  id: string
  sopDetailId: string
  kegiatan: string
  jenis: JenisLangkahProsedur
  urutan: number
  kelengkapan: string
  keluaran: string
  waktu: number
  satuanWaktu: SatuanWaktu
  keterangan: string
  pelaksanaId: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
  createdAt: string
  updatedAt: string
  
  pelaksana?: Pelaksana
  langkahYa?: LangkahSOP
  langkahTidak?: LangkahSOP
}

export interface CreateLangkahSOPDto {
  kegiatan: string
  jenis: JenisLangkahProsedur
  urutan: number
  kelengkapan: string
  keluaran: string
  waktu: number
  satuanWaktu: SatuanWaktu
  keterangan: string
  pelaksanaId: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
}

export interface UpdateLangkahSOPDto {
  kegiatan?: string
  kelengkapan?: string
  keluaran?: string
  waktu?: number
  keterangan?: string
  pelaksanaId?: string
  langkahSelanjutnyaYaId?: string
  langkahSelanjutnyaTidakId?: string
}

// Pelaksana
export interface Pelaksana {
  id: string
  opdId: string
  namaPelaksana: string
  createdAt: string
  updatedAt: string
}

export interface CreatePelaksanaDto {
  opdId: string
  namaPelaksana: string
}

export interface DetailSOPPelaksana {
  sopDetailId: string
  pelaksanaId: string
  urutan: number
  pelaksana?: Pelaksana
}

export interface CreateDetailSOPPelaksanaDto {
  pelaksanaId: string
  urutan?: number
}

// Log Edit SOP
export interface LogEditSOP {
  id: string
  sopDetailId: string
  userId: string
  bagian: BagianSOP
  entityId?: string
  keterangan?: string
  aktorRole: string
  createdAt: string
  
  user?: { id: string; nama: string }
}

// Nilai Evaluasi (for relation)
export interface NilaiEvaluasi {
  id: string
  pengajuanEvaluasiId: string
  sopDetailId: string
  hasil?: 'SESUAI' | 'TIDAK_SESUAI'
  catatan?: string
  version: number
  dinilaiOlehId?: string
  createdAt: string
  updatedAt: string
}

// Legacy types for backward compatibility
export interface SopItem {
  id: string
  judul: string
  opdId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SOPDaftarItem {
  id: string
  judul: string
  opdId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SOPTemplate {
  judul: string
  opdId: string
  logoInstansi?: string
  namaLembaga?: string
}

export interface ProsedurRow {
  id: string
  urutan: number
  kegiatan: string
  pelaksana: string
  waktu?: number
  satuanWaktu?: string
  kelengkapan?: string
  keluaran?: string
}

export const SOP_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Sedang Disusun', label: 'Sedang Disusun' },
  { value: 'Siap Dievaluasi', label: 'Siap Dievaluasi' },
  { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
  { value: 'Siap Diverifikasi', label: 'Siap Diverifikasi' },
  { value: 'Berlaku', label: 'Berlaku' },
  { value: 'Dicabut', label: 'Dicabut' },
] as const

export const DEFAULT_SOP_STATUS = 'Draft'

export interface SOPDetailMetadata {
  judul?: string
  nomor?: string
  tahun?: number
  tentang?: string
  opdId?: string
}

export interface VersionHistoryItem {
  version: string
  date: string
  author: string
  changes: string
}

export interface DetailSOPVersionSeed {
  version: number
  snapshot: any
  author?: string
  date?: string
}
