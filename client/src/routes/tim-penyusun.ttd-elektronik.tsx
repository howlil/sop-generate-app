import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { ROLES } from '@/utils/constants/ui'
import { getRoleNip, getRoleDisplayName } from '@/utils/role-display'

export const Route = createFileRoute('/tim-penyusun/ttd-elektronik')({
  component: () => (
    <TTDElektronikPage
      role="tim-penyusun"
      defaultNip={getRoleNip(ROLES.TIM_PENYUSUN)}
      defaultNama={getRoleDisplayName(ROLES.TIM_PENYUSUN)}
    />
  ),
})
