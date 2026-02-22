import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClipboardCheck, PenLine } from 'lucide-react'
import { isTimEvaluasi } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isTimEvaluasi()) {
      throw redirect({ to: '/', search: { denied: 'tim-evaluasi' } })
    }
  },
  component: TimEvaluasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: '/tim-evaluasi/penugasan', label: 'Penugasan & Hasil Evaluasi', icon: ClipboardCheck },
  { to: '/tim-evaluasi/ttd-elektronik', label: 'TTD Elektronik', icon: PenLine },
]

function isSidebarActive(pathname: string, item: SidebarItem) {
  return (
    pathname === item.to ||
    (item.to === '/tim-evaluasi/penugasan' &&
      (pathname.startsWith('/tim-evaluasi/penugasan') || pathname.startsWith('/tim-evaluasi/pelaksanaan'))) ||
    (item.to === '/tim-evaluasi/ttd-elektronik' && pathname === '/tim-evaluasi/ttd-elektronik')
  )
}

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
