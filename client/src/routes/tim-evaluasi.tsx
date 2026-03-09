import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { isTimEvaluasi, setRole } from '@/lib/stores/app-store'
import { ROLES } from '@/lib/constants/roles'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'
import { ROUTES } from '@/lib/constants/routes'
import { createSidebarActiveMatcher } from '@/utils/sidebar-active'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      setRole(ROLES.TIM_EVALUASI)
      if (!isTimEvaluasi()) {
        throw redirect({ to: ROUTES.HOME, search: { denied: 'tim-evaluasi' } })
      }
    }
  },
  component: TimEvaluasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: ROUTES.TIM_EVALUASI.EVALUASI, label: 'Evaluasi SOP', icon: ClipboardCheck },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_EVALUASI.EVALUASI]: ['/tim-evaluasi/evaluasi', '/tim-evaluasi/evaluasi/opd', '/tim-evaluasi/evaluasi/detail'],
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
