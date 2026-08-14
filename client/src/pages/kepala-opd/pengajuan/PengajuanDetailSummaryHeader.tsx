import type { ReactNode } from 'react'
import { PengajuanStatusBadge } from '@/components/status/pengajuan-status-badge'
import { formatDateIdFull } from '@/utils/format-date'

export interface PengajuanDetailSummaryHeaderProps {
  opdName: string
  jenis: string
  nomorBA?: string | null
  tanggalTTDBaPjPenyusun?: string | Date | null
  sopCount: number
  status: string
  statusLabel: string
  actions?: ReactNode
}

function SummaryField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-xs font-medium text-foreground">{children}</dd>
    </div>
  )
}

export function PengajuanDetailSummaryHeader({
  opdName,
  jenis,
  nomorBA,
  tanggalTTDBaPjPenyusun,
  sopCount,
  status,
  statusLabel,
  actions,
}: PengajuanDetailSummaryHeaderProps) {
  const baNumber = nomorBA?.trim() ? nomorBA : '—'

  return (
    <section className="rounded-surface border border-border bg-surface px-4 py-3 shadow-none">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Pengajuan Evaluasi</h2>
            <PengajuanStatusBadge
              status={status}
              label={statusLabel}
              showDomain={false}
            />
          </div>
          <p className="text-xs leading-relaxed text-secondary-foreground">
            <span className="font-medium text-foreground">{opdName || '—'}</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            {sopCount} dokumen
            <span className="mx-1.5 text-muted-foreground">·</span>
            BA <span className="font-mono text-foreground">{baNumber}</span>
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      <dl className="mt-3 grid gap-x-5 gap-y-2 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryField label="Jenis">{jenis || '—'}</SummaryField>
        <SummaryField label="Tanggal BA">
          {formatDateIdFull(tanggalTTDBaPjPenyusun)}
        </SummaryField>
        <SummaryField label="Jumlah SOP">{sopCount} dokumen</SummaryField>
      </dl>
    </section>
  )
}
