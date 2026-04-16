import { createFileRoute, redirect } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'

export const Route = createFileRoute('/tim-penyusun/')({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.TIM_PENYUSUN.SOP })
  },
  component: RedirectPlaceholder,
})

function RedirectPlaceholder() {
  return null
}
