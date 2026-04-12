import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

/* ─── Full-page 404 ─────────────────────────────────────────────────────── */

export interface NotFoundPageProps {
  title?: string
  description?: string
  homeLabel?: string
  homeTo?: string
  className?: string
}

export function NotFoundPage({
  title = 'Halaman tidak ditemukan',
  description = 'URL yang Anda akses tidak ada atau telah dipindahkan.',
  homeLabel = 'Kembali ke Beranda',
  homeTo = '/',
  className,
}: NotFoundPageProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 px-4 py-12',
        className
      )}
    >
      <div className="w-full max-w-md mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-lg font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link to={homeTo}>
              <Home className="w-4 h-4" />
              {homeLabel}
            </Link>
          </Button>
          <Button
            variant="outline"
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

/* ─── Inline "resource tidak ditemukan" ─────────────────────────────────── */

export interface NotFoundWithBackProps {
  message?: string
  backAction: ReactNode
  children?: ReactNode
  className?: string
}

export function NotFoundWithBack({
  message = 'Data tidak ditemukan.',
  backAction,
  children,
  className,
}: NotFoundWithBackProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-gray-50 p-6 max-w-lg',
        className
      )}
    >
      <div className="flex gap-4">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
          <FileQuestion className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
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
