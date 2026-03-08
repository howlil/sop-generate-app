/**
 * Global role constants — single source of truth for role keys and labels.
 *
 * ROLES       → kebab-case identifiers used in routing, stores, and auth
 * ROLE_LABELS → human-readable labels (Bahasa Indonesia) for UI display
 */

export const ROLES = {
  KEPALA_OPD: 'kepala-opd',
  BIRO_ORGANISASI: 'biro-organisasi',
  TIM_EVALUASI: 'tim-evaluasi',
  TIM_PENYUSUN: 'tim-penyusun',
} as const

export type RoleKey = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<RoleKey, string> = {
  [ROLES.KEPALA_OPD]: 'Kepala OPD',
  [ROLES.BIRO_ORGANISASI]: 'Biro Organisasi',
  [ROLES.TIM_EVALUASI]: 'Tim Evaluasi',
  [ROLES.TIM_PENYUSUN]: 'Tim Penyusun',
}

/** Roles that appear in komentar panels. */
export const KOMENTAR_ROLES = [
  ROLE_LABELS[ROLES.KEPALA_OPD],
  ROLE_LABELS[ROLES.TIM_EVALUASI],
  ROLE_LABELS[ROLES.TIM_PENYUSUN],
] as const

export type KomentarRoleLabel = (typeof KOMENTAR_ROLES)[number]
