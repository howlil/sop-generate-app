import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { requireRoles } from '@/stores/authStore'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoles(['TIM_PENYUSUN', 'KOORDINATOR_TIM_PENYUSUN']),
  component: DashboardLayout,
})
