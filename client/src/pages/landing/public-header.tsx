import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'
import { ROUTES } from '@/utils/constants'

interface PublicHeaderProps {
  governmentName: string
  officeName: string
}

export function PublicHeader({ governmentName, officeName }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.HOME}
          className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-white">
            <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{APP_DISPLAY_NAME}</p>
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">{governmentName} · {officeName}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-5 text-xs font-medium text-slate-300 md:flex" aria-label="Navigasi publik">
            <a href="#alur" className="transition-colors hover:text-white">Alur kerja</a>
            <a href="#peran" className="transition-colors hover:text-white">Peran</a>
            <Link to={ROUTES.ARSIP.PREFIX} className="transition-colors hover:text-white">Arsip SOP</Link>
            <Link to={ROUTES.VALIDASI.PDF} className="transition-colors hover:text-white">Validasi PDF</Link>
          </nav>
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-control bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Masuk
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  )
}
