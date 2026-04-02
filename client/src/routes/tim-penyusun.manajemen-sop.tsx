import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSOP } from '@/pages/tim-penyusun/ManajemenSOP'
import { RouteErrorPage } from '@/components/ui/route-error'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'

export const Route = createFileRoute('/tim-penyusun/manajemen-sop')({
  component: () => <ManajemenSOP />,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
  pendingComponent: RouteLoadingSkeleton,
})
