/**
 * StatusBadge domain identifiers — must match keys in StatusBadge component's color map.
 */

export const STATUS_DOMAIN = {
  SOP: 'sop',
  EVALUASI_BIRO: 'evaluasi-biro',
  PENUGASAN_EVALUASI: 'penugasan-evaluasi',
  TIM_PENYUSUN: 'tim-penyusun',
} as const

export type StatusDomain = (typeof STATUS_DOMAIN)[keyof typeof STATUS_DOMAIN]
