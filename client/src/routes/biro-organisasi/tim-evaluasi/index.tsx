import { createFileRoute } from '@tanstack/react-router'
import { ManajemenTimEvaluasi } from '@/pages/biro-organisasi/tim-evaluasi/ManajemenTimEvaluasi'

export const Route = createFileRoute('/biro-organisasi/tim-evaluasi/')({
  component: ManajemenTimEvaluasi,
})
