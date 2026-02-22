import { createFileRoute, Link, Outlet, useRouterState, redirect } from '@tanstack/react-router'
import { Building2, FileCheck, PenLine, Users } from 'lucide-react'
import { isKepalaBiroOrganisasi } from '@/lib/role'
import { AppLogo } from '@/components/layout/AppLogo'
import { HeaderProfile } from '@/components/layout/HeaderProfile'
import { PageHeaderProvider } from '@/components/layout/PageHeaderContext'

export const Route = createFileRoute('/kepala-biro-organisasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isKepalaBiroOrganisasi()) {
      throw redirect({ to: '/', search: { denied: 'kepala-biro-organisasi' } })
    }
  },
  component: KepalaBiroOrganisasiLayout,
})

const sidebarItems = [
  { to: '/kepala-biro-organisasi/manajemen-opd', label: 'Manajemen OPD', icon: Building2 },
  { to: '/kepala-biro-organisasi/manajemen-tim-evaluasi', label: 'Manajemen Tim Evaluasi', icon: Users },
  { to: '/kepala-biro-organisasi/manajemen-evaluasi-sop', label: 'Manajemen Evaluasi SOP', icon: FileCheck },
  { to: '/kepala-biro-organisasi/ttd-elektronik', label: 'TTD Elektronik', icon: PenLine },
]

function KepalaBiroOrganisasiLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="h-screen flex">
      {/* Sidebar - hanya untuk Kepala Biro Organisasi */}
      <aside className="w-14 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-2 flex flex-col items-center">
          <AppLogo />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4">
          {sidebarItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              pathname === to ||
              (to === '/kepala-biro-organisasi/ttd-elektronik' &&
                pathname === '/kepala-biro-organisasi/ttd-elektronik')
            return (
              <Link
                key={to}
                to={to}
                className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={label}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <PageHeaderProvider>
          <HeaderProfile subtitle="Biro Organisasi" />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  )
}
