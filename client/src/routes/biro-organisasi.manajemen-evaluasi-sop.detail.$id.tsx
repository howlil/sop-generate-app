import { createFileRoute } from '@tanstack/react-router'
import { DetailPenugasanEvaluasi } from '@/pages/kepala-biro-organisasi/DetailPenugasanEvaluasi'

export const Route = createFileRoute(
  '/biro-organisasi/manajemen-evaluasi-sop/detail/$id'
)({
  component: DetailPenugasanPage,
})

function DetailPenugasanPage() {
  return <DetailPenugasanEvaluasi />
}
