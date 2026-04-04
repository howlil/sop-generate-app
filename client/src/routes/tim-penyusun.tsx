import { createFileRoute } from '@tanstack/react-router'
import { ROLES } from '@/utils/constants'
import { RoleLayout } from '@/components/layout/RoleLayout'
import { requireRoleBeforeLoad } from '@/utils/role'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { sidebarConfig, sidebarActiveConfig, createIsActiveFromConfig } from '@/config/sidebar.config'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_PENYUSUN),
  pendingComponent: RouteLoadingSkeleton,
  component: TimPenyusunLayout,
})

function TimPenyusunLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarConfig[ROLES.TIM_PENYUSUN]}
      isActive={createIsActiveFromConfig(sidebarActiveConfig[ROLES.TIM_PENYUSUN])}
      title="Tim Penyusun"
      subtitle="Penyusunan SOP"
    />
  )
}
