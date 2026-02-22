import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InfoFieldProps {
  /** Label (e.g. "Tanggal", "OPD", "Status") */
  label: string
  /** Value — string or ReactNode (e.g. Badge, StatusBadge) */
  children: ReactNode
  /** Optional icon before the label. */
  icon?: ReactNode
  /** Layout direction. */
  direction?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * A label:value display pair used in detail pages, info cards, and grid layouts.
 * Replaces the ~30 instances of ad-hoc `<span class="text-gray-500">Label:</span> <span>Value</span>` patterns.
 */
export function InfoField({
  label,
  children,
  icon,
  direction = 'horizontal',
  className,
}: InfoFieldProps) {
  if (direction === 'vertical') {
    return (
      <div className={cn('min-w-0', className)}>
        <div className="flex items-center gap-1">
          {icon && <span className="text-gray-400 shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5">{icon}</span>}
          <span className="text-[11px] text-gray-500 leading-none">{label}</span>
        </div>
        <div className="text-xs font-medium text-gray-900 mt-0.5 truncate">{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5 min-w-0 text-xs', className)}>
      {icon && <span className="text-gray-400 shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5">{icon}</span>}
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 truncate">{children}</span>
    </div>
  )
}

export interface InfoGridProps {
  /** Number of columns on small / medium screens. */
  cols?: 2 | 3 | 4
  children: ReactNode
  className?: string
}

const COLS_MAP: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
}

/**
 * A responsive grid wrapper for InfoField items.
 * Replaces the ~10 instances of `<div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-600">`.
 */
export function InfoGrid({ cols = 2, children, className }: InfoGridProps) {
  return (
    <div className={cn('grid gap-x-4 gap-y-1.5', COLS_MAP[cols], className)}>
      {children}
    </div>
  )
}
