import { createFileRoute } from '@tanstack/react-router'
import { EvaluasiOpdLegacyRedirect } from '@/pages/evaluator/evaluasi/EvaluasiOpdLegacyRedirect'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/evaluator/evaluasi/$id')({
  component: EvaluasiOpdLegacyRedirectPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function EvaluasiOpdLegacyRedirectPage() {
  return <EvaluasiOpdLegacyRedirect />
}
