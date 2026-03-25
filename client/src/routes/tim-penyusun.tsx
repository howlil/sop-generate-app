import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, FileSignature, FileText, UserCog } from 'lucide-react'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES, routePathPrefixForMatch } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'
import { requireRoleBeforeLoad } from '@/lib/auth/role-route-guard'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: requireRoleBeforeLoad(ROLES.TIM_PENYUSUN),
  component: TimPenyusunLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP, label: 'Manajemen SOP', icon: FileText },
  { to: ROUTES.TIM_PENYUSUN.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: UserCog },
  { to: ROUTES.TIM_PENYUSUN.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
  { to: ROUTES.TIM_PENYUSUN.BERITA_ACARA, label: 'Berita Acara', icon: FileSignature },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP]: [
    ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP,
    routePathPrefixForMatch(ROUTES.TIM_PENYUSUN.DETAIL_SOP),
  ],
  [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP]: [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP],
  [ROUTES.TIM_PENYUSUN.BERITA_ACARA]: [ROUTES.TIM_PENYUSUN.BERITA_ACARA],
})

function TimPenyusunLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="Tim Penyusun"
      subtitle="Penyusunan SOP"
    />
  )
}
