import { Link } from '@tanstack/react-router'
import { Archive, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@/utils/constants'

export function PublicServiceGateway() {
  return (
    <section aria-labelledby="public-services-title" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.7fr_0.3fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Layanan publik</p>
            <h2 id="public-services-title" className="mt-3 max-w-2xl text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
              Akses dokumen tanpa masuk ke ruang kerja internal.
            </h2>
          </div>
          <p className="text-sm leading-6 text-secondary-foreground lg:text-right">
            Arsip SOP dan validasi dokumen tetap tersedia sebagai layanan publik yang terpisah dari proses kerja pengguna terautentikasi.
          </p>
        </div>

        <div className="grid overflow-hidden border border-border lg:grid-cols-[0.42fr_0.58fr]">
          <Link
            to={ROUTES.ARSIP.PREFIX}
            className="group flex min-h-[360px] flex-col justify-between border-b border-border bg-surface-subtle p-7 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-9 lg:border-b-0 lg:border-r"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="grid h-10 w-10 place-items-center border border-border-strong bg-surface">
                  <Archive className="h-4 w-4 text-primary" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </div>
              <h3 className="mt-12 text-4xl font-semibold tracking-[-0.035em] text-foreground">Arsip SOP</h3>
              <p className="mt-4 max-w-md text-base leading-7 text-secondary-foreground">
                Cari SOP yang telah tersedia pada arsip publik berdasarkan OPD dan informasi dokumen yang tersedia.
              </p>
            </div>
            <span className="mt-10 text-sm font-semibold text-primary">Buka Arsip →</span>
          </Link>

          <Link
            to={ROUTES.VALIDASI.PDF}
            className="group relative min-h-[360px] overflow-hidden bg-primary-subtle p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-9"
          >
            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Validasi dokumen
              </div>
              <h3 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-foreground">Validasi PDF</h3>
              <p className="mt-4 text-base leading-7 text-secondary-foreground">
                Periksa informasi validasi dokumen PDF yang dihasilkan sistem tanpa masuk ke area kerja internal.
              </p>
              <span className="mt-12 inline-block text-sm font-semibold text-primary">Validasi PDF →</span>
            </div>

            <div className="absolute -bottom-12 right-5 h-60 w-44 rotate-[-4deg] border border-blue-200 bg-white sm:right-16" aria-hidden>
              <div className="mx-5 mt-7 h-2 w-20 bg-slate-200" />
              <div className="mx-5 mt-4 h-px bg-slate-200" />
              <div className="mx-5 mt-3 h-px bg-slate-200" />
              <div className="mx-5 mt-3 h-px w-24 bg-slate-200" />
            </div>
            <div className="absolute -bottom-3 right-14 h-60 w-44 rotate-[3deg] border border-blue-300 bg-white sm:right-28" aria-hidden>
              <div className="mx-5 mt-7 flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="h-7 w-7 border border-blue-200 bg-blue-50" />
                <div className="h-1.5 w-16 bg-slate-200" />
              </div>
              <div className="mx-5 mt-5 h-1.5 w-24 bg-slate-200" />
              <div className="mx-5 mt-3 h-px bg-slate-200" />
              <div className="mx-5 mt-3 h-px bg-slate-200" />
              <div className="mx-5 mt-8 border-l-2 border-primary pl-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">Valid</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
