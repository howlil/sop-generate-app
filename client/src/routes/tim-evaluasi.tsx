import { createFileRoute } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES, routePathPrefixForMatch } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'
import { requireRoleBeforeLoad } from '@/lib/auth/role-route-guard'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_EVALUASI),
  component: TimEvaluasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.TIM_EVALUASI.EVALUASI, label: 'Evaluasi SOP', icon: ClipboardCheck },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_EVALUASI.EVALUASI]: [
    ROUTES.TIM_EVALUASI.EVALUASI,
    routePathPrefixForMatch(ROUTES.TIM_EVALUASI.EVALUASI_OPD),
  ],
})

function TimEvaluasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="Tim Evaluasi"
      subtitle="Evaluasi SOP"
    />
  )
}
