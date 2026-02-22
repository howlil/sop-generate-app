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
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {leftPanel}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 overflow-hidden">
          {main}
        </div>
        {rightPanel}
      </div>
    </div>
  )
}
