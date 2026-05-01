import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from "@/pages/biro-organisasi/tte/TTDElektronikPage";
import { useAppRole } from '@/hooks/useAppRole'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun/koordinator/tte/')({
  beforeLoad: requireRoles(['KOORDINATOR_TIM_PENYUSUN']),
  component: KoordinatorTimPenyusunTTEPage,
})

function KoordinatorTimPenyusunTTEPage() {
  const { getRoleNip, getRoleDisplayName } = useAppRole()
  return (
    <TTDElektronikPage
      role="koordinator-tim-penyusun"
      defaultNip={getRoleNip()}
      defaultNama={getRoleDisplayName()}
    />
  )
}
