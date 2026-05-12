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
  onCollapsedChange: (collapsed: boolean) => void
  widthCollapsed?: string
  widthExpanded: string
  className?: string

  // ── Tab mode (optional)
  tabs?: CollapsibleSidePanelTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void

  // ── Simple mode (title + subtitle)
  title?: string
  subtitle?: React.ReactNode
  collapseButtonLabel?: string
  collapseButtonIcon?: React.ReactNode

  children: React.ReactNode
}

/**
 * Collapsible side panel.
 * Supports tab mode and simple mode for backward compatibility.
 *
 * For new code, prefer the composable API:
 *   <CollapsibleSidePanel>
 *     {collapsed ? <CollapsedStripButton ... /> : (
 *       <>
 *         <CollapsibleSidePanelHeader ...><PanelTabStrip ... /></CollapsibleSidePanelHeader>
 *         <CollapsibleSidePanelContent>...</CollapsibleSidePanelContent>
 *       </>
 *     )}
 *   </CollapsibleSidePanel>
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
    const ChevronExpand = isRight ? ChevronLeft : ChevronRight
    const hasTabs = tabs != null && tabs.length > 0

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
            {collapseButtonIcon ?? tabs?.[0]?.icon ?? <ChevronExpand className="w-4 h-4 text-gray-500" />}
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
                hasTabs ? 'p-2 justify-between' : 'border-gray-100 bg-gray-50/90 px-2 py-1.5 sm:px-2.5 justify-between'
              )}
            >
              {hasTabs ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => onCollapsedChange(true)}
                    title="Sembunyikan panel"
                  >
                    <ChevronCollapse className="w-4 h-4" />
                  </Button>
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
            <div className="flex-1 min-h-0 overflow-auto scrollbar-hide px-2 pb-2 pt-1 sm:px-2 sm:pb-2">
              {children}
            </div>
          </>
        )}
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
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
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
