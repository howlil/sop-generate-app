import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { getStatusBadgeConfig } from '@/lib/constants/status-badge-config'

export interface StatusBadgeProps {
  status: string
  className?: string
  /** Override label; jika tidak disediakan, pakai label dari config. */
  label?: ReactNode
}

const BASE_CLASS =
  'inline-flex h-4 px-1.5 items-center rounded text-xs border-0 align-middle'

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(status)
  const displayLabel = label ?? config.label

  return (
    <Badge className={cn(BASE_CLASS, config.className, className)}>
      {displayLabel}
    </Badge>
  )
}
