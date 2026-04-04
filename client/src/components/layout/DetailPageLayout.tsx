import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/layout/PageHeader'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

/**
 * DetailPageLayoutProps - Props for detail page layout
 * 
 * Standard layout for detail pages with:
 * - Page header with back button
 * - Workspace with main content + optional side panels
 * - Responsive 2-column or 3-column layout
 */
export interface DetailPageLayoutProps {
  /** Item breadcrumb. Opsional: null/undefined = tidak tampil breadcrumb. */
  breadcrumb?: BreadcrumbItem[] | null
  title: string
  description?: string
  /** Route atau path untuk tombol kembali */
  backTo: string
  /** Ukuran tombol kembali: 'icon' = hanya ikon, default = teks "Kembali" */
  backSize?: 'default' | 'icon'
  /** Aksi di header (tombol, badge) */
  actions?: React.ReactNode
  /** Blok header di dalam workspace (info, toolbar) */
  header?: React.ReactNode
  /** Konten utama */
  main?: React.ReactNode
  /** Alias for main - used in some pages */
  children?: React.ReactNode
  /** Panel kiri (opsional) */
  leftPanel?: React.ReactNode
  /** Panel kanan (opsional) */
  rightPanel?: React.ReactNode
  className?: string
  workspaceClassName?: string
}

/**
 * DetailPageLayout - Standard layout for detail pages
 * 
 * Used in:
 * - DetailSOP
 * - DetailVerifikasiBatch
 * - DetailSOPPenyusun
 * - PelaksanaanEvaluasi
 * 
 * Layout modes:
 * - 2 columns: main + rightPanel (SOP detail, Kepala OPD view)
 * - 3 columns: leftPanel + main + rightPanel (Evaluation assignment)
 * 
 * @example
 * ```tsx
 * <DetailPageLayout
 *   title="Detail SOP"
 *   backTo="/sop-saya"
 *   main={<SOPPreview />}
 *   rightPanel={<KomentarPanel />}
 * />
 * ```
 */
export function DetailPageLayout({
  breadcrumb,
  title,
  description,
  backTo,
  backSize = 'icon',
  actions,
  header,
  main,
  children,
  leftPanel,
  rightPanel,
  className,
  workspaceClassName,
}: DetailPageLayoutProps) {
  const mainContent = main ?? children
  return (
    <div className={className ?? 'flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3'}>
      <PageHeader
        breadcrumb={breadcrumb ?? []}
        title={title}
        description={description}
        leading={
          backSize === 'icon' ? (
            <BackButton size="icon" to={backTo} />
          ) : (
            <BackButton to={backTo} />
          )
        }
        actions={actions}
      />
      <DetailWorkspace
        className={workspaceClassName}
        header={header}
        leftPanel={leftPanel}
        main={mainContent}
        rightPanel={rightPanel}
      />
    </div>
  )
}
