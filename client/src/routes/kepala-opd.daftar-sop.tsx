import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOP } from '@/components/pages/kepala-opd/DaftarSOP'

export const Route = createFileRoute('/kepala-opd/daftar-sop')({
  component: () => <DaftarSOP />,
})
