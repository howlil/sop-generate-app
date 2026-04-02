/**
 * Role-based utilities
 */

import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/utils/constants'
import type { RoleKey } from '@/types/common'

/**
 * Get OPD ID for Kepala OPD role
 */
export function getKepalaOPDOpdId(): string {
  const user = useAuthStore.getState().user
  return user?.opdId ?? ''
}

/**
 * Get user NIP
 */
export function getRoleNip(): string {
  const user = useAuthStore.getState().user
  return user?.nip ?? ''
}

/**
 * Get user name for role display (legacy compatibility)
 */
export function getRoleUserName(_role: string): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? ''
}

/**
 * Get user display name
 */
export function getRoleDisplayName(): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? 'User'
}

/**
 * Get current user role (simplified for UI compatibility)
 */
export function getRole(): { peran: string; opdId?: string | null } | null {
  const user = useAuthStore.getState().user
  return user ? { peran: user.peran, opdId: user.opdId } : null
}

/**
 * Route guard: requires authentication before load
 */
export function requireAuthBeforeLoad() {
  return ({ location }: { location: { href: string } }) => {
    const user = getRole()

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
    }
  }
}

/**
 * Route guard: requires specific role before load
 */
export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return ({ location }: { location: { href: string } }) => {
    const user = getRole()

    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    if (user.peran !== requiredRole) {
      throw redirect({
        to: ROUTES.HOME,
        search: {
          denied: requiredRole,
          redirect: location.href,
        },
      })
    }
  }
}
