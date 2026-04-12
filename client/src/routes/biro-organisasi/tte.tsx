import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik'
import { useAppRole } from '@/features/auth'

export const Route = createFileRoute('/biro-organisasi/tte')({
  component: () => {
    const { getRoleNip, getRoleDisplayName } = useAppRole()
    return (
      <TTDElektronikPage
        role="biro-organisasi"
        defaultNip={getRoleNip()}
        defaultNama={getRoleDisplayName()}
      />
    )
  },
})
