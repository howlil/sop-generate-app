import { useEffect } from 'react'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'
import { usePageHeaderContext } from '@/components/layout/PageHeaderContext'

/**
 * PageHeader - Declarative header content setter
 * 
 * Sets header content (breadcrumb, title, actions) via PageHeaderContext.
 * Renders nothing (null) - only updates context for HeaderProfile to display.
 * 
 * @example
 * ```tsx
 * // In a page component
 * <PageHeader
 *   breadcrumb={[{ label: 'Home', to: '/' }, { label: 'SOP Saya' }]}
 *   title="SOP Saya"
 *   description="Daftar SOP yang Anda susun"
 *   actions={<Button>Buat SOP Baru</Button>}
 * />
 * ```
 */
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

/**
 * PageHeader component - sets header content via context
 * 
 * Usage pattern:
 * 1. Place <PageHeader> in page component
 * 2. Content appears in HeaderProfile (via context)
 * 3. Cleanup on unmount (removes header content)
 * 
 * @see PageHeaderContext - Context that stores header content
 * @see HeaderProfile - Component that displays header content
 */
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
