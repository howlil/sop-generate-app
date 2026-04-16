import { createFileRoute } from '@tanstack/react-router'
import { ManajemenSOP } from '@/pages/tim-penyusun/sop'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/tim-penyusun/sop/')({
  component: ManajemenSOPPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function ManajemenSOPPage() {
  return <ManajemenSOP />
}
