import { createFileRoute, redirect } from '@tanstack/react-router'
import { Building2, FileCheck, PenLine, UserPlus, Users } from 'lucide-react'
import { isBiroOrganisasi } from '@/lib/stores/app-store'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/biro-organisasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isBiroOrganisasi()) {
      throw redirect({ to: ROUTES.HOME, search: { denied: 'biro-organisasi' } })
    }
  },
  component: BiroOrganisasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.BIRO_ORGANISASI.OPD, label: 'Manajemen OPD', icon: Building2 },
  { to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN, label: 'Manajemen Tim Penyusun', icon: UserPlus },
  { to: ROUTES.BIRO_ORGANISASI.TIM_EVALUASI, label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP, label: 'Manajemen Evaluasi SOP', icon: FileCheck },
  { to: ROUTES.BIRO_ORGANISASI.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.BIRO_ORGANISASI.EVALUASI_SOP]: ['/biro-organisasi/manajemen-evaluasi-sop'],
  [ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN]: ['/biro-organisasi/manajemen-tim-penyusun'],
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
