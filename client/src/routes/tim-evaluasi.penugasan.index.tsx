import { createFileRoute } from '@tanstack/react-router'
import { PenugasanEvaluasi } from '@/components/pages/tim-evaluasi/PenugasanEvaluasi'

export const Route = createFileRoute('/tim-evaluasi/penugasan/')({
  component: () => <PenugasanEvaluasi />,
})
