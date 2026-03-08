import { createFileRoute, redirect } from '@tanstack/react-router'
import { BookOpen, FileText, UserCog } from 'lucide-react'
import { isTimPenyusun } from '@/lib/stores/app-store'
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
  { to: ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP, label: 'Manajemen SOP', icon: FileText },
  { to: ROUTES.TIM_PENYUSUN.PELAKSANA_SOP, label: 'Kelola Pelaksana SOP', icon: UserCog },
  { to: ROUTES.TIM_PENYUSUN.PERATURAN, label: 'Manajemen Peraturan', icon: BookOpen },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP]: ['/tim-penyusun/manajemen-sop', '/tim-penyusun/initiate-proyek', '/tim-penyusun/detail-sop'],
  [ROUTES.TIM_PENYUSUN.PELAKSANA_SOP]: ['/tim-penyusun/pelaksana-sop'],
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
