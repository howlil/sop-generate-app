import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export type CollapsibleSidePanelSide = 'left' | 'right'

export interface CollapsibleSidePanelTab {
  id: string
  label: string
  icon?: React.ReactNode
  /** Optional badge/suffix (e.g. "2/3" for komentar) */
  badge?: React.ReactNode
}

export interface CollapsibleSidePanelProps {
  /** Posisi panel (mengatur border dan arah chevron) */
  side: CollapsibleSidePanelSide
  /** Panel dalam state collapsed (hanya strip tipis) */
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  /** Class lebar saat collapsed, e.g. "w-12" atau "w-10 min-w-[2.5rem]" */
  widthCollapsed?: string
  /** Class lebar saat expanded, e.g. "w-[min(380px,30%)] min-w-[280px]" */
  widthExpanded: string
  /** Tambahan class untuk wrapper */
  className?: string

  // ── Mode dengan tab (salah satu dengan simple title)
  /** Tab definitions; jika ada, header menampilkan tab strip */
  tabs?: CollapsibleSidePanelTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void

  // ── Mode simple (title + subtitle, tanpa tab)
  /** Judul panel (digunakan saat tidak pakai tabs) */
  title?: string
  /** Subtitle di bawah title (e.g. "3 dokumen") */
  subtitle?: React.ReactNode
  /** Label pada tombol expand saat collapsed (mode simple) */
  collapseButtonLabel?: string
  /** Icon pada tombol expand saat collapsed (mode simple); default MessageSquare-style strip */
  collapseButtonIcon?: React.ReactNode

  /** Konten panel (biasanya ScrollArea + children). Ditampilkan hanya saat expanded. */
  children: React.ReactNode
}

/**
 * Panel samping (kiri/kanan) yang bisa di-collapse. Dipakai di detail SOP (tim penyusun, kepala OPD),
 * detail penugasan evaluasi, pelaksanaan evaluasi, dll.
 * - Mode tab: header = chevron + tab strip + collapse button; content = children (pemanggil yang render per tab).
 * - Mode simple: header = title (+ optional subtitle) + collapse button; content = children.
 * Saat collapsed: strip tipis dengan tombol expand (icon + optional label).
 */
export const CollapsibleSidePanel = React.forwardRef<HTMLDivElement, CollapsibleSidePanelProps>(
  (
    {
      side,
      collapsed,
      onCollapsedChange,
      widthCollapsed = 'w-12',
      widthExpanded,
      className,
      tabs,
      activeTab,
      onTabChange,
      title,
      subtitle,
      collapseButtonLabel,
      collapseButtonIcon,
      children,
    },
    ref
  ) => {
    const isRight = side === 'right'
    const ChevronCollapse = isRight ? ChevronRight : ChevronLeft

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col flex-shrink-0 bg-white transition-[width] duration-200 overflow-hidden',
          isRight ? 'border-l border-gray-200' : 'border-r border-gray-200',
          collapsed ? widthCollapsed : widthExpanded,
          className
        )}
      >
        {collapsed ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-full w-full flex flex-col items-center justify-center gap-1 rounded-none border-0 py-4 min-h-0"
            onClick={() => onCollapsedChange(false)}
            title={collapseButtonLabel ?? (tabs?.[0]?.label ?? title ?? 'Buka panel')}
          >
            {collapseButtonIcon ?? tabs?.[0]?.icon ?? null}
            {(collapseButtonLabel ?? tabs?.[0]?.label) && (
              <span className="text-[10px] text-gray-500 leading-tight max-w-full truncate">
                {collapseButtonLabel ?? tabs?.[0]?.label}
              </span>
            )}
          </Button>
        ) : (
          <>
            <div
              className={cn(
                'flex items-center gap-2 flex-shrink-0 border-b border-gray-200',
                tabs ? 'p-3 justify-between' : 'p-2 border-gray-100 bg-gray-50 justify-between'
              )}
            >
              {tabs ? (
                <>
                  <div className="flex flex-1 min-w-0 rounded-md bg-gray-100 p-0.5 gap-0.5">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange?.(tab.id)}
                        className={cn(
                          'flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors',
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        {tab.icon && <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">{tab.icon}</span>}
                        <span className="truncate">{tab.label}</span>
                        {tab.badge && <span className="text-[10px] opacity-80">{tab.badge}</span>}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => onCollapsedChange(true)}
                    title="Sembunyikan panel"
                  >
                    <ChevronCollapse className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="min-w-0">
                    {title && <h3 className="text-xs font-semibold text-gray-700 truncate">{title}</h3>}
                    {subtitle != null && <span className="text-[10px] text-gray-500">{subtitle}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => onCollapsedChange(true)}
                    title="Sembunyikan panel"
                  >
                    <ChevronCollapse className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <ScrollArea className="flex-1 min-h-0">
              {children}
            </ScrollArea>
          </>
        )}
      </div>
    )
  }
)
CollapsibleSidePanel.displayName = 'CollapsibleSidePanel'
