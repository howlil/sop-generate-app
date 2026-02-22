import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface NotFoundWithBackProps {
  /** Pesan utama, e.g. "Penugasan tidak ditemukan." */
  message?: string
  /** Tombol kembali (pakai Link + Button atau Button onClick dengan navigate) */
  backAction: ReactNode
  /** Konten tambahan di bawah pesan */
  children?: ReactNode
  className?: string
}

/**
 * Blok "resource tidak ditemukan" + tombol kembali.
 * Gunakan di halaman detail ketika id tidak valid atau data null.
 * Contoh: backAction={<Link to="/tim-evaluasi/penugasan"><Button variant="outline" size="sm"><ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali</Button></Link>}
 * atau backAction={<Button variant="outline" size="sm" onClick={() => navigate({ to: '...' })}>...</Button>}
 */
export function NotFoundWithBack({
  message = 'Data tidak ditemukan.',
  backAction,
  children,
  className,
}: NotFoundWithBackProps) {
  return (
    <div className={cn('p-6', className)}>
      <p className="text-sm text-gray-600">{message}</p>
      {children}
      <div className="mt-4">{backAction}</div>
    </div>
  )
}
