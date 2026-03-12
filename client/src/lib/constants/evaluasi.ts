/**
 * Konstanta UI untuk modul evaluasi SOP (Tim Evaluasi, workspace per OPD).
 * Business mapping (STATUS_HASIL_EVALUASI) ada di lib/domain/evaluasi.
 */

export const EVALUASI_STORAGE_KEY = 'evaluasi_last_by'

/** Opsi filter status di workspace evaluasi (tampilan: Diajukan / Sedang / Selesai). */
export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Diajukan Evaluasi', label: 'Diajukan Evaluasi' },
  { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
  { value: 'Selesai Evaluasi', label: 'Selesai Evaluasi' },
] as const
