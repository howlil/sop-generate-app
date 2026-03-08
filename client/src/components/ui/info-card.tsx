import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InfoCardProps {
  children: ReactNode
  /** Color variant for contextual cards (success, warning, neutral). */
  variant?: 'neutral' | 'success' | 'warning' | 'info'
  className?: string
}

const VARIANT_MAP: Record<string, string> = {
  neutral: 'bg-gray-50 border-gray-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
}

/**
 * A small info/note card used for contextual information, warnings, and callouts.
 * Replaces the ~15 instances of `<div className="p-3 bg-gray-50 rounded-lg border border-gray-200">`.
 */
export function InfoCard({ children, variant = 'neutral', className }: InfoCardProps) {
  return (
    <div className={cn('p-3 rounded-lg border text-xs', VARIANT_MAP[variant], className)}>
      {children}
    </div>
  )
}
