import { createFileRoute } from '@tanstack/react-router'
import { ManajemenPeraturan } from '@/pages/tim-penyusun/manajemen-peraturan'

export const Route = createFileRoute('/tim-penyusun/peraturan')({
  component: ManajemenPeraturan,
})
