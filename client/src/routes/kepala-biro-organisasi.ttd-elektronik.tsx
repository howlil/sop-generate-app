import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { getRoleNip, getRoleDisplayName, ROLES } from '@/lib/stores'

export const Route = createFileRoute('/kepala-biro-organisasi/ttd-elektronik')({
  component: () => (
    <TTDElektronikPage
      role="kepala-biro-organisasi"
      defaultNip={getRoleNip(ROLES.KEPALA_BIRO_ORGANISASI)}
      defaultNama={getRoleDisplayName(ROLES.KEPALA_BIRO_ORGANISASI)}
    />
  ),
})
