import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOPEvaluasi } from '@/pages/tim-evaluasi/DaftarSOPEvaluasi'

export const Route = createFileRoute('/tim-evaluasi/penugasan/')({
  component: () => <DaftarSOPEvaluasi />,
})
