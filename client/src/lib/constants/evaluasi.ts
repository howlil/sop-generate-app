/**
 * Evaluasi constants
 */

export const EVALUASI_STORAGE_KEY = 'evaluasi_data'

export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
  { value: 'Siap Diverifikasi', label: 'Siap Diverifikasi' },
  { value: 'Revisi dari Tim Evaluasi', label: 'Revisi dari Tim Evaluasi' },
] as const

export const EVALUASI_FORM_TABS = {
  SOP: 'sop',
  OPD: 'opd',
} as const

export const POST_SUBMIT_DELAY_MS = 1500
