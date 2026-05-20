import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Archive, LogIn } from 'lucide-react'
import logoSvg from '@/assets/logo.svg'
import { ROUTES } from '@/utils/constants'

export interface ArsipSopShellProps {
  children: ReactNode
}

export function ArsipSopShell({ children }: ArsipSopShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link
            to={ROUTES.ARSIP.PREFIX}
            className="flex min-h-11 items-center gap-2.5 rounded-lg px-1 py-1 hover:bg-slate-50"
          >
            <img src={logoSvg} alt="" className="h-9 w-9" aria-hidden />
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Archive className="h-4 w-4 text-blue-600" aria-hidden />
                Arsip SOP
              </p>
              <p className="text-xs text-slate-500">Dokumen berlaku &amp; disahkan</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Navigasi arsip">
            <Link
              to={ROUTES.HOME}
              className="hidden min-h-10 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
            >
              Beranda
            </Link>
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Masuk
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  )
}
