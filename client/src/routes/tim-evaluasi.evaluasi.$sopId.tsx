import { createFileRoute } from '@tanstack/react-router'
import { EvaluasiSOPPage } from '@/pages/tim-evaluasi/EvaluasiSOPPage'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/$sopId')({
  component: () => <EvaluasiSOPPage />,
})
