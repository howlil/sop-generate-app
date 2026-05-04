import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from "@/pages/pj-evaluator/tte/TTDElektronikPage";
import { useAppRole } from '@/hooks/useAppRole'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/penyusun/koordinator/tte/')({
  beforeLoad: requireRoles(['PJ_PENYUSUN']),
  component: PjPenyusunTtePage,
})

function PjPenyusunTtePage() {
  const { getRoleNip, getRoleDisplayName } = useAppRole()
  return (
    <TTDElektronikPage
      role="pj-penyusun"
      defaultNip={getRoleNip()}
      defaultNama={getRoleDisplayName()}
    />
  )
}
