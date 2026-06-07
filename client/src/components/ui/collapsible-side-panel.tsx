import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

export type CollapsibleSidePanelSide = 'left' | 'right'

export interface CollapsibleSidePanelTab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export interface CollapsibleSidePanelProps {
  side: CollapsibleSidePanelSide
  collapsed: boolean
  widthCollapsed?: string
  widthExpanded: string
  className?: string
  children: React.ReactNode
}

export const CollapsibleSidePanel = React.forwardRef<HTMLDivElement, CollapsibleSidePanelProps>(
  (
    {
      side,
      collapsed,
      widthCollapsed = 'w-12',
      widthExpanded,
      className,
      children,
    },
    ref
  ) => {
    const isRight = side === 'right'

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
        {children}
      </div>
    )
  }
)
CollapsibleSidePanel.displayName = 'CollapsibleSidePanel'

/* ─── Composable sub-components for new code ────────────────────────────── */

export interface CollapsedStripButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  /** Alias for `title` (HTML attribute) with clearer intent */
  tooltip?: string
}

export const CollapsedStripButton = React.forwardRef<HTMLButtonElement, CollapsedStripButtonProps>(
  ({ icon, label, tooltip, title: htmlTitle, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn('h-full w-full flex flex-col items-center justify-center gap-1 rounded-none border-0 py-4 min-h-0', className)}
      title={tooltip ?? htmlTitle ?? label ?? 'Buka panel'}
      {...props}
    >
      {icon}
      {label && (
        <span className="text-[10px] text-gray-500 leading-tight max-w-full truncate">
          {label}
        </span>
      )}
    </Button>
  )
)
CollapsedStripButton.displayName = 'CollapsedStripButton'

export interface CollapsibleSidePanelHeaderProps {
  side: CollapsibleSidePanelSide
  onCollapse: () => void
  className?: string
  children: React.ReactNode
}

export function CollapsibleSidePanelHeader({
  side,
  onCollapse,
  className,
  children,
}: CollapsibleSidePanelHeaderProps) {
  const isRight = side === 'right'
  const ChevronIcon = isRight ? ChevronRight : ChevronLeft

  return (
    <div className={cn('flex items-center gap-2 flex-shrink-0 p-2 justify-between border-b border-gray-200', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 shrink-0"
        onClick={onCollapse}
        title="Sembunyikan panel"
      >
        <ChevronIcon className="w-4 h-4" />
      </Button>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

export interface SimplePanelHeaderProps {
  title: string
  subtitle?: React.ReactNode
}

export function SimplePanelHeader({ title, subtitle }: SimplePanelHeaderProps) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold text-gray-700 truncate">{title}</h3>
      {subtitle != null && <span className="text-[10px] text-gray-500">{subtitle}</span>}
    </div>
  )
}

export interface PanelTab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: React.ReactNode
}

export interface PanelTabStripProps {
  tabs: PanelTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function PanelTabStrip({ tabs, activeTab, onTabChange }: PanelTabStripProps) {
  return (
    <div className="flex flex-1 min-w-0 rounded-md bg-gray-100 p-0.5 gap-0.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            title={tab.label}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors',
              isActive
                ? 'flex-none shrink-0 bg-white text-gray-900 shadow-sm'
                : 'flex-1 min-w-0 text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.icon && (
              <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                {tab.icon}
              </span>
            )}
            <span className={cn(isActive ? 'whitespace-nowrap' : 'sr-only')}>
              {tab.label}
            </span>
            {tab.badge && <span className="text-[10px] opacity-80">{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}

export interface CollapsibleSidePanelContentProps {
  className?: string
  children: React.ReactNode
}

export function CollapsibleSidePanelContent({ className, children }: CollapsibleSidePanelContentProps) {
  return (
    <div className={cn('flex-1 min-h-0 overflow-auto scrollbar-hide', className)}>
      {children}
    </div>
  )
}
