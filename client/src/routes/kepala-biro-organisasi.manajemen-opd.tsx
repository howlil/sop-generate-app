import { createFileRoute } from '@tanstack/react-router'
import { ManajemenOPD } from '@/components/pages/kepala-biro-organisasi/ManajemenOPD'

export const Route = createFileRoute('/kepala-biro-organisasi/manajemen-opd')({
  component: ManajemenOPDPage,
})

function ManajemenOPDPage() {
  return <ManajemenOPD />
}
