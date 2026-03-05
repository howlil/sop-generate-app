import type { BreadcrumbItem } from '@/components/ui/breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'

export interface ListPageLayoutProps {
  /** Item breadcrumb */
  breadcrumb: BreadcrumbItem[]
  /** Judul halaman */
  title: string
  /** Deskripsi di bawah judul */
  description?: string
  /** Konten di kiri (mis. BackButton) */
  leading?: React.ReactNode
  /** Konten di kanan (tombol aksi) */
  actions?: React.ReactNode
  /** Toolbar di bawah header (mis. SearchToolbar dengan filter). Opsional. */
  toolbar?: React.ReactNode
  /** Konten utama (tabel, kartu, dll.) */
  children: React.ReactNode
  className?: string
}

/**
 * Layout standar halaman list: PageHeader + optional toolbar + children.
 * Dipakai di SOPSaya, DaftarSOPEvaluasi, DaftarSOP, ManajemenTimEvaluasi, dll.
 */
export function ListPageLayout({
  breadcrumb,
  title,
  description,
  leading,
  actions,
  toolbar,
  children,
  className,
}: ListPageLayoutProps) {
  return (
    <div className={className ?? 'space-y-3'}>
      <PageHeader
        breadcrumb={breadcrumb}
        title={title}
        description={description}
        leading={leading}
        actions={actions}
      />
      {toolbar}
      {children}
    </div>
  )
}
