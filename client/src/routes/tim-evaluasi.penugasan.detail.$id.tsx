import { createFileRoute } from '@tanstack/react-router'
import { DetailPenugasanTimEvaluasi } from '@/pages/tim-evaluasi/DetailPenugasanTimEvaluasi'

export const Route = createFileRoute('/tim-evaluasi/penugasan/detail/$id')({
  component: () => <DetailPenugasanTimEvaluasi />,
})
