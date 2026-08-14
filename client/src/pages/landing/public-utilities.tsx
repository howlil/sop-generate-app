import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Archive, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

interface PublicUtilitiesProps {
  archiveLabel: string
  validationLabel: string
}

export function PublicUtilities({ archiveLabel, validationLabel }: PublicUtilitiesProps) {
  return (
    <section className="bg-surface" aria-labelledby="layanan-publik-title">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Layanan publik</p>
            <h2 id="layanan-publik-title" className="mt-2 text-xl font-semibold text-foreground">Akses dokumen tanpa akun</h2>
          </div>
          <p className="hidden max-w-md text-right text-xs leading-5 text-muted-foreground md:block">
            Arsip SOP yang berlaku dan pemeriksaan PDF tersedia sebagai layanan publik terpisah dari area kerja internal.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-surface border border-border md:grid-cols-2">
          <Link
            to={ROUTES.ARSIP.PREFIX}
            className="group flex min-h-40 flex-col justify-between gap-8 border-b border-border p-5 transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:border-b-0 md:border-r sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <Archive className="h-5 w-5 text-primary" aria-hidden />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{archiveLabel}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-secondary-foreground">Cari dan buka SOP yang sudah berlaku berdasarkan OPD dan dokumen yang tersedia pada arsip publik.</p>
            </div>
          </Link>

          <Link
            to={ROUTES.VALIDASI.PDF}
            className="group flex min-h-40 flex-col justify-between gap-8 p-5 transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{validationLabel}</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-secondary-foreground">Periksa informasi validasi pada dokumen PDF yang dihasilkan sistem tanpa masuk ke area kerja internal.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
