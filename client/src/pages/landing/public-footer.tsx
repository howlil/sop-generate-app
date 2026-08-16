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
    <footer className="bg-[#082452] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div className="flex max-w-xl items-start gap-3">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-9 w-9 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{APP_DISPLAY_NAME}</p>
            <p className="mt-1 text-xs leading-5 text-blue-100">{governmentName} · Sekretariat Daerah · {officeName}</p>
            <p className="mt-4 text-[11px] leading-5 text-slate-300">Sistem pengelolaan SOP berbasis web untuk proses kerja yang terdokumentasi dan dapat ditelusuri.</p>
          </div>
        </div>

        <div className="md:text-right">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-200 md:justify-end" aria-label="Navigasi footer">
            <Link to={ROUTES.ARSIP.PREFIX} className="hover:text-white">Arsip SOP</Link>
            <Link to={ROUTES.VALIDASI.PDF} className="hover:text-white">Validasi PDF</Link>
            <Link to={ROUTES.AUTH.LOGIN} className="hover:text-white">Masuk</Link>
          </nav>
          <p className="mt-5 text-[10px] text-slate-400">© {new Date().getFullYear()} Pemerintah Provinsi Sumatera Barat</p>
        </div>
      </div>
    </footer>
  )
}
