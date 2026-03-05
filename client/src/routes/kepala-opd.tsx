import { createFileRoute, redirect } from '@tanstack/react-router'
import { PenLine } from 'lucide-react'
import { isKepalaOPD } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isKepalaOPD()) {
      throw redirect({ to: ROUTES.HOME, search: { denied: 'kepala-opd' } })
    }
  },
  component: KepalaOPDLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_OPD.TTD]: ['/kepala-opd/ttd-elektronik'],
})

function KepalaOPDLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="Kepala OPD"
      subtitle="OPD"
    />
  )
}
