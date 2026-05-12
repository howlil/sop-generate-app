import { createFileRoute, redirect } from '@tanstack/react-router'
import { redirectArgsFromAppPath } from '@/utils/role-routing'

export const Route = createFileRoute('/penyusun/koordinator/tte/')({
  beforeLoad: ({ location }) => {
    const nextPath =
      location.pathname.replace(/^\/penyusun\/koordinator(\/|$)/, '/penyusun/pj-penyusun$1') ||
      '/penyusun/pj-penyusun/'
    const next = `${nextPath}${location.search}${location.hash ?? ''}`
    throw redirect(redirectArgsFromAppPath(next))
  },
})
