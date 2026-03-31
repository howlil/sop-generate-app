import { createFileRoute } from '@tanstack/react-router'
import { DetailPengajuanEvaluasi } from '@/pages/kepala-biro-organisasi/DetailPengajuanEvaluasi'

export const Route = createFileRoute(
  '/biro-organisasi/manajemen-evaluasi-sop/detail/$id'
)({
  component: DetailPengajuanEvaluasiPage,
})

function DetailPengajuanEvaluasiPage() {
  return <DetailPengajuanEvaluasi />
}
