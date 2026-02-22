import { createFileRoute } from '@tanstack/react-router'
import { PelaksanaanEvaluasi } from '@/pages/tim-evaluasi/PelaksanaanEvaluasi'

export const Route = createFileRoute('/tim-evaluasi/pelaksanaan/$id')({
  component: () => <PelaksanaanEvaluasi />,
})
