import { createFileRoute } from '@tanstack/react-router'
import { ROLES } from '@/utils/constants'
import { RoleLayout } from '@/components/layout/RoleLayout'
import { requireRoleBeforeLoad } from '@/utils/role'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { sidebarConfig, sidebarActiveConfig, createIsActiveFromConfig } from '@/config/sidebar.config'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_EVALUASI),
  pendingComponent: RouteLoadingSkeleton,
  component: TimEvaluasiLayout,
})

function TimEvaluasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarConfig[ROLES.TIM_EVALUASI]}
      isActive={createIsActiveFromConfig(sidebarActiveConfig[ROLES.TIM_EVALUASI])}
      title="Tim Evaluasi"
      subtitle="Evaluasi SOP"
    />
  )
}
