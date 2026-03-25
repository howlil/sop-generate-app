import * as React from 'react'
import { cn } from '@/utils/cn'

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

/**
 * Layout workspace untuk halaman detail: header (opsional) + area utama + panel samping.
 * - Dua kolom: main + rightPanel (detail SOP tim penyusun, kepala OPD).
 * - Tiga kolom: leftPanel + main + rightPanel (detail penugasan evaluasi, pelaksanaan evaluasi).
 */
export function DetailWorkspace({
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
