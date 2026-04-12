import { createFileRoute } from '@tanstack/react-router'
import { DetailPengajuanEvaluasi } from '@/pages/biro-organisasi/evaluasi/detail-evaluasi-sop'

export const Route = createFileRoute(
  '/biro-organisasi/evaluasi/$id'
)({
  component: DetailPengajuanEvaluasiPage,
})

function DetailPengajuanEvaluasiPage() {
  return <DetailPengajuanEvaluasi />
}
