/**
 * SOP UI types for component state
 */

export interface SOPDetailMetadata {
  judul?: string
  nomor?: string
  tahun?: number
  tentang?: string
  opdId?: string
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
  type?: 'terminator' | 'task' | 'decision'
  id_next_step_if_yes?: string
  id_next_step_if_no?: string
  pelaksanaIds?: string[]
}

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

export const SOP_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'SEDANG_DISUSUN', label: 'SEDANG_DISUSUN' },
  { value: 'SIAP_DIEVALUASI', label: 'SIAP_DIEVALUASI' },
  { value: 'DIAJUKAN_EVALUASI', label: 'DIAJUKAN_EVALUASI' },
  { value: 'SEDANG_DIEVALUASI', label: 'SEDANG_DIEVALUASI' },
  { value: 'REVISI_DARI_TIM_EVALUASI', label: 'REVISI_DARI_TIM_EVALUASI' },
  { value: 'SIAP_DIVERIFIKASI', label: 'SIAP_DIVERIFIKASI' },
  { value: 'DIVERIFIKASI_BIRO_ORGANISASI', label: 'DIVERIFIKASI_BIRO_ORGANISASI' },
  { value: 'BERLAKU', label: 'BERLAKU' },
  { value: 'DICABUT', label: 'DICABUT' },
] as const

/**
 * Default SOP status for new instances
 * Single source of truth - also exported from utils/constants.ts as part of STATUS_SOP_ALL
 */
export const DEFAULT_SOP_STATUS = 'DRAFT'
