/**
 * Authentication guard for protected routes
 * Redirects unauthenticated users to login page
 */

import { redirect } from '@tanstack/react-router'
import { getRole } from '@/stores/authStore'

type BeforeLoadLocation = { href: string }

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
