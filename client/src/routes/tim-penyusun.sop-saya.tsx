import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/tim-penyusun/sop-saya')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP })
  },
  component: () => null,
})
