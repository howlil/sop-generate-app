import { createFileRoute } from '@tanstack/react-router'
import { TTDElektronikPage } from '@/pages/ttd-elektronik'
import { useAppRole } from '@/features/auth'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun/koordinator/tte')({
  beforeLoad: requireRoles(['KOORDINATOR_TIM_PENYUSUN']),
  component: () => {
    const { getRoleNip, getRoleDisplayName } = useAppRole()
    return (
      <TTDElektronikPage
        role="koordinator-tim-penyusun"
        defaultNip={getRoleNip()}
        defaultNama={getRoleDisplayName()}
      />
    )
  },
})
