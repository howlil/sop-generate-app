/**
 * Domain helpers untuk role check — fungsi murni, tidak akses store.
 */
import { ROLES, ROLE_LABELS, type RoleKey } from '@/lib/constants/roles'

export function getRoleLabel(role: RoleKey): string {
  return ROLE_LABELS[role] ?? role
}

export function isBiroOrganisasi(role: RoleKey | null): boolean {
  return role === ROLES.BIRO_ORGANISASI
}

export function isKepalaOPD(role: RoleKey | null): boolean {
  return role === ROLES.KEPALA_OPD
}

export function isTimEvaluasi(role: RoleKey | null): boolean {
  return role === ROLES.TIM_EVALUASI
}

export function isTimPenyusun(role: RoleKey | null): boolean {
  return role === ROLES.TIM_PENYUSUN
}
