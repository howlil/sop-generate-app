import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { requireRoles } from '@/stores/authStore'
import { ROLES } from '@/utils/constants'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: requireRoles([ROLES.KEPALA_OPD]),
  component: DashboardLayout,
})
