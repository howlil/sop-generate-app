import { useEffect, useRef } from 'react'
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

/** Key stabil untuk mendeteksi perubahan halaman tanpa bergantung pada leading/actions (JSX = referensi baru tiap render). */
function getContentKey(breadcrumb: BreadcrumbItem[], title: string, description?: string): string {
  const b = breadcrumb.map((item) => item.label).join('>')
  return `${b}|${title}|${description ?? ''}`
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
  const contentKey = getContentKey(breadcrumb, title, description)

  // Simpan konten terbaru di ref agar effect bisa mengirim leading/actions terbaru
  // tanpa memasukkan leading/actions ke dependency (mereka JSX = referensi baru tiap render → infinite loop).
  const contentRef = useRef({ breadcrumb, title, description, leading, actions })
  contentRef.current = { breadcrumb, title, description, leading, actions }

  // Ref untuk setter agar tidak perlu [ctx] di dependency: ctx berubah setiap setHeaderContent
  // (provider re-render → useMemo value baru) → infinite loop jika [ctx, contentKey].
  const setHeaderContentRef = useRef(ctx?.setHeaderContent)
  setHeaderContentRef.current = ctx?.setHeaderContent

  useEffect(() => {
    const setHeaderContent = setHeaderContentRef.current
    if (!setHeaderContent) return
    const latest = contentRef.current
    setHeaderContent({
      breadcrumb: latest.breadcrumb,
      title: latest.title,
      description: latest.description,
      leading: latest.leading,
      actions: latest.actions,
    })
    return () => {
      setHeaderContentRef.current?.(null)
    }
  }, [contentKey])

  return null
}
