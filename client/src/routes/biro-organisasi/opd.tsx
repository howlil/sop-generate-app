import { createFileRoute } from '@tanstack/react-router'
import { ManajemenOPD } from '@/pages/biro-organisasi/opd'

export const Route = createFileRoute('/biro-organisasi/opd')({
  component: ManajemenOPDPage,
})

function ManajemenOPDPage() {
  return <ManajemenOPD />
}
