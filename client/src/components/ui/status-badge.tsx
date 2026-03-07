import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { StatusDomain } from '@/lib/constants/status-domains'
import { getStatusBadgeConfig } from '@/lib/constants/status-badge-config'

export interface StatusBadgeProps {
  status: string
  domain: StatusDomain
  className?: string
  /** Override label; jika tidak disediakan, pakai label dari config (domain + status). */
  label?: ReactNode
}

const BASE_CLASS =
  'inline-flex h-4 px-1.5 items-center rounded text-xs border-0 align-middle'

export function StatusBadge({ status, domain, className, label }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(domain, status)
  const displayLabel = label ?? config.label

  return (
    <Badge className={cn(BASE_CLASS, config.className, className)}>
      {displayLabel}
    </Badge>
  )
}
