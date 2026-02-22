import { createFileRoute } from '@tanstack/react-router'
import { VerifikasiTTDBerhasilPage } from '@/pages/validasi/VerifikasiTTDBerhasilPage'

export const Route = createFileRoute('/validasi/ttd/berhasil')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search?.token === 'string' ? search.token : '',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  return <VerifikasiTTDBerhasilPage token={token} />
}
