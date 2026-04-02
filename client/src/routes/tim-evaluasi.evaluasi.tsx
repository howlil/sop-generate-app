import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouteErrorPage } from '@/components/ui/route-error'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'

export const Route = createFileRoute('/tim-evaluasi/evaluasi')({
  component: () => <Outlet />,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
  pendingComponent: RouteLoadingSkeleton,
})
