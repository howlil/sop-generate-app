/**
 * Evaluasi domain logic
 */

/** Status hasil evaluasi yang tersedia */
export const STATUS_HASIL_EVALUASI = {
  SESUAI: 'Sesuai',
  REVISI_BIRO: 'Revisi Biro',
} as const

export type StatusHasilEvaluasi =
  | typeof STATUS_HASIL_EVALUASI.SESUAI
  | typeof STATUS_HASIL_EVALUASI.REVISI_BIRO

export interface StatusHasilEvaluasiForm {
  status: StatusHasilEvaluasi | null
  komentar: string
}

/**
 * Check if evaluasi form is complete
 */
export function isFormEvaluasiSopComplete(
  status: StatusHasilEvaluasi | null,
  komentar: string
): boolean {
  return !!status && komentar.trim().length > 0
}

/**
 * Get new SOP status after evaluasi based on hasil evaluasi
 */
export function getStatusSopAfterEvaluasi(
  status: StatusHasilEvaluasi
): string {
  switch (status) {
    case STATUS_HASIL_EVALUASI.SESUAI:
      return 'Siap Diverifikasi'
    case STATUS_HASIL_EVALUASI.REVISI_BIRO:
      return 'Revisi dari Tim Evaluasi'
    default:
      return 'Sedang Dievaluasi'
  }
}
