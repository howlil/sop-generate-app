import { Layers } from 'lucide-react'
import { getPengajuanStatusColors } from '@/lib/status/pengajuan-status.config'
import { DomainStatusBadge } from './domain-status-badge'

export interface PengajuanStatusBadgeProps {
  status: string
  label: string
  className?: string
  showDomain?: boolean
}

export function PengajuanStatusBadge({
  status,
  label,
  className,
  showDomain = true,
}: PengajuanStatusBadgeProps) {
  return (
    <DomainStatusBadge
      domainLabel="Pengajuan evaluasi"
      label={label}
      colors={getPengajuanStatusColors(status)}
      className={className}
      showDomain={showDomain}
      icon={<Layers className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />}
    />
  )
}
