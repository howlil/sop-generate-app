import { createFileRoute } from '@tanstack/react-router'
import { PenLine, FileText, FileCheck } from 'lucide-react'
import { ROLES } from '@/utils/constants/ui'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES, routePathPrefixForMatch } from '@/utils/constants/ui'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'
import { requireRoleBeforeLoad } from '@/utils/role-route-guard'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { IA } from '@/utils/constants/pipeline-ia'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: requireRoleBeforeLoad(ROLES.KEPALA_OPD),
  pendingComponent: RouteLoadingSkeleton,
  component: KepalaOPDLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.KEPALA_OPD.PANTAU_SOP, label: 'Pantau SOP', icon: FileText },
  { to: ROUTES.KEPALA_OPD.BERITA_ACARA, label: IA.NAV_KO_BA_PENGESAHAN, icon: FileCheck },
  { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_OPD.TTD]: [ROUTES.KEPALA_OPD.TTD],
  [ROUTES.KEPALA_OPD.BERITA_ACARA]: [ROUTES.KEPALA_OPD.BERITA_ACARA],
  [ROUTES.KEPALA_OPD.PANTAU_SOP]: [
    ROUTES.KEPALA_OPD.PANTAU_SOP,
    routePathPrefixForMatch(ROUTES.KEPALA_OPD.DETAIL_SOP),
  ],
})

function KepalaOPDLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="OPD"
      subtitle="OPD"
    />
  )
}
