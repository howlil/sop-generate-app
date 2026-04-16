import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiOPD } from '@/pages/tim-evaluasi/$id'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/$id')({
  validateSearch: (search: Record<string, unknown>) => ({
    sopId: (search.sopId as string) ?? undefined,
  }),
  component: DetailEvaluasiOPDPage,
})

function DetailEvaluasiOPDPage() {
  return <DetailEvaluasiOPD />
}
