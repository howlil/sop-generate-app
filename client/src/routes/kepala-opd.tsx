import { createFileRoute } from '@tanstack/react-router'
import { PenLine, FileText } from 'lucide-react'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'
import { requireRoleBeforeLoad } from '@/lib/auth/role-route-guard'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: requireRoleBeforeLoad(ROLES.KEPALA_OPD),
  component: KepalaOPDLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.KEPALA_OPD.PANTAU_SOP, label: 'Pantau SOP', icon: FileText },
  { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_OPD.TTD]: ['/kepala-opd/ttd-elektronik'],
  [ROUTES.KEPALA_OPD.PANTAU_SOP]: ['/kepala-opd/pantau-sop', '/kepala-opd/detail-sop'],
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
