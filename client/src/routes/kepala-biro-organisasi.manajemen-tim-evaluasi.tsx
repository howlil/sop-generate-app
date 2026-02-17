import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimEvaluasi } from '@/components/pages/kepala-biro-organisasi/ManajemenTimEvaluasi'

export const Route = createFileRoute('/kepala-biro-organisasi/manajemen-tim-evaluasi')({
  component: ManajemenTimEvaluasiPage,
})

function ManajemenTimEvaluasiPage() {
  return <ManajemenTimEvaluasi />
}
