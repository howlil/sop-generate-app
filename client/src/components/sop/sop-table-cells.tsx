import { SopStatusBadge } from '@/components/status/sop-status-badge'
import { formatDateIdLong } from '@/utils/format-date'

export function SopPrimaryCell({ title }: { title: string }) {
  return <p className="font-medium text-gray-900">{title}</p>
}

export function SopNumberCell({ value }: { value?: string | null }) {
  return <p className="font-mono text-gray-700 text-[11px]">{value ?? '-'}</p>
}

export function SopVersionCell({ value }: { value?: number | null }) {
  return (
    <p className="font-mono text-gray-700 text-sm tabular-nums">
      {value != null ? `V${value}` : '-'}
    </p>
  )
}

export function SopUpdatedByCell({
  name,
  date,
}: {
  name?: string | null
  date?: string | null
}) {
  if (name == null && date == null) {
    return <p className="text-gray-400 text-xs">-</p>
  }

  return (
    <div>
      <p className="text-gray-800 text-sm">{name ?? '-'}</p>
      {date ? (
        <p className="text-gray-400 text-xs mt-0.5">{formatDateIdLong(date)}</p>
      ) : null}
    </div>
  )
}

export function SopDateCell({ date }: { date?: string | null }) {
  return <p className="text-gray-700">{date ? formatDateIdLong(date) : '-'}</p>
}

export function SopStatusCell({
  status,
  label,
}: {
  status: string
  label?: string
}) {
  return <SopStatusBadge status={status} label={label ?? status} showDomain={false} />
}
