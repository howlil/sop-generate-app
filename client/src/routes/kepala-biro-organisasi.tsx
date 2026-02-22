import { createFileRoute, redirect } from '@tanstack/react-router'
import { Building2, FileCheck, PenLine, Users } from 'lucide-react'
import { isKepalaBiroOrganisasi } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'

export const Route = createFileRoute('/kepala-biro-organisasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isKepalaBiroOrganisasi()) {
      throw redirect({ to: '/', search: { denied: 'kepala-biro-organisasi' } })
    }
  },
  component: KepalaBiroOrganisasiLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: '/kepala-biro-organisasi/manajemen-opd', label: 'Manajemen OPD', icon: Building2 },
  { to: '/kepala-biro-organisasi/manajemen-tim-evaluasi', label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: '/kepala-biro-organisasi/manajemen-evaluasi-sop', label: 'Manajemen Evaluasi SOP', icon: FileCheck },
  { to: '/kepala-biro-organisasi/ttd-elektronik', label: 'TTD Elektronik', icon: PenLine },
]

function isSidebarActive(pathname: string, item: SidebarItem) {
  return (
    pathname === item.to ||
    (item.to === '/kepala-biro-organisasi/ttd-elektronik' &&
      pathname === '/kepala-biro-organisasi/ttd-elektronik')
  )
}

function KepalaBiroOrganisasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      subtitle="Biro Organisasi"
    />
  )
}
