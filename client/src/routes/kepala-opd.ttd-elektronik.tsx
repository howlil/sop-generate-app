import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/components/pages/ttd-elektronik/TTDElektronikPage'
import { getRoleNip, ROLES } from '@/lib/role'

export const Route = createFileRoute('/kepala-opd/ttd-elektronik')({
  component: () => (
    <TTDElektronikPage
      role="kepala-opd"
      defaultNip={getRoleNip(ROLES.KEPALA_OPD)}
      defaultNama="Kepala OPD"
    />
  ),
})
