import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik/TTDElektronikPage'
import { useAppRole } from '@/hooks/auth/useAppRole'

export const Route = createFileRoute('/tim-penyusun/ttd-elektronik')({
  component: () => {
    const { getRoleNip, getRoleDisplayName } = useAppRole()
    return (
      <TTDElektronikPage
        role="tim-penyusun"
        defaultNip={getRoleNip()}
        defaultNama={getRoleDisplayName()}
      />
    )
  },
})
