import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'

export const Route = createFileRoute('/tim-evaluasi/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_EVALUASI.EVALUASI })
  },
  component: RedirectPlaceholder,
})

function RedirectPlaceholder() {
  return null
}
