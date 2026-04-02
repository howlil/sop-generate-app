import { useEffect } from 'react'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'
import { usePageHeaderContext } from '@/components/layout/PageHeaderContext'

export interface PageHeaderProps {
  /** Item breadcrumb (urutan: parent → current). Item terakhir = halaman saat ini (boleh tanpa `to`) */
  breadcrumb: BreadcrumbItem[]
  /** Judul halaman */
  title: string
  /** Deskripsi singkat di bawah judul (opsional) */
  description?: string
  /** Konten di kiri (sebelah kiri judul), mis. tombol kembali */
  leading?: React.ReactNode
  /** Konten tambahan di kanan (tombol aksi, dll.) */
  actions?: React.ReactNode
  className?: string
}

/** Menyetel konten header ke konteks sehingga ditampilkan di header layout (breadcrumb + leading + title). Tidak me-render apa pun di body. */
export function PageHeader({
  breadcrumb,
  title,
  description,
  leading,
  actions,
}: PageHeaderProps) {
  const ctx = usePageHeaderContext()

  useEffect(() => {
    if (!ctx) return
    ctx.setHeaderContent({
      breadcrumb,
      title,
      description,
      leading,
      actions,
    })
    return () => {
      ctx.setHeaderContent(null)
    }
  }, [ctx, breadcrumb, title, description, leading, actions])

  return null
}
