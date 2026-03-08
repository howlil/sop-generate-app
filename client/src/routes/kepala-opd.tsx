import { createFileRoute, redirect } from '@tanstack/react-router'
import { PenLine, FileText, FileSignature } from 'lucide-react'
import { isKepalaOPD, setRole } from '@/lib/stores/app-store'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      setRole(ROLES.KEPALA_OPD)
      if (!isKepalaOPD()) {
        throw redirect({ to: ROUTES.HOME, search: { denied: 'kepala-opd' } })
      }
    }
  },
  component: KepalaOPDLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.KEPALA_OPD.PANTAU_SOP, label: 'Pantau SOP', icon: FileText },
  { to: ROUTES.KEPALA_OPD.BERITA_ACARA, label: 'Berita Acara', icon: FileSignature },
  { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_OPD.TTD]: ['/kepala-opd/ttd-elektronik'],
  [ROUTES.KEPALA_OPD.PANTAU_SOP]: ['/kepala-opd/pantau-sop', '/kepala-opd/detail-sop'],
  [ROUTES.KEPALA_OPD.BERITA_ACARA]: ['/kepala-opd/berita-acara'],
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
