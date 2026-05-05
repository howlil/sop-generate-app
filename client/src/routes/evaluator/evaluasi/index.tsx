import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOPEvaluasi } from '@/pages/evaluator/evaluasi/DaftarSOPEvaluasi'

export const Route = createFileRoute('/evaluator/evaluasi/')({
  component: DaftarSOPEvaluasi,
})
