import { createFileRoute } from '@tanstack/react-router'
import { ValidasiPengesahanPage } from '@/components/pages/validasi/ValidasiPengesahanPage'

export const Route = createFileRoute('/validasi/pengesahan/$id')({
  component: ValidasiPengesahanPage,
})
