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
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{governmentName} · {officeName}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-5 text-xs font-medium text-secondary-foreground md:flex" aria-label="Navigasi publik">
            <a href="#alur" className="transition-colors hover:text-foreground">Alur kerja</a>
            <a href="#peran" className="transition-colors hover:text-foreground">Peran</a>
            <Link to={ROUTES.ARSIP.PREFIX} className="transition-colors hover:text-foreground">Arsip</Link>
            <Link to={ROUTES.VALIDASI.PDF} className="transition-colors hover:text-foreground">Validasi</Link>
          </nav>
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-control bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Masuk
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  )
}
