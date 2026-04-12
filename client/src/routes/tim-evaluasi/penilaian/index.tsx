import { createFileRoute } from '@tanstack/react-router'
import { DaftarSOPEvaluasi } from '@/pages/tim-evaluasi/penilaian'

export const Route = createFileRoute('/tim-evaluasi/penilaian/')({
  component: () => <DaftarSOPEvaluasi />,
})
