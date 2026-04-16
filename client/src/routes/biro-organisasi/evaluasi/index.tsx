import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSop } from '@/pages/biro-organisasi/evaluasi'

export const Route = createFileRoute('/biro-organisasi/evaluasi/')({
  component: ManajemenEvaluasiSopPage,
})

function ManajemenEvaluasiSopPage() {
  return <ManajemenEvaluasiSop />
}
