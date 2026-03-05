import { createFileRoute } from '@tanstack/react-router'
import { DetailEvaluasiOPD } from '@/pages/tim-evaluasi/DetailEvaluasiOPD'

export const Route = createFileRoute('/tim-evaluasi/penugasan/opd/$opdId')({
  component: () => <DetailEvaluasiOPD />,
})
