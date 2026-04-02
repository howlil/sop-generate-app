/**
 * Common types shared across the application
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

// ==================== SOP TYPES ====================

export type JenisLangkahProsedur = 'TERMINATOR' | 'TASK' | 'DECISION'
export type LangkahType = JenisLangkahProsedur
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
}

// ==================== DIAGRAM TYPES ====================

export type DiagramType = 'FLOWCHART' | 'BPMN'

export interface DiagramNode {
  id: string
  type: LangkahType
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
