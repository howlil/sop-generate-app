/**
 * Common types shared across the application
 * Single source of truth for all shared types
 */

// ==================== ROLE TYPES ====================

export type RoleKey =
  | 'BIRO_ORGANISASI'
  | 'TIM_PENYUSUN'
  | 'KOORDINATOR_TIM_PENYUSUN'
  | 'KEPALA_OPD'
  | 'TIM_EVALUASI'

export type PeranTTE = 'KEPALA_OPD' | 'BIRO_ORGANISASI' | 'KOORDINATOR_TIM_PENYUSUN'

// ==================== STATUS TYPES ====================

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
  | 'DICABUT'

export type StatusHasilEvaluasi = 'SESUAI' | 'TIDAK_SESUAI'

export type StatusTim = 'AKTIF' | 'NONAKTIF'

export type StatusPeraturan = 'BERLAKU' | 'DICABUT'

export type StatusKomentar = 'OPEN' | 'RESOLVED'

export type StatusPengajuanEvaluasi =
  | 'MENUNGGU_EVALUASI'
  | 'SEDANG_DIEVALUASI'
  | 'SELESAI_DIEVALUASI'
  | 'DIVERIFIKASI_BIRO'
  | 'DITANDATANGANI_KOORDINATOR'
  | 'SELESAI'

// ==================== SOP TYPES ====================

export type JenisLangkahProsedur = 'TERMINATOR' | 'TASK' | 'DECISION'
/** Alias used in some hooks */
export type StatusSop = StatusSOP
export type SatuanWaktu = 'm' | 'h' | 'd' | 'w' | 'mo' | 'y'
export type JenisLampiran = 'PERINGATAN' | 'KUALIFIKASI_PELAKSANAAN' | 'PERALATAN' | 'PENCATATAN_PENDATAAN'
export type BagianSOP = 'METADATA' | 'LANGKAH_SOP' | 'LAMPIRAN_TEKS' | 'DASAR_HUKUM' | 'PELAKSANA' | 'DIAGRAM' | 'SOP_TERKAIT'

// ==================== EVALUASI TYPES ====================

export type JenisPengajuanEvaluasi = 'TERJADWAL' | 'MANDIRI'

// ==================== TIM TYPES ====================

export type PeranInternalTimPenyusun = 'Koordinator' | 'Anggota'

// ==================== UI TYPES ====================

export interface StatusBadgeConfig {
  label: string
  color: string
  bgColor: string
  className?: string
}

// ==================== DIAGRAM TYPES ====================

export type DiagramType = 'FLOWCHART' | 'BPMN'

export interface DiagramNode {
  id: string
  type: JenisLangkahProsedur
  x: number
  y: number
  label: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: string
}

// ==================== KOMENTAR TYPES ====================

export interface Komentar {
  id: string
  sopDetailId: string
  userId: string
  isi: string
  status: StatusKomentar
  createdAt: string
}

// ==================== MANAJEMEN OPD FORM TYPES ====================

export interface KepalaFormState {
  name: string
  nip: string
  email: string
  phone: string
}

export interface FormTambahKepalaState {
  opdId: string
  name: string
  nip: string
  email: string
}

export interface PindahFormState {
  opdId: string
}

export interface PindahDialogPerson {
  name: string
  nip?: string
  email: string
}

export interface RiwayatDialogPerson {
  name: string
  nip?: string
}

// ==================== SOP UI TYPES ====================

export interface SOPDetailMetadata {
  id?: string
  judul?: string
  nomor?: string
  nomorSOP?: string
  nama?: string
  tahun?: number
  tentang?: string
  opdId?: string
  lembaga?: string
  logoUrl?: string
  tanggalEfektif?: string
  tanggalRevisi?: string
  /** Version number */
  version?: number
  // English property aliases used in SOPHeaderSection
  name?: string
  number?: string
  institutionLogo?: string
  institutionLines?: string[]
  lawBasis?: string[]
  relatedSop?: string[]
  warning?: string
  implementQualification?: string | string[]
  equipment?: string | string[]
  recordData?: string | string[]
}

export interface ProsedurRow {
  id: string
  urutan: number
  /** Alias for urutan - used in diagram logic */
  no?: number
  kegiatan: string
  pelaksana: string
  waktu?: number
  satuanWaktu?: string
  /** Alias for waktu - used in diagram */
  time?: number
  /** Alias for satuanWaktu - used in diagram */
  time_unit?: string
  /** Alias for kelengkapan - used in diagram */
  mutu_kelengkapan?: string
  kelengkapan?: string
  /** Alias for mutu waktu - used in diagram/editor */
  mutu_waktu?: string
  keluaran?: string
  /** Alias for keluaran - used in diagram/editor */
  output?: string
  /** Keterangan field */
  keterangan?: string
  type?: 'terminator' | 'task' | 'decision'
  id_next_step_if_yes?: string
  id_next_step_if_no?: string
  pelaksanaIds?: string[]
  /** For diagram implementer mapping - renamed to avoid conflict */
  pelaksanaMapping?: Record<string, string>
}

export interface SopItem {
  id: string
  judul: string
  opdId: string
  status: string
  nomorSOP?: string
  author?: string
  peraturanId?: string
  tanggal?: string
  terakhirDiperbarui?: string
  lastEditedBy?: string
  lastEditedAt?: string
  versi?: number
  createdAt: string
  updatedAt: string
}

export interface PelaksanaRow {
  id: string
  nama: string
  opdId?: string
  urutan?: number
}

export interface SOPTemplate {
  id?: string
  judul: string
  opdId: string
  kode?: string
  opd?: string
  kategori?: string
  versi?: number
  logoInstansi?: string
  namaLembaga?: string
}

// ==================== EVALUASI UI TYPES ====================

export interface CreatePengajuanEvaluasiDto {
  opdId: string
  jenis: JenisPengajuanEvaluasi
  sopDetailIds: string[]
  catatan?: string
}

export interface IsiNilaiEvaluasiDto {
  hasil: StatusHasilEvaluasi
  catatan?: string
  version?: number
}

export interface SelesaiEvaluasiDto {
  nilaiOPD?: number
}

export interface RekapEvaluasi {
  opdId: string
  opdNama: string
  tahun: number
  totalPengajuan: number
  totalTerjadwal: number
  totalMandiri: number
  nilaiRataRata?: number
  detail: RekapDetail[]
}

export interface RekapDetail {
  pengajuanEvaluasiId: string
  jenis: JenisPengajuanEvaluasi
  status: StatusPengajuanEvaluasi
  nilaiOPD?: number
  tanggalEvaluasi: string
  detailSopCount: number
  hasilEvaluasi: {
    sesuai: number
    tidakSesuai: number
  }
  /** Computed fields for grafik */
  opdId?: string
  opdNama?: string
  totalPengajuan?: number
  nilaiRataRata?: number
}
