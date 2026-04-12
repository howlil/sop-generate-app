import { createFileRoute } from '@tanstack/react-router'
import { DetailSOPPenyusun } from '@/pages/tim-penyusun/sop-detail'

export const Route = createFileRoute('/tim-penyusun/sop/$id')({
  component: DetailSOPPenyusun,
})
