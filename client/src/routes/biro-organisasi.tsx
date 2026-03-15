import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Building2, FileCheck, PenLine, UserPlus, Users } from 'lucide-react'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'
import { requireRoleBeforeLoad } from '@/lib/auth/role-route-guard'

export const Route = createFileRoute('/biro-organisasi')({
  beforeLoad: requireRoleBeforeLoad(ROLES.BIRO_ORGANISASI),
  component: BiroOrganisasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN, label: 'Grafik Evaluasi Tahunan', icon: BarChart3 },
  { to: ROUTES.BIRO_ORGANISASI.OPD, label: 'Manajemen OPD', icon: Building2 },
  { to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN, label: 'Manajemen Tim Penyusun', icon: UserPlus },
  { to: ROUTES.BIRO_ORGANISASI.TIM_EVALUASI, label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: ROUTES.BIRO_ORGANISASI.EVALUASI_SOP, label: 'Verifikasi SOP', icon: FileCheck },
  { to: ROUTES.BIRO_ORGANISASI.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.BIRO_ORGANISASI.EVALUASI_SOP]: ['/biro-organisasi/manajemen-evaluasi-sop'],
  [ROUTES.BIRO_ORGANISASI.GRAFIK_EVALUASI_TAHUNAN]: ['/biro-organisasi/grafik-evaluasi-tahunan'],
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
