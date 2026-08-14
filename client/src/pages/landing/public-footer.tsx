import { Link } from '@tanstack/react-router'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'
import { ROUTES } from '@/utils/constants'

interface PublicFooterProps {
  governmentName: string
  officeName: string
}

export function PublicFooter({ governmentName, officeName }: PublicFooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-8 w-8" />
          <div>
            <p className="text-xs font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{governmentName} · Sekretariat Daerah · {officeName}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-secondary-foreground" aria-label="Navigasi footer">
          <Link to={ROUTES.ARSIP.PREFIX} className="hover:text-foreground">Arsip SOP</Link>
          <Link to={ROUTES.VALIDASI.PDF} className="hover:text-foreground">Validasi PDF</Link>
          <Link to={ROUTES.AUTH.LOGIN} className="hover:text-foreground">Masuk</Link>
        </nav>

        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Pemerintah Provinsi Sumatera Barat</p>
      </div>
    </footer>
  )
}
