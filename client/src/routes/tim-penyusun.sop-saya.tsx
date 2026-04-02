import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants/ui'

export const Route = createFileRoute('/tim-penyusun/sop-saya')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP })
  },
  component: () => null,
})
