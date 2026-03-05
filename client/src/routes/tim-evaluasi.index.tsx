import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/lib/constants/routes'

export const Route = createFileRoute('/tim-evaluasi/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_EVALUASI.PENUGASAN })
  },
  component: () => null,
})
