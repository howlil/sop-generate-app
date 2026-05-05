import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/pj-evaluator/tte/TTDElektronikPage'

export const Route = createFileRoute('/pj-evaluator/tte/')({
  component: PjEvaluatorTTEPage,
})

function PjEvaluatorTTEPage() {
  return (
    <TTDElektronikPage
      role="pj-evaluator"
    />
  )
}
