import { createFileRoute, redirect } from '@tanstack/react-router'
import { redirectArgsFromAppPath } from '@/utils/role-routing'

/**
 * Bookmark lama `/penyusun/koordinator/*` → `/penyusun/pj-penyusun/*` (path + query + hash dipertahankan).
 */
export const Route = createFileRoute('/penyusun/koordinator/berita-acara/')({
  beforeLoad: ({ location }) => {
    const nextPath =
      location.pathname.replace(/^\/penyusun\/koordinator(\/|$)/, '/penyusun/pj-penyusun$1') ||
      '/penyusun/pj-penyusun/'
    const next = `${nextPath}${location.search}${location.hash ?? ''}`
    throw redirect(redirectArgsFromAppPath(next))
  },
})
