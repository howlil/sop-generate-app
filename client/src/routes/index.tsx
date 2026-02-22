import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { Building2, UserCircle, ClipboardCheck, Users } from 'lucide-react'
import { setRole, ROLES, getRoleLabel } from '@/lib/stores'
import { DASHBOARD_DESCRIPTIONS } from '@/lib/seed/user-seed'

export const Route = createFileRoute('/')({
  validateSearch: (s: Record<string, unknown>) => ({ denied: (s.denied as string) ?? undefined }),
  component: IndexPage,
})

const dashboards = [
  { to: '/kepala-opd', icon: Building2, role: ROLES.KEPALA_OPD },
  { to: '/kepala-biro-organisasi', icon: UserCircle, role: ROLES.KEPALA_BIRO_ORGANISASI },
  { to: '/tim-evaluasi', icon: ClipboardCheck, role: ROLES.TIM_EVALUASI },
  { to: '/tim-penyusun', icon: Users, role: ROLES.TIM_PENYUSUN },
]

function IndexPage() {
  const { denied } = useSearch({ from: '/' })
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {denied === 'kepala-biro-organisasi' && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-center">
          <p className="text-xs text-red-700">Akses ditolak. Hanya Kepala Biro Organisasi yang dapat mengakses halaman tersebut. Pilih role Kepala Biro Organisasi di bawah lalu masuk.</p>
        </div>
      )}
      <header className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md bg-blue-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Biro Organisasi</span>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto mb-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Selamat datang di Biro Organisasi
          </h1>
          <p className="text-xs text-gray-500 mb-4">
            Pilih role lalu masuk. Hanya Kepala Biro Organisasi yang dapat mengakses Manajemen OPD, Tim Evaluasi, dan Evaluasi SOP.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {dashboards.map(({ to, icon: Icon, role }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setRole(role)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all flex items-start gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-gray-900 mb-0.5">{getRoleLabel(role)}</h2>
                <p className="text-xs text-gray-500">{DASHBOARD_DESCRIPTIONS[role]}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="py-3 px-6 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          © Biro Organisasi · Compact Modern Dashboard
        </p>
      </footer>
    </div>
  )
}
