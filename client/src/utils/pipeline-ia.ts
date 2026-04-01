/**
 * Pipeline notification constants
 */

export const IA = {
  PIPELINE: 'pipeline',
  EVALUASI: 'evaluasi',
  TTE: 'tte',
} as const

export type IAKey = typeof IA[keyof typeof IA]
