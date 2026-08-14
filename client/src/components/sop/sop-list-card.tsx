import { Button } from '@/components/ui/button'
import type { TahapPenilaianSop } from '@/lib/evaluasi/evaluasi-domain'
import { cn } from '@/utils/cn'

export interface SOPListItem {
  id: string
  nama: string
  nomor: string
  statusDokumen?: string
  statusDokumenLabel?: string
  hasilEvaluasi?: string
  hasilEvaluasiLabel?: string
  statusTindakLanjut?: string | null
  statusTindakLanjutLabel?: string | null
  tahapPenilaian?: TahapPenilaianSop
}

export interface SOPListCardProps {
  items: SOPListItem[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  className?: string
  variant?: 'default' | 'compact'
}

const ITEM_BASE_CLASS =
  'group relative w-full justify-start text-left h-auto rounded-md border px-2.5 py-2 text-xs transition-colors flex flex-col items-stretch'
const DEFAULT_ITEM_CLASS =
  'border-transparent bg-transparent text-secondary-foreground hover:border-border hover:bg-surface-subtle'
const DEFAULT_SELECTED_ITEM_CLASS =
  'border-border bg-surface text-foreground'
const COMPACT_ITEM_CLASS = DEFAULT_ITEM_CLASS
const COMPACT_SELECTED_ITEM_CLASS = DEFAULT_SELECTED_ITEM_CLASS

function getStatusChipClass(label?: string | null, status?: string | null) {
  const raw = `${status ?? ''} ${label ?? ''}`.toLowerCase()
  if (raw.includes('draft')) {
    return 'border-border bg-surface-muted text-secondary-foreground'
  }
  if (raw.includes('menunggu') || raw.includes('ttd') || raw.includes('tanda tangan')) {
    return 'border-warning/30 bg-warning/10 text-warning-foreground'
  }
  if (raw.includes('dalam') || raw.includes('proses') || raw.includes('penilaian')) {
    return 'border-primary/20 bg-primary-subtle/70 text-primary-hover'
  }
  if (raw.includes('ditolak') || raw.includes('cabut') || raw.includes('dicabut')) {
    return 'border-danger/30 bg-danger/10 text-danger'
  }
  if (raw.includes('berlaku') || raw.includes('sesuai') || raw.includes('selesai')) {
    return 'border-success-subtle bg-success-subtle/70 text-success-foreground'
  }
  return 'border-border bg-surface-muted text-secondary-foreground'
}

function StatusChip({
  label,
  status,
}: {
  label?: string | null
  status?: string | null
}) {
  if (!label) return null
  return (
    <span
      className={cn(
        'max-w-full truncate rounded-full border px-1.5 py-0.5 font-medium',
        getStatusChipClass(label, status),
      )}
      title={label}
    >
      {label}
    </span>
  )
}

function renderQuietStatus(sop: SOPListItem) {
  const statusDokumenLabel = sop.statusDokumenLabel
  const hasPenilaian =
    sop.hasilEvaluasi !== undefined && sop.hasilEvaluasiLabel !== undefined

  if (!statusDokumenLabel && !hasPenilaian && !sop.statusTindakLanjutLabel) return null

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] leading-4 text-muted-foreground">
      <StatusChip label={statusDokumenLabel} status={sop.statusDokumen} />
      {hasPenilaian ? (
        <StatusChip label={sop.hasilEvaluasiLabel} status={sop.hasilEvaluasi} />
      ) : null}
      <StatusChip
        label={sop.statusTindakLanjutLabel}
        status={sop.statusTindakLanjut}
      />
    </div>
  )
}

function getItemClassName(variant: SOPListCardProps['variant'], isSelected: boolean) {
  if (variant === 'compact') {
    return cn(
      ITEM_BASE_CLASS,
      COMPACT_ITEM_CLASS,
      isSelected && COMPACT_SELECTED_ITEM_CLASS,
    )
  }

  return cn(
    ITEM_BASE_CLASS,
    DEFAULT_ITEM_CLASS,
    isSelected && DEFAULT_SELECTED_ITEM_CLASS,
  )
}

function SopListItemButton({
  sop,
  isSelected,
  onSelect,
  variant,
}: {
  sop: SOPListItem
  isSelected: boolean
  onSelect: (id: string) => void
  variant: SOPListCardProps['variant']
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={isSelected}
      className={getItemClassName(variant, isSelected)}
      onClick={() => onSelect(sop.id)}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-transparent transition-colors',
          isSelected && 'bg-primary',
        )}
      />
      <p className="w-full truncate font-medium leading-snug">{sop.nama}</p>
      <div className="mt-0.5">{renderQuietStatus(sop)}</div>
    </Button>
  )
}

export function SOPListCard({
  items,
  selectedId = null,
  onSelect,
  className,
  variant = 'default',
}: SOPListCardProps) {
  if (items.length === 0) {
    return (
      <div className={cn('p-2 text-xs text-muted-foreground', className)}>
        Tidak ada SOP
      </div>
    )
  }

  return (
    <div className={cn(variant === 'compact' ? 'space-y-1.5' : 'space-y-1', className)}>
      {items.map((sop) => {
        const isSelected = selectedId === sop.id
        if (onSelect != null) {
          return (
            <SopListItemButton
              key={sop.id}
              sop={sop}
              isSelected={isSelected}
              onSelect={onSelect}
              variant={variant}
            />
          )
        }
        return (
          <div key={sop.id} className={getItemClassName(variant, isSelected)}>
            <span
              aria-hidden="true"
              className={cn(
                'absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-transparent transition-colors',
                isSelected && 'bg-primary',
              )}
            />
            <p className="w-full truncate font-medium leading-snug">{sop.nama}</p>
            <div className="mt-0.5">{renderQuietStatus(sop)}</div>
          </div>
        )
      })}
    </div>
  )
}
