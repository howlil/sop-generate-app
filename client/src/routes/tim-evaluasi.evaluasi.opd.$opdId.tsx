import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiOPD } from '@/pages/tim-evaluasi/DetailEvaluasiOPD'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/opd/$opdId')({
  validateSearch: (search: Record<string, unknown>) => ({
    sopId: (search.sopId as string) ?? undefined,
  }),
  component: () => <DetailEvaluasiOPD />,
})
