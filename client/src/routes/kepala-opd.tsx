import { createFileRoute, redirect } from '@tanstack/react-router'
import { BookOpen, FileText, PenLine, UserPlus, Users } from 'lucide-react'
import { isKepalaOPD } from '@/lib/stores'
import { RoleLayout, type SidebarItem } from '@/components/layout/RoleLayout'

export const Route = createFileRoute('/kepala-opd')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isKepalaOPD()) {
      throw redirect({ to: '/', search: { denied: 'kepala-opd' } })
    }
  },
  component: KepalaOPDLayout,
})

const sidebarItems: SidebarItem[] = [
  { to: '/kepala-opd/manajemen-tim-penyusun', label: 'Manajemen Tim Penyusun', icon: UserPlus },
  { to: '/kepala-opd/pelaksana-sop', label: 'Kelola Pelaksana SOP', icon: Users },
  { to: '/kepala-opd/manajemen-peraturan', label: 'Manajemen Peraturan', icon: BookOpen },
  { to: '/kepala-opd/daftar-sop', label: 'Daftar SOP', icon: FileText },
  { to: '/kepala-opd/ttd-elektronik', label: 'TTD Elektronik', icon: PenLine },
]

function isSidebarActive(pathname: string, item: SidebarItem) {
  return (
    pathname === item.to ||
    (item.to === '/kepala-opd/daftar-sop' &&
      (pathname.startsWith('/kepala-opd/daftar-sop') ||
        pathname.startsWith('/kepala-opd/initiate-proyek') ||
        pathname.startsWith('/kepala-opd/detail-sop'))) ||
    (item.to === '/kepala-opd/ttd-elektronik' && pathname === '/kepala-opd/ttd-elektronik')
  )
}

function KepalaOPDLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      isActive={isSidebarActive}
      title="Kepala OPD"
      subtitle="OPD"
    />
  )
}
