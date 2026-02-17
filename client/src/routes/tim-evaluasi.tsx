import { createFileRoute, Link, Outlet, useRouterState, redirect } from '@tanstack/react-router'
import { ClipboardCheck } from 'lucide-react'
import { isTimEvaluasi } from '@/lib/role'
import { AppLogo } from '@/components/layout/AppLogo'
import { HeaderProfile } from '@/components/layout/HeaderProfile'
import { PageHeaderProvider } from '@/components/layout/PageHeaderContext'

export const Route = createFileRoute('/tim-evaluasi')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !isTimEvaluasi()) {
      throw redirect({ to: '/', search: { denied: 'tim-evaluasi' } })
    }
  },
  component: TimEvaluasiLayout,
})

const sidebarItems = [
  { to: '/tim-evaluasi/penugasan', label: 'Penugasan & Hasil Evaluasi', icon: ClipboardCheck },
]

function TimEvaluasiLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="h-screen flex">
      <aside className="w-14 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-2 flex flex-col items-center">
          <AppLogo />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4">
          {sidebarItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              pathname === to ||
              (to === '/tim-evaluasi/penugasan' && (pathname.startsWith('/tim-evaluasi/penugasan') || pathname.startsWith('/tim-evaluasi/pelaksanaan')))
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
          <HeaderProfile title="Tim Evaluasi" subtitle="Evaluasi SOP" />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  )
}
