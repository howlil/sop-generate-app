import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSOP } from '@/pages/tim-penyusun/manajemen-sop'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/tim-penyusun/manajemen-sop')({
  component: () => <ManajemenSOP />,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})
