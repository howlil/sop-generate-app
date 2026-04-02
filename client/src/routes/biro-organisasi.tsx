import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Building2, FileCheck, PenLine, UserPlus, Users } from 'lucide-react'
import { ROLES } from '@/utils/constants'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES, routePathPrefixForMatch } from '@/utils/constants'
import { createSidebarActiveMatcher, requireRoleBeforeLoad } from '@/utils'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { IA } from '@/utils/constants'

export const Route = createFileRoute('/biro-organisasi')({
  beforeLoad: requireRoleBeforeLoad(ROLES.BIRO_ORGANISASI),
  pendingComponent: RouteLoadingSkeleton,
  component: BiroOrganisasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN, label: 'Grafik Evaluasi Tahunan', icon: BarChart3 },
  { to: ROUTES.BIRO_ORGANISASI.OPD, label: 'Manajemen OPD', icon: Building2 },
  { to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN, label: 'Manajemen Tim Penyusun', icon: UserPlus },
  { to: ROUTES.BIRO_ORGANISASI.TIM_EVALUASI, label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP, label: IA.NAV_BIRO_BATCH_BA, icon: FileCheck },
  { to: ROUTES.BIRO_ORGANISASI.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.BIRO_ORGANISASI.EVALUASI_SOP]: [
    ROUTES.BIRO_ORGANISASI.EVALUASI_SOP,
    routePathPrefixForMatch(ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI),
  ],
  [ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN]: [ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN],
  [ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN]: [ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN],
  [ROUTES.BIRO_ORGANISASI.TIM_EVALUASI]: [ROUTES.BIRO_ORGANISASI.TIM_EVALUASI],
  [ROUTES.BIRO_ORGANISASI.OPD]: [ROUTES.BIRO_ORGANISASI.OPD],
  [ROUTES.BIRO_ORGANISASI.TTD]: [ROUTES.BIRO_ORGANISASI.TTD],
  [ROUTES.BIRO_ORGANISASI.DETAIL_SOP]: [
    ROUTES.BIRO_ORGANISASI.DETAIL_SOP,
    routePathPrefixForMatch(ROUTES.BIRO_ORGANISASI.DETAIL_SOP),
  ],
})

function BiroOrganisasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      subtitle="Biro Organisasi"
    />
  )
}
