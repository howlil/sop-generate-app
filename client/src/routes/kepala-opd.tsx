import { createFileRoute, redirect } from '@tanstack/react-router'
import { BookOpen, FileText, PenLine, UserPlus, Users } from 'lucide-react'
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
  { to: ROUTES.KEPALA_OPD.TIM_PENYUSUN, label: 'Manajemen Tim Penyusun', icon: UserPlus },
  { to: ROUTES.KEPALA_OPD.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: Users },
  { to: ROUTES.KEPALA_OPD.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
  { to: ROUTES.KEPALA_OPD.DAFTAR_SOP, label: 'Daftar SOP', icon: FileText },
  { to: ROUTES.KEPALA_OPD.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_OPD.DAFTAR_SOP]: ['/kepala-opd/daftar-sop', '/kepala-opd/initiate-proyek', '/kepala-opd/detail-sop'],
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
