import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiOPD } from '@/pages/evaluator/evaluasi/DetailEvaluasiOPD'
import { RouteErrorPage } from '@/components/ui/route-error'

/** Validasi search tanpa zod — hindari @tanstack/router-zod-adapter yang bermasalah dengan Zod v4. */
function parseEvaluasiDetailSearch(
  raw: Record<string, unknown>,
): { sopId?: string } {
  const sopId = raw.sopId
  return {
    sopId: typeof sopId === 'string' && sopId.length > 0 ? sopId : undefined,
  }
}

export const Route = createFileRoute('/evaluator/evaluasi/$id')({
  validateSearch: parseEvaluasiDetailSearch,
  component: DetailEvaluasiOPDPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function DetailEvaluasiOPDPage() {
  return <DetailEvaluasiOPD />
}
