import { createFileRoute } from '@tanstack/react-router'
import { ManajemenOPD } from '@/pages/kepala-biro-organisasi/ManajemenOPD'

export const Route = createFileRoute('/biro-organisasi/manajemen-opd')({
  component: ManajemenOPDPage,
})

function ManajemenOPDPage() {
  return <ManajemenOPD />
}
