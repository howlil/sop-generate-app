import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiItem } from '@/pages/tim-evaluasi/DetailEvaluasiItem'

export const Route = createFileRoute('/tim-evaluasi/evaluasi/detail/$id')({
  component: () => <DetailEvaluasiItem />,
})
