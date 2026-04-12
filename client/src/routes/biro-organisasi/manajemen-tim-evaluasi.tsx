import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimEvaluasi } from '@/pages/biro-organisasi/manajemen-tim-evaluasi'

export const Route = createFileRoute('/biro-organisasi/manajemen-tim-evaluasi')({
  component: ManajemenTimEvaluasiPage,
})

function ManajemenTimEvaluasiPage() {
  return <ManajemenTimEvaluasi />
}
