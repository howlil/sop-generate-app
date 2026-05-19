import { AlertCircle, CheckCircle } from 'lucide-react'
import { getHasilEvaluasiColors } from '@/lib/status/hasil-evaluasi.config'
import { DomainStatusBadge } from './domain-status-badge'

export interface HasilEvaluasiBadgeProps {
  hasil: string
  label: string
  className?: string
  showDomain?: boolean
}

export function HasilEvaluasiBadge({
  hasil,
  label,
  className,
  showDomain = true,
}: HasilEvaluasiBadgeProps) {
  const Icon =
    hasil === 'SESUAI'
      ? CheckCircle
      : hasil === 'PERLU_PERBAIKAN'
        ? AlertCircle
        : null
  return (
    <DomainStatusBadge
      domainLabel="Penilaian"
      label={label}
      colors={getHasilEvaluasiColors(hasil)}
      className={className}
      showDomain={showDomain}
      icon={Icon ? <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" aria-hidden /> : null}
    />
  )
}
