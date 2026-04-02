import { createFileRoute } from '@tanstack/react-router'
import { EvaluasiSOPPage } from '@/pages/tim-evaluasi/EvaluasiSop'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/$sopId')({
  component: EvaluasiSOPPage,
})
