import { createFileRoute } from '@tanstack/react-router'
import { ManajemenOPD } from '@/pages/biro-organisasi/manajemen-opd'

export const Route = createFileRoute('/biro-organisasi/manajemen-opd')({
  component: ManajemenOPDPage,
})

function ManajemenOPDPage() {
  return <ManajemenOPD />
}
