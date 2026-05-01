import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOPEvaluasi } from '@/pages/tim-evaluasi/evaluasi/DaftarSOPEvaluasi'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/')({
  component: DaftarSOPEvaluasi,
})
