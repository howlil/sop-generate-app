import { createFileRoute, redirect } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { isTimPenyusun } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'

export const Route = createFileRoute('/tim-penyusun')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isTimPenyusun()) {
      throw redirect({ to: '/', search: { denied: 'tim-penyusun' } })
    }
  },
  component: TimPenyusunLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: '/tim-penyusun/sop-saya', label: 'SOP Saya', icon: FileText },
]

function isSidebarActive(pathname: string, item: SidebarItem) {
  return pathname === item.to || pathname.startsWith('/tim-penyusun/detail-sop')
}

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
