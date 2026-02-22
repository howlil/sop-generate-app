import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { AppLogo } from '@/components/layout/AppLogo'
import { HeaderProfile } from '@/components/layout/HeaderProfile'
import { PageHeaderProvider } from '@/components/layout/PageHeaderContext'

export interface SidebarItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface RoleLayoutProps {
  /** Item navigasi sidebar (to, label, icon). */
  sidebarItems: SidebarItem[]
  /** Fungsi untuk menandai item aktif (pathname saat ini, item) => boolean. */
  isActive: (pathname: string, item: SidebarItem) => boolean
  /** Judul header (opsional). */
  title?: string
  /** Subtitle header (opsional). */
  subtitle?: string
}

/** Layout reusable: sidebar + PageHeaderProvider + HeaderProfile + main (Outlet). */
export function RoleLayout({
  sidebarItems,
  isActive,
  title,
  subtitle,
}: RoleLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="h-screen flex">
      <aside className="w-14 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-2 flex flex-col items-center">
          <AppLogo />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4">
          {sidebarItems.map((item) => {
            const { to, label, icon: Icon } = item
            const active = isActive(pathname, item)
            return (
              <Link
                key={to}
                to={to}
                className={`w-10 h-10 flex items-center justify-center rounded-md transition-all ${
                  active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
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
          <HeaderProfile title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Outlet />
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  )
}
