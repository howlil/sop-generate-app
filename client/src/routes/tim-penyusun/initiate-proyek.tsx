import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'

/** Redirect ke Manajemen SOP; form Buat SOP sekarang dibuka via dialog di halaman tersebut. */
export const Route = createFileRoute('/tim-penyusun/initiate-proyek')({
  component: () => <Navigate to={ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP} />,
})
