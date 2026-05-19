import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { StatusBadgeColors } from '@/lib/status/status-badge.types'

const BASE_CLASS =
  'inline-flex h-auto min-h-4 px-1.5 py-0.5 items-center rounded text-[10px] leading-tight border-0 align-middle gap-1'

export interface DomainStatusBadgeProps {
  domainLabel: string
  label: string
  colors: StatusBadgeColors
  className?: string
  icon?: ReactNode
  showDomain?: boolean
}

export function DomainStatusBadge({
  domainLabel,
  label,
  colors,
  className,
  icon,
  showDomain = true,
}: DomainStatusBadgeProps) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {showDomain ? (
        <span className="text-[10px] font-medium text-gray-500 shrink-0">{domainLabel}</span>
      ) : null}
      <Badge className={cn(BASE_CLASS, colors.bgColor, colors.color)}>
        <span className="inline-flex items-center gap-0.5">
          {icon}
          {label}
        </span>
      </Badge>
    </span>
  )
}
