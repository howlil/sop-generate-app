import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { ROLES } from '@/lib/constants/roles'
import { getRoleNip, getRoleDisplayName } from '@/lib/data/role-display'

export const Route = createFileRoute('/biro-organisasi/ttd-elektronik')({
  component: () => (
    <TTDElektronikPage
      role="biro-organisasi"
      defaultNip={getRoleNip(ROLES.BIRO_ORGANISASI)}
      defaultNama={getRoleDisplayName(ROLES.BIRO_ORGANISASI)}
    />
  ),
})
