import { createFileRoute, redirect } from '@tanstack/react-router'
import { BookOpen, FileText, Users } from 'lucide-react'
import { isTimPenyusun } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isTimPenyusun()) {
      throw redirect({ to: ROUTES.HOME, search: { denied: 'tim-penyusun' } })
    }
  },
  component: TimPenyusunLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.TIM_PENYUSUN.SOP_SAYA, label: 'SOP Saya', icon: FileText },
  { to: ROUTES.TIM_PENYUSUN.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: Users },
  { to: ROUTES.TIM_PENYUSUN.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
  { to: ROUTES.TIM_PENYUSUN.DAFTAR_SOP, label: 'Daftar SOP', icon: FileText },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_PENYUSUN.SOP_SAYA]: ['/tim-penyusun/sop-saya', '/tim-penyusun/detail-sop'],
  [ROUTES.TIM_PENYUSUN.DAFTAR_SOP]: ['/tim-penyusun/daftar-sop', '/tim-penyusun/initiate-proyek', '/tim-penyusun/detail-sop'],
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
