import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSop } from '@/pages/biro-organisasi/evaluasi/ManajemenEvaluasiSop'

export const Route = createFileRoute('/biro-organisasi/evaluasi/')({
  component: ManajemenEvaluasiSop,
})
