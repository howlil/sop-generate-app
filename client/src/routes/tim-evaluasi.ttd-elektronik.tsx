import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { getRoleNip, ROLES } from '@/lib/stores'

export const Route = createFileRoute('/tim-evaluasi/ttd-elektronik')({
  component: () => (
    <TTDElektronikPage
      role="tim-evaluasi"
      defaultNip={getRoleNip(ROLES.TIM_EVALUASI)}
      defaultNama="Tim Evaluasi"
    />
  ),
})
