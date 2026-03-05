/**
 * Konstanta untuk modul evaluasi SOP (Tim Evaluasi, workspace per OPD).
 */

export const EVALUASI_STORAGE_KEY = 'evaluasi_last_by'

/** Opsi filter status di workspace evaluasi (tampilan: Diajukan / Sedang / Selesai). */
export const EVALUASI_DISPLAY_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Diajukan Evaluasi', label: 'Diajukan Evaluasi' },
  { value: 'Sedang Dievaluasi', label: 'Sedang Dievaluasi' },
  { value: 'Selesai Evaluasi', label: 'Selesai Evaluasi' },
] as const

/** Status hasil evaluasi (form): value → label status SOP setelah dikirim. */
export const STATUS_HASIL_EVALUASI = {
  Sesuai: 'Dievaluasi Tim Evaluasi',
  'Revisi Biro': 'Revisi dari Tim Evaluasi',
} as const

export type StatusHasilEvaluasiForm = keyof typeof STATUS_HASIL_EVALUASI
