import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClipboardCheck, PenLine } from 'lucide-react'
import { isTimEvaluasi } from '@/lib/stores'
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
  { to: ROUTES.TIM_EVALUASI.PENUGASAN, label: 'Penugasan & Hasil Evaluasi', icon: ClipboardCheck },
  { to: ROUTES.TIM_EVALUASI.TTD, label: 'TTD Elektronik', icon: PenLine },
]

const isSidebarActive = createSidebarActiveMatcher({
  [ROUTES.TIM_EVALUASI.PENUGASAN]: ['/tim-evaluasi/penugasan', '/tim-evaluasi/pelaksanaan'],
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
