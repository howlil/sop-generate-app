import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop/buat')({
  component: BuatPenugasanRedirect,
})

function BuatPenugasanRedirect() {
  return <Navigate to={ROUTES.BIRO_ORGANISASI.EVALUASI_SOP} />
}
