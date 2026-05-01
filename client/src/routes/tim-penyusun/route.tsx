import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RouteErrorPage } from '@/components/ui/route-error'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoles(['TIM_PENYUSUN', 'KOORDINATOR_TIM_PENYUSUN']),
  component: DashboardLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})
