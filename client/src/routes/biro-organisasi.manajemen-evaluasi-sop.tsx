import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouteErrorPage } from '@/components/ui/route-error'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop')({
  component: ManajemenEvaluasiSOPLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
  pendingComponent: RouteLoadingSkeleton,
})

function ManajemenEvaluasiSOPLayout() {
  return <Outlet />
}
