import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodSearchValidator } from '@tanstack/router-zod-adapter'
import { DetailEvaluasiOPD } from '@/pages/tim-evaluasi/evaluasi/DetailEvaluasiOPD'
import { RouteErrorPage } from '@/components/ui/route-error'

const evaluasiDetailSearchSchema = z.object({
  sopId: z.string().optional(),
})

export const Route = createFileRoute('/tim-evaluasi/evaluasi/$id')({
  validateSearch: zodSearchValidator(evaluasiDetailSearchSchema),
  component: DetailEvaluasiOPDPage,
  errorComponent: ({ error, reset }) => <RouteErrorPage error={error} reset={reset} />,
})

function DetailEvaluasiOPDPage() {
  return <DetailEvaluasiOPD />
}
