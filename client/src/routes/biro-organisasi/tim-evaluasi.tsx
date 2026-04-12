import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimEvaluasi } from '@/pages/biro-organisasi/tim-evaluasi'

export const Route = createFileRoute('/biro-organisasi/tim-evaluasi')({
  component: ManajemenTimEvaluasiPage,
})

function ManajemenTimEvaluasiPage() {
  return <ManajemenTimEvaluasi />
}
