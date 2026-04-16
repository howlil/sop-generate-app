import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/tim-evaluasi/evaluasi')({
  component: TimEvaluasiSOPLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function TimEvaluasiSOPLayout() {
  return <Outlet />
}
