import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { useAppRole } from '@/hooks/useAppRole'

export const Route = createFileRoute('/biro-organisasi/ttd-elektronik')({
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
