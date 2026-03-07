/**
 * Hook akses role & helpers — satu titik akses untuk UI.
 * Menggantikan import langsung dari app-store (kecuali route guard yang boleh tetap pakai getter sync).
 * Data tampilan role (NIP, nama) diambil via lib/data/role-display, bukan seed langsung.
 */
import { useAppStore } from '@/lib/stores/app-store'
import { ROLES, ROLE_LABELS } from '@/lib/constants/roles'
import { getRoleNip as getRoleNipFromData, getRoleDisplayName as getRoleDisplayNameFromData, getRoleUserName as getRoleUserNameFromData } from '@/lib/data/role-display'
import type { RoleKey } from '@/lib/constants/roles'

export { ROLES }

export function useAppRole() {
  const role = useAppStore((s) => s.role)
  const setRole = useAppStore((s) => s.setRole)
  const clearRole = useAppStore((s) => s.clearRole)

  const getRoleLabel = (r: RoleKey) => ROLE_LABELS[r] ?? r
  const getRoleNip = (r: RoleKey) => getRoleNipFromData(r)
  const getRoleDisplayName = (r: RoleKey) => getRoleDisplayNameFromData(r)
  const getRoleUserName = (r: RoleKey) => getRoleUserNameFromData(r)

  return {
    role,
    setRole,
    clearRole,
    getRoleLabel,
    getRoleNip,
    getRoleDisplayName,
    getRoleUserName,
    isBiroOrganisasi: role === ROLES.BIRO_ORGANISASI,
    isKepalaOPD: role === ROLES.KEPALA_OPD,
    isTimEvaluasi: role === ROLES.TIM_EVALUASI,
    isTimPenyusun: role === ROLES.TIM_PENYUSUN,
    ROLES,
  }
}
