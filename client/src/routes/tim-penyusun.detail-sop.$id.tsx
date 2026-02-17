import { createFileRoute } from '@tanstack/react-router'
import { DetailSOPPenyusun } from '@/components/pages/tim-penyusun/DetailSOPPenyusun'

export const Route = createFileRoute('/tim-penyusun/detail-sop/$id')({
  component: () => <DetailSOPPenyusun />,
})
