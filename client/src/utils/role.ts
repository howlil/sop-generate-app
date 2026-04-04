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
 * Route guard: requires specific role before load
 */
export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return ({ location }: { location: { href: string } }) => {
    const user = useAuthStore.getState().user

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
