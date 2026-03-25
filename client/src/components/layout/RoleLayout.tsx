import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { AppLogo } from '@/components/layout/AppLogo'
import { HeaderProfile } from '@/components/layout/HeaderProfile'
import { PageHeaderProvider } from '@/components/layout/PageHeaderContext'
import { cn } from '@/utils/cn'

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
  const { pathname } = useLocation()

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row md:h-screen">
      {/* Nav berlabel untuk layar sempit — menghindari hanya ikon tanpa teks */}
      <nav
        className="md:hidden flex shrink-0 items-stretch gap-0 border-b border-gray-200 bg-white px-2 py-2"
        aria-label="Navigasi utama"
      >
        <div className="flex items-center pr-2 border-r border-gray-100">
          <AppLogo />
        </div>
        <div className="flex-1 flex overflow-x-auto gap-1 min-w-0 scrollbar-hide">
          {sidebarItems.map((item) => {
            const { to, label, icon: Icon } = item
            const active = isActive(pathname, item)
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors flex items-center gap-1.5',
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      <aside className="hidden md:flex w-14 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <div className="p-2 flex flex-col items-center">
          <AppLogo />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1 pt-4" aria-label="Navigasi ikon">
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

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <PageHeaderProvider>
          <HeaderProfile title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-auto scrollbar-hide p-3 sm:p-4 md:p-6 bg-white relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </PageHeaderProvider>
      </div>
    </div>
  )
}
