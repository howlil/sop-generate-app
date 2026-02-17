import { createFileRoute } from '@tanstack/react-router'
import { EditPenugasanEvaluasi } from '@/components/pages/kepala-biro-organisasi/EditPenugasanEvaluasi'

export const Route = createFileRoute(
  '/kepala-biro-organisasi/manajemen-evaluasi-sop/edit/$id'
)({
  component: EditPenugasanPage,
})

function EditPenugasanPage() {
  return <EditPenugasanEvaluasi />
}
