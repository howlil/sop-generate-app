/**
 * Hook akses role & helpers — satu titik akses untuk UI.
 * Uses Zustand selectors with shallow comparison for optimal performance.
 */
import { useAuthStore } from '@/stores/authStore'
import { ROLES, ROLE_LABELS } from '@/utils/constants'
import { shallow } from 'zustand/shallow'
import type { RoleKey } from '@/types/common'

export { ROLES }

export function useAppRole() {
  // Use selector with shallow comparison for optimal performance
  const user = useAuthStore((state) => state.user, shallow)
  const role = user?.peran as RoleKey | undefined

  const setRole = (newRole: RoleKey) => {
    if (user) {
      useAuthStore.getState().setUser({ ...user, peran: newRole })
    }
  }

  const clearRole = () => {
    useAuthStore.getState().setUser(null)
  }

  const getRoleLabel = (r: RoleKey) => ROLE_LABELS[r] ?? r
  const getRoleNip = () => user?.nip ?? ''
  const getRoleDisplayName = () => user?.nama ?? ''

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
  }
}
