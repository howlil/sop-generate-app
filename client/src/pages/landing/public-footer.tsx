import { Link } from '@tanstack/react-router'
import { ArrowRight, Archive, ShieldCheck } from 'lucide-react'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'
import { ROUTES } from '@/utils/constants'

interface PublicFooterProps {
  governmentName: string
  officeName: string
}

export function PublicFooter({ governmentName, officeName }: PublicFooterProps) {
  return (
    <footer className="bg-surface">
      <section className="border-b border-border" aria-labelledby="akses-internal-title">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Akses internal</p>
            <h2 id="akses-internal-title" className="mt-2 text-xl font-semibold text-foreground">Pengguna OPD dan Biro Organisasi masuk dengan akun yang telah terdaftar.</h2>
            <p className="mt-2 text-sm text-secondary-foreground">Arsip SOP dan validasi PDF tetap tersedia untuk pengunjung tanpa login.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.ARSIP.PREFIX} className="inline-flex h-9 items-center gap-2 rounded-control border border-border-strong px-3 text-xs font-medium text-secondary-foreground hover:bg-surface-subtle">
              <Archive className="h-3.5 w-3.5" aria-hidden /> Arsip
            </Link>
            <Link to={ROUTES.VALIDASI.PDF} className="inline-flex h-9 items-center gap-2 rounded-control border border-border-strong px-3 text-xs font-medium text-secondary-foreground hover:bg-surface-subtle">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Validasi
            </Link>
            <Link to={ROUTES.AUTH.LOGIN} className="inline-flex h-9 items-center gap-2 rounded-control bg-primary px-4 text-xs font-medium text-white hover:bg-primary-hover">
              Masuk <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-8 w-8" />
          <div>
            <p className="text-xs font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{governmentName} · Sekretariat Daerah · {officeName}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Pemerintah Provinsi Sumatera Barat</p>
      </div>
    </footer>
  )
}
