import { createFileRoute } from '@tanstack/react-router'
import { ManajemenEvaluasiSOP } from '@/components/pages/kepala-biro-organisasi/ManajemenEvaluasiSOP'

export const Route = createFileRoute('/kepala-biro-organisasi/manajemen-evaluasi-sop/')({
  component: ManajemenEvaluasiSOPPage,
})

function ManajemenEvaluasiSOPPage() {
  return <ManajemenEvaluasiSOP />
}
