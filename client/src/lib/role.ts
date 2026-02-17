/**
 * Role untuk akses route. Hanya Kepala Biro Organisasi yang boleh akses
 * route /kepala-biro-organisasi/*. Nanti bisa diganti dengan auth/context.
 */
export const ROLES = {
  KEPALA_OPD: 'kepala-opd',
  KEPALA_BIRO_ORGANISASI: 'kepala-biro-organisasi',
  TIM_EVALUASI: 'tim-evaluasi',
  TIM_PENYUSUN: 'tim-penyusun',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

const ROLE_STORAGE_KEY = 'biro-organisasi-role'

export function getRole(): Role | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(ROLE_STORAGE_KEY)
  if (v && Object.values(ROLES).includes(v as Role)) return v as Role
  return null
}

export function setRole(role: Role): void {
  localStorage.setItem(ROLE_STORAGE_KEY, role)
}

export function clearRole(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ROLE_STORAGE_KEY)
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    [ROLES.KEPALA_OPD]: 'Kepala OPD',
    [ROLES.KEPALA_BIRO_ORGANISASI]: 'Kepala Biro Organisasi',
    [ROLES.TIM_EVALUASI]: 'Tim Evaluasi',
    [ROLES.TIM_PENYUSUN]: 'Tim Penyusun',
  }
  return labels[role] ?? role
}

/** NIP dummy per aktor, sampai terhubung ke data user/auth sebenarnya. */
export function getRoleNip(role: Role): string {
  const nips: Record<Role, string> = {
    [ROLES.KEPALA_OPD]: '197001011990031001',
    [ROLES.KEPALA_BIRO_ORGANISASI]: '196512311988021002',
    [ROLES.TIM_EVALUASI]: '198003051999031003',
    [ROLES.TIM_PENYUSUN]: '198512152010121004',
  }
  return nips[role] ?? '-'
}

export function isKepalaBiroOrganisasi(): boolean {
  return getRole() === ROLES.KEPALA_BIRO_ORGANISASI
}

export function isKepalaOPD(): boolean {
  return getRole() === ROLES.KEPALA_OPD
}

export function isTimEvaluasi(): boolean {
  return getRole() === ROLES.TIM_EVALUASI
}

export function isTimPenyusun(): boolean {
  return getRole() === ROLES.TIM_PENYUSUN
}
