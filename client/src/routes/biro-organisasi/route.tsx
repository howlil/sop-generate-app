import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { RouteErrorPage } from '@/components/ui/route-error'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/biro-organisasi')({
  beforeLoad: requireRoles(['BIRO_ORGANISASI']),
  component: DashboardLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})
