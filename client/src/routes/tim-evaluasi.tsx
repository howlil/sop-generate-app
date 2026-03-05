import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { isTimEvaluasi } from '@/lib/stores/app-store'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isTimEvaluasi()) {
      throw redirect({ to: ROUTES.HOME, search: { denied: 'tim-evaluasi' } })
    }
  },
  component: TimEvaluasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.TIM_EVALUASI.PENUGASAN, label: 'Evaluasi SOP', icon: ClipboardCheck },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_EVALUASI.PENUGASAN]: ['/tim-evaluasi/penugasan', '/tim-evaluasi/penugasan/opd', '/tim-evaluasi/evaluasi'],
})

function TimEvaluasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="Tim Evaluasi"
      subtitle="Evaluasi SOP"
    />
  )
}
