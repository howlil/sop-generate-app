import { createFileRoute } from '@tanstack/react-router'
import { ManajemenPeraturan } from '@/pages/tim-penyusun/peraturan/ManajemenPeraturan'

export const Route = createFileRoute('/tim-penyusun/peraturan/')({
  component: ManajemenPeraturan,
})
