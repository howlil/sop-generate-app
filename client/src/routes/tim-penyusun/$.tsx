import { createFileRoute, redirect } from '@tanstack/react-router'
import { redirectArgsFromAppPath } from '@/utils/role-routing'

/**
 * Bookmark lama /tim-penyusun/* → /penyusun/* (path + query + hash dipertahankan).
 */
export const Route = createFileRoute('/tim-penyusun/$')({
  beforeLoad: ({ location }) => {
    const nextPath =
      location.pathname.replace(/^\/tim-penyusun(\/|$)/, '/penyusun$1') || '/penyusun/'
    const next = `${nextPath}${location.search}${location.hash ?? ''}`
    throw redirect(redirectArgsFromAppPath(next))
  },
})
