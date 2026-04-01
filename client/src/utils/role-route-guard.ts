/**
 * Role-based route guard
 */

import { redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'
import type { RoleKey } from '@/utils/constants'
import { getRole } from '@/stores/authStore'

type BeforeLoadLocation = { href: string }

export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return ({ location }: { location: BeforeLoadLocation }) => {
    const activeRole = getRole()?.peran as RoleKey | undefined

    if (activeRole !== requiredRole) {
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
