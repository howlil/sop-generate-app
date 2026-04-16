import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/kepala-opd/tte'
import { useAppRole } from '@/features/auth'

export const Route = createFileRoute('/kepala-opd/tte/')({
  component: KepalaOpdTTEPage,
})

function KepalaOpdTTEPage() {
  const { getRoleNip, getRoleDisplayName } = useAppRole()
  return (
    <TTDElektronikPage
      role="kepala-opd"
      defaultNip={getRoleNip()}
      defaultNama={getRoleDisplayName()}
    />
  )
}
