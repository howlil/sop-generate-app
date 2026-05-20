import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Archive, ChevronRight, LogIn, Search } from 'lucide-react'
import logoSvg from '@/assets/logo.svg'
import { Input } from '@/components/ui/input'
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

export function ArsipPageIntro() {
  return (
    <section className="mb-5 space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Arsip SOP yang telah disahkan
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Pilih OPD dan SOP di panel kiri, baca dokumen di sebelah kanan. Panel navigasi bisa
        disembunyikan untuk ruang baca lebih luas.
      </p>
    </section>
  )
}

export interface ArsipHeroSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ArsipHeroSearch({ value, onChange }: ArsipHeroSearchProps) {
  return (
    <div className="mb-5 space-y-2">
      <label htmlFor="arsip-global-search" className="sr-only">
        Cari judul, nomor SOP, atau nama OPD
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          id="arsip-global-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari judul, nomor SOP, atau nama OPD…"
          className="h-12 rounded-xl border-slate-200 pl-12 text-base shadow-sm"
          autoComplete="off"
        />
      </div>
      <p className="text-sm text-slate-500">
        Contoh: Dinas Kesehatan, 001/SOP/2024 — hasil bisa dibaca langsung di pratinjau sebelah kanan tanpa
        pindah halaman.
      </p>
    </div>
  )
}

export interface ArsipSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  id: string
}

export function ArsipSearchField({ value, onChange, placeholder, id }: ArsipSearchFieldProps) {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10 text-base"
        aria-label={placeholder}
      />
    </div>
  )
}

export interface ArsipBreadcrumbItem {
  label: string
  to?: string
  params?: Record<string, string>
  search?: Record<string, string | undefined>
}

export interface ArsipBreadcrumbProps {
  items: ArsipBreadcrumbItem[]
}

export function ArsipBreadcrumb({ items }: ArsipBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-600">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden /> : null}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                params={item.params}
                search={item.search}
                className="rounded px-1 py-0.5 font-medium text-blue-700 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-900' : undefined} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function arsipHomeCrumb(): ArsipBreadcrumbItem {
  return { label: 'Arsip SOP', to: ROUTES.ARSIP.PREFIX }
}
