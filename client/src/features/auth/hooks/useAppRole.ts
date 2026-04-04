/**
 * Hook akses role & helpers — satu titik akses untuk UI.
 * Uses Zustand selectors with shallow comparison for optimal performance.
 * Now includes permission-based access control helpers.
 */
import { useAuthStore } from '@/stores/authStore'
import { ROLES, ROLE_LABELS } from '@/utils/constants'
import {
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/utils/role'
import type { RoleKey, PermissionKey } from '@/types/common'

export { ROLES, PERMISSIONS }
export type { PermissionKey }

export function useAppRole() {
  const user = useAuthStore((state) => state.user)
  const role = user?.peran as RoleKey | undefined

  const setRole = (newRole: RoleKey) => {
    if (user) {
      useAuthStore.getState().setUser({ ...user, peran: newRole as string })
    }
  }

  const clearRole = () => {
    useAuthStore.getState().setUser(null)
  }

  const getRoleLabel = (r: RoleKey) => ROLE_LABELS[r] ?? r
  const getRoleNip = () => user?.nip ?? ''
  const getRoleUserName = () => user?.nama ?? ''
  const getRoleDisplayName = () => user?.nama ?? ''

  // Get user's permission level
  const roleLevel = role ? ROLE_HIERARCHY[role] || 0 : 0
  const userPermissions = role ? ROLE_PERMISSIONS[role] || [] : []

  // Permission check helpers
  const can = (permission: PermissionKey) => userPermissions.includes(permission)
  const canAny = (permissions: PermissionKey[]) => permissions.some(p => userPermissions.includes(p))
  const canAll = (permissions: PermissionKey[]) => permissions.every(p => userPermissions.includes(p))

  // Role level check
  const hasMinLevel = (minLevel: number) => roleLevel >= minLevel

  return {
    role,
    user,
    setRole,
    clearRole,
    getRoleLabel,
    getRoleNip,
    getRoleUserName,
    getRoleDisplayName,
    isBiroOrganisasi: role === ROLES.BIRO_ORGANISASI,
    isKepalaOPD: role === ROLES.KEPALA_OPD,
    isTimEvaluasi: role === ROLES.TIM_EVALUASI,
    isTimPenyusun: role === ROLES.TIM_PENYUSUN,
    isKoordinator: role === 'KOORDINATOR_TIM_PENYUSUN',
    // Permission-based helpers
    permissions: userPermissions,
    roleLevel,
    can,
    canAny,
    canAll,
    hasMinLevel,
    // Legacy global permission check (for non-component use)
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
