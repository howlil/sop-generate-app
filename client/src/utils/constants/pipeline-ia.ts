/**
 * Pipeline IA constants
 */

export const IA = {
  PIPELINE: 'pipeline',
  EVALUASI: 'evaluasi',
  TTE: 'tte',
  NAV_BIRO_EVALUASI_TERJADWAL: 'Evaluasi Terjadwal',
} as const

export type IAKey = typeof IA[keyof typeof IA]
