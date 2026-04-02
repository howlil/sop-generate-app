import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants/ui'

export const Route = createFileRoute('/tim-evaluasi/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_EVALUASI.EVALUASI })
  },
  component: () => null,
})
