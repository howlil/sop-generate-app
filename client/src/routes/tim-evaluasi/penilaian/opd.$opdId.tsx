import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiOPD } from '@/pages/tim-evaluasi/penilaian/opd'

export const Route = createFileRoute('/tim-evaluasi/penilaian/opd/$opdId')({
  validateSearch: (search: Record<string, unknown>) => ({
    sopId: (search.sopId as string) ?? undefined,
  }),
  component: () => <DetailEvaluasiOPD />,
})
