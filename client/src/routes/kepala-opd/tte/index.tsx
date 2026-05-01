import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from "@/pages/biro-organisasi/tte/TTDElektronikPage";
import { useAppRole } from '@/hooks/useAppRole'

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
