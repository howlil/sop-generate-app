/**
 * Evaluasi Constants
 */

export const HASIL_EVALUASI = {
  SESUAI: 'SESUAI',
  TIDAK_SESUAI: 'TIDAK_SESUAI',
} as const

export const STATUS_EVALUASI = {
  DIAJUKAN_EVALUASI: 'DIAJUKAN_EVALUASI',
  SEDANG_DIEVALUASI: 'SEDANG_DIEVALUASI',
  REVISI_DARI_TIM_EVALUASI: 'REVISI_DARI_TIM_EVALUASI',
  SIAP_DIVERIFIKASI: 'SIAP_DIVERIFIKASI',
} as const

// Export for backward compatibility
export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: 'SESUAI', label: 'Sesuai' },
  { value: 'TIDAK_SESUAI', label: 'Tidak Sesuai' },
]
