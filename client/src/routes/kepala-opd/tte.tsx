import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik'
import { useAppRole } from '@/features/auth'

export const Route = createFileRoute('/kepala-opd/tte')({
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
