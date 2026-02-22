import { createFileRoute, redirect } from '@tanstack/react-router'
import { Building2, FileCheck, PenLine, Users } from 'lucide-react'
import { isKepalaBiroOrganisasi } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/kepala-biro-organisasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isKepalaBiroOrganisasi()) {
      throw redirect({ to: ROUTES.HOME, search: { denied: 'kepala-biro-organisasi' } })
    }
  },
  component: KepalaBiroOrganisasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.KEPALA_BIRO.OPD, label: 'Manajemen OPD', icon: Building2 },
  { to: ROUTES.KEPALA_BIRO.TIM_EVALUASI, label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: ROUTES.KEPALA_BIRO.EVALUASI_SOP, label: 'Manajemen Evaluasi SOP', icon: FileCheck },
  { to: ROUTES.KEPALA_BIRO.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.KEPALA_BIRO.EVALUASI_SOP]: ['/kepala-biro-organisasi/manajemen-evaluasi-sop'],
})

function KepalaBiroOrganisasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      subtitle="Biro Organisasi"
    />
  )
}
