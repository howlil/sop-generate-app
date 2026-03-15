import { redirect } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'
import type { RoleKey } from '@/lib/constants/roles'
import { getRole } from '@/lib/stores/app-store'

type BeforeLoadLocation = { href: string }


export function requireRoleBeforeLoad(requiredRole: RoleKey) {
  return ({ location }: { location: BeforeLoadLocation }) => {
    const activeRole = getRole()

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
