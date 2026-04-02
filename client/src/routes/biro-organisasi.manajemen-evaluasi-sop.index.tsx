import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSop } from '@/pages/kepala-biro-organisasi/ManajemenEvaluasiSop'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop/')({
  component: ManajemenEvaluasiSop,
})
