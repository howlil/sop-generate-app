import * as React from 'react'
import { cn } from '@/utils/cn'
import { BackButton } from '@/components/ui/back-button'
import { SetPageHeader } from '@/components/layout/PageHeaderProvider'
import type { BreadcrumbItem } from '@/components/ui/breadcrumb'

// ========================
// DetailWorkspace (internal)
// ========================

interface DetailWorkspaceProps {
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
        // Workspace shell: subtle depth + calmer background (main content tetap putih).
        'flex flex-1 flex-col min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm',
        className
      )}
    >
      {header != null && (
        <div
          data-print-hide
          className="flex-shrink-0 border-b border-slate-200/80 bg-white/70 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        >
          {header}
        </div>
      )}
      <div className="flex flex-1 min-h-0 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {leftPanel != null && (
          <div
            data-print-hide
            className="border-b border-slate-200/80 bg-slate-50/60 lg:border-b-0 lg:border-r lg:max-w-[min(300px,30vw)] shrink-0 max-h-[min(46vh,340px)] lg:max-h-none overflow-auto"
          >
            {leftPanel}
          </div>
        )}
        <div className="flex min-h-[40vh] min-w-0 flex-1 flex-col overflow-hidden bg-white px-2 py-2 sm:px-3 sm:py-3 lg:border-r lg:border-slate-200/80">
          {main}
        </div>
        {rightPanel != null && (
          <div
            data-print-hide
            className="border-t border-slate-200/80 bg-slate-50/60 lg:border-t-0 lg:border-l lg:max-w-[min(340px,28vw)] shrink-0 max-h-[min(52vh,440px)] lg:max-h-none overflow-auto"
          >
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
 *   rightPanel={<ActivityPanel />}
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
    <div className={className ?? 'flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-2 sm:gap-3'}>
      <div data-print-hide>
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
      </div>
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

