import { FileText } from 'lucide-react'
import { getSopStatusColors } from '@/lib/status/sop-status.config'
import { DomainStatusBadge } from './domain-status-badge'

export interface SopStatusBadgeProps {
  status: string
  label: string
  className?: string
  showDomain?: boolean
}

export function SopStatusBadge({
  status,
  label,
  className,
  showDomain = true,
}: SopStatusBadgeProps) {
  return (
    <DomainStatusBadge
      domainLabel="Dokumen"
      label={label}
      colors={getSopStatusColors(status)}
      className={className}
      showDomain={showDomain}
      icon={<FileText className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />}
    />
  )
}
