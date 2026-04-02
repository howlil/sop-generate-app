import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { useAppRole } from '@/hooks/useAppRole'

export const Route = createFileRoute('/kepala-opd/ttd-elektronik')({
  component: () => {
    const { getRoleNip, getRoleDisplayName } = useAppRole()
    return (
      <TTDElektronikPage
        role="kepala-opd"
        defaultNip={getRoleNip()}
        defaultNama={getRoleDisplayName()}
      />
    )
  },
})
