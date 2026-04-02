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

// ==================== UI TYPES ====================

export interface StatusBadgeConfig {
  label: string
  color: string
  bgColor: string
}
