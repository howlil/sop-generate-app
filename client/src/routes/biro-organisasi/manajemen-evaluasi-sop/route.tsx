import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop')({
  component: ManajemenEvaluasiSOPLayout,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function ManajemenEvaluasiSOPLayout() {
  return <Outlet />
}
