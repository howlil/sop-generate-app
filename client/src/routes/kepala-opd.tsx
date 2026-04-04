import { createFileRoute } from '@tanstack/react-router'
import { ROLES } from '@/utils/constants'
import { RoleLayout } from '@/components/layout/RoleLayout'
import { requireRoleBeforeLoad } from '@/utils/role'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { sidebarConfig, sidebarActiveConfig, createIsActiveFromConfig } from '@/config/sidebar.config'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: requireRoleBeforeLoad(ROLES.KEPALA_OPD),
  pendingComponent: RouteLoadingSkeleton,
  component: KepalaOPDLayout,
})

function KepalaOPDLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarConfig[ROLES.KEPALA_OPD]}
      isActive={createIsActiveFromConfig(sidebarActiveConfig[ROLES.KEPALA_OPD])}
      title="OPD"
      subtitle="OPD"
    />
  )
}
