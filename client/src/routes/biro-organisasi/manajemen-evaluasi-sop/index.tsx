import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSop } from '@/pages/biro-organisasi/manajemen-evaluasi-sop'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop/')({
  component: ManajemenEvaluasiSop,
})
