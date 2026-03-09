import { createFileRoute } from '@tanstack/react-router'
import { DetailVerifikasiBatch } from '@/pages/kepala-biro-organisasi/DetailVerifikasiBatch'

export const Route = createFileRoute(
  '/biro-organisasi/manajemen-evaluasi-sop/detail/$id'
)({
  component: DetailVerifikasiBatchPage,
})

function DetailVerifikasiBatchPage() {
  return <DetailVerifikasiBatch />
}
