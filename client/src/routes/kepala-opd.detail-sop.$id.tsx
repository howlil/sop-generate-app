import { createFileRoute } from '@tanstack/react-router'
import { DetailSOP } from '@/pages/kepala-opd/DetailSOP'

export const Route = createFileRoute('/kepala-opd/detail-sop/$id')({
  component: () => <DetailSOP />,
})
