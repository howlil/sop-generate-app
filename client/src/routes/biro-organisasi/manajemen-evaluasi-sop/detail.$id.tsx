import { createFileRoute } from '@tanstack/react-router'
import { DetailPengajuanEvaluasi } from '@/pages/biro-organisasi/manajemen-evaluasi-sop/detail-evaluasi-sop'

export const Route = createFileRoute(
  '/biro-organisasi/manajemen-evaluasi-sop/detail/$id'
)({
  component: DetailPengajuanEvaluasiPage,
})

function DetailPengajuanEvaluasiPage() {
  return <DetailPengajuanEvaluasi />
}
