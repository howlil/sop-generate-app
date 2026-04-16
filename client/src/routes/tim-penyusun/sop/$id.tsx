import { createFileRoute } from '@tanstack/react-router'
import { DetailSOPPenyusun } from '@/pages/tim-penyusun/sop/$id'

export const Route = createFileRoute('/tim-penyusun/sop/$id')({
  component: DetailSOPPenyusun,
})
