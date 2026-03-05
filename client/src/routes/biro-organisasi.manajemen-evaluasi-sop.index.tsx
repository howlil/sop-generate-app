import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSOP } from '@/pages/kepala-biro-organisasi/ManajemenEvaluasiSOP'

export const Route = createFileRoute('/biro-organisasi/manajemen-evaluasi-sop/')({
  component: ManajemenEvaluasiSOPPage,
})

function ManajemenEvaluasiSOPPage() {
  return <ManajemenEvaluasiSOP />
}
