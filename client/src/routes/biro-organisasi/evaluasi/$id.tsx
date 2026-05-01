import { createFileRoute } from '@tanstack/react-router'
import { DetailPengajuanEvaluasi } from '@/pages/biro-organisasi/evaluasi/DetailPengajuanEvaluasi'
import { RouteErrorPage } from '@/components/ui/route-error'

export const Route = createFileRoute('/biro-organisasi/evaluasi/$id')({
  component: DetailPengajuanEvaluasiPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorPage error={error} reset={reset} />
  ),
})

function DetailPengajuanEvaluasiPage() {
  return <DetailPengajuanEvaluasi />
}
