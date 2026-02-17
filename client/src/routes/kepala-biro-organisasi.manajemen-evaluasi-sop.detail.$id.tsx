import { createFileRoute } from '@tanstack/react-router'
import { DetailPenugasanEvaluasi } from '@/components/pages/kepala-biro-organisasi/DetailPenugasanEvaluasi'

export const Route = createFileRoute(
  '/kepala-biro-organisasi/manajemen-evaluasi-sop/detail/$id'
)({
  component: DetailPenugasanPage,
})

function DetailPenugasanPage() {
  return <DetailPenugasanEvaluasi />
}
