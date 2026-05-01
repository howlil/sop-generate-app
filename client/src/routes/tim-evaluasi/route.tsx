import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RouteErrorPage } from '@/components/ui/route-error'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: requireRoles(['TIM_EVALUASI']),
  component: DashboardLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})
