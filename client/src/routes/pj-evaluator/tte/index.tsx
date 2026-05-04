import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/pj-evaluator/tte/TTDElektronikPage'
import { useAppRole } from '@/hooks/useAppRole'

export const Route = createFileRoute('/pj-evaluator/tte/')({
  component: PjEvaluatorTTEPage,
})

function PjEvaluatorTTEPage() {
  const { getRoleNip, getRoleDisplayName } = useAppRole()
  return (
    <TTDElektronikPage
      role="pj-evaluator"
      defaultNip={getRoleNip()}
      defaultNama={getRoleDisplayName()}
    />
  )
}
