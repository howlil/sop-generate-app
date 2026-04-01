/**
 * Hook akses role & helpers — satu titik akses untuk UI.
 * Updated to use new auth store
 */
import { useAuthStore } from '@/stores/authStore'
import { ROLES, ROLE_LABELS } from '@/utils/constants'
import type { RoleKey } from '@/utils/constants'

export { ROLES }

export function useAppRole() {
  const user = useAuthStore((s) => s.user)
  const role = user?.peran as RoleKey | undefined
  const setUser = useAuthStore((s) => s.setUser)

  const setRole = (newRole: RoleKey) => {
    if (user) {
      setUser({ ...user, peran: newRole })
    }
  }

  const clearRole = () => {
    setUser(null)
  }

  const getRoleLabel = (r: RoleKey) => ROLE_LABELS[r] ?? r
  const getRoleNip = (_r: RoleKey) => user?.nip ?? ''
  const getRoleDisplayName = (_r: RoleKey) => user?.nama ?? ''

  return {
    role,
    setRole,
    clearRole,
    getRoleLabel,
    getRoleNip,
    getRoleDisplayName,
    isBiroOrganisasi: role === ROLES.BIRO_ORGANISASI,
    isKepalaOPD: role === ROLES.KEPALA_OPD,
    isTimEvaluasi: role === ROLES.TIM_EVALUASI,
    isTimPenyusun: role === ROLES.TIM_PENYUSUN,
    ROLES,
  }
}
