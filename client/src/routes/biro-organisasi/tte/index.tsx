import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/biro-organisasi/tte'
import { useAppRole } from '@/features/auth'

export const Route = createFileRoute('/biro-organisasi/tte/')({
  component: BiroOrganisasiTTEPage,
})

function BiroOrganisasiTTEPage() {
  const { getRoleNip, getRoleDisplayName } = useAppRole()
  return (
    <TTDElektronikPage
      role="biro-organisasi"
      defaultNip={getRoleNip()}
      defaultNama={getRoleDisplayName()}
    />
  )
}
