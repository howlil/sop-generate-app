/**
 * Role-based route guard
 * Checks authentication first, then validates role match
 */

import { redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'
import type { RoleKey } from '@/utils/constants'
import { getRole } from '@/stores/authStore'

type BeforeLoadLocation = { href: string }

export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return ({ location }: { location: BeforeLoadLocation }) => {
    const user = getRole()

    // [P0] First check if user is authenticated
    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    // Then check role
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
