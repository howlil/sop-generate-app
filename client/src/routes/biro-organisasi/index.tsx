import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'

export const Route = createFileRoute('/biro-organisasi/')({
  component: BiroOrganisasiIndex,
})

function BiroOrganisasiIndex() {
  return <Navigate to={ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI} />
}
