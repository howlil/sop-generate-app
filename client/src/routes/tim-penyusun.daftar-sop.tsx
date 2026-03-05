import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOP } from '@/pages/kepala-opd/DaftarSOP'

export const Route = createFileRoute('/tim-penyusun/daftar-sop')({
  component: () => <DaftarSOP />,
})
