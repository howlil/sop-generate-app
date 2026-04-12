import * as React from 'react'
import { cn } from '@/utils/cn'
import { BackButton } from '@/components/ui/back-button'
import { SetPageHeader } from '@/components/layout/PageHeaderProvider'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

// ========================
// DetailWorkspace (internal)
// ========================

export interface DetailWorkspaceProps {
  /** Tambahan class untuk root (e.g. print:hidden) */
  className?: string
  /** Optional: header/toolbar atau blok info di atas (border-b) */
  header?: React.ReactNode
  /** Optional: panel kiri; jika ada = layout 3 kolom (kiri | main | kanan) */
  leftPanel?: React.ReactNode
  /** Konten panel utama (SOP preview / diagram / form) */
  main: React.ReactNode
  /** Panel kanan (biasanya CollapsibleSidePanel) */
  rightPanel?: React.ReactNode
}

function DetailWorkspace({
  className,
  header,
  leftPanel,
  main,
  rightPanel,
}: DetailWorkspaceProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col min-h-0 overflow-hidden rounded-lg border border-gray-200 bg-white',
        className
      )}
    >
      {header != null && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 min-h-[3rem]">
          {header}
        </div>
      )}
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {leftPanel != null && (
          <div className="border-b border-gray-200 lg:border-b-0 lg:border-r lg:max-w-[min(280px,40vw)] shrink-0 max-h-[min(50vh,360px)] lg:max-h-none overflow-auto">
            {leftPanel}
          </div>
        )}
        <div className="flex-1 flex flex-col min-w-0 min-h-[40vh] border-gray-200 overflow-hidden lg:border-r">
          {main}
        </div>
        {rightPanel != null && (
          <div className="border-t border-gray-200 lg:border-t-0 lg:border-l lg:max-w-[min(360px,45vw)] shrink-0 max-h-[min(55vh,480px)] lg:max-h-none overflow-auto">
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  )
}

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
      <SetPageHeader
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

/** Re-export for backward compatibility — old imports still work */
export { DetailWorkspace }
