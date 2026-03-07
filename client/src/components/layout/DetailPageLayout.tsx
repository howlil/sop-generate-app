import { BackButton } from '@/components/ui/back-button'
import { PageHeader } from '@/components/layout/PageHeader'
import { DetailWorkspace } from '@/components/layout/DetailWorkspace'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

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
  main: React.ReactNode
  /** Panel kiri (opsional) */
  leftPanel?: React.ReactNode
  /** Panel kanan (opsional) */
  rightPanel?: React.ReactNode
  className?: string
  workspaceClassName?: string
}

/**
 * Layout standar halaman detail: PageHeader (dengan BackButton) + DetailWorkspace.
 * Dipakai di DetailSOP, DetailPenugasanEvaluasi, DetailSOPPenyusun, PelaksanaanEvaluasi, dll.
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
  leftPanel,
  rightPanel,
  className,
  workspaceClassName,
}: DetailPageLayoutProps) {
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
        main={main}
        rightPanel={rightPanel}
      />
    </div>
  )
}
