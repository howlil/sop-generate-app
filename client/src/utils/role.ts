/**
 * Role-based utilities
 * Consolidated role display and route guard functions
 */

import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { CONSTANTS, routePathPrefixForMatch, type RoleKey } from '@/utils/constants'
const { ROUTES } = CONSTANTS

/**
 * Get OPD ID for Kepala OPD role
 */
export function getKepalaOPDOpdId(): string {
  const user = useAuthStore.getState().user
  return user?.opdId ?? ''
}

/**
 * Get user name for role display (legacy, use getRoleDisplayName)
 * @deprecated Use getRoleDisplayName instead
 */
export function getRoleUserName(_role: string): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? ''
}

/**
 * Get user NIP
 */
export function getRoleNip(): string {
  const user = useAuthStore.getState().user
  return user?.nip ?? ''
}

/**
 * Get user display name
 */
export function getRoleDisplayName(): string {
  const user = useAuthStore.getState().user
  return user?.nama ?? 'User'
}

/**
 * Get current user role
 */
export function getRole(): { peran: RoleKey; opdId?: string | null } | null {
  return useAuthStore.getState().user
}

type BeforeLoadLocation = { href: string }

/**
 * Route guard: requires authentication before load
 */
export function requireAuthBeforeLoad() {
  return ({ location }: { location: BeforeLoadLocation }) => {
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
  return ({ location }: { location: BeforeLoadLocation }) => {
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
