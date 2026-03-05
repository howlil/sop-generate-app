import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/biro-organisasi/')({
  component: BiroOrganisasiIndex,
})

function BiroOrganisasiIndex() {
  return <Navigate to={ROUTES.BIRO_ORGANISASI.OPD} />
}
