import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

/* ─── Full-page 404 (untuk route tidak ditemukan) ─────────────────────────── */

export interface NotFoundPageProps {
  /** Judul, default: "Halaman tidak ditemukan" */
  title?: string
  /** Deskripsi, default pesan standar */
  description?: string
  /** Label tombol utama, default: "Kembali ke Beranda" */
  homeLabel?: string
  /** URL beranda, default: "/" */
  homeTo?: string
  className?: string
}

/**
 * Halaman 404 full-page yang profesional.
 * Dipakai sebagai notFoundComponent di root route atau halaman dedicated.
 */
export function NotFoundPage({
  title = 'Halaman tidak ditemukan',
  description = 'URL yang Anda akses tidak ada atau telah dipindahkan. Periksa kembali alamat atau gunakan tombol di bawah untuk kembali.',
  homeLabel = 'Kembali ke Beranda',
  homeTo = '/',
  className,
}: NotFoundPageProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-12',
        className
      )}
    >
      <div className="w-full max-w-md mx-auto text-center">
        {/* Icon + 404 */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200/80">
            <FileQuestion className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
          </div>
          <span
            className="absolute -bottom-1 -right-2 text-5xl font-semibold tabular-nums text-gray-200 select-none"
            aria-hidden
          >
            404
          </span>
        </div>

        <h1 className="text-lg font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="default" className="gap-2">
            <Link to={homeTo}>
              <Home className="w-4 h-4" />
              {homeLabel}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Inline "resource tidak ditemukan" + tombol kembali ─────────────────── */

export interface NotFoundWithBackProps {
  /** Pesan utama, e.g. "Penugasan tidak ditemukan." */
  message?: string
  /** Tombol kembali (pakai Link + Button atau Button onClick dengan navigate) */
  backAction: ReactNode
  /** Konten tambahan di bawah pesan */
  children?: ReactNode
  className?: string
}

/**
 * Blok "resource tidak ditemukan" + tombol kembali (untuk halaman detail).
 * Tampilan card dengan ikon dan tipografi yang jelas.
 */
export function NotFoundWithBack({
  message = 'Data tidak ditemukan.',
  backAction,
  children,
  className,
}: NotFoundWithBackProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-gray-50/80 p-6 sm:p-8 max-w-lg',
        className
      )}
    >
      <div className="flex gap-4">
        <div className="shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
          <FileQuestion className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Tidak ditemukan</h2>
          <p className="text-sm text-gray-600">{message}</p>
          {children}
          <div className="mt-4">{backAction}</div>
        </div>
      </div>
    </div>
  )
}
