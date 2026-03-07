import { ItemListCard } from '@/components/ui/item-list-card'
import { StatusBadge } from '@/components/ui/status-badge'
import type { StatusDomain } from '@/lib/constants/status-domains'

export interface SOPListItem {
  id: string
  nama: string
  nomor: string
  status?: string
}

export interface SOPListCardProps {
  /** Satu atau lebih SOP; satu item tanpa onSelect = card read-only */
  items: SOPListItem[]
  /** ID yang sedang dipilih (untuk list dengan onSelect) */
  selectedId?: string | null
  /** Jika ada, item di-render sebagai button dan onSelect dipanggil saat klik */
  onSelect?: (id: string) => void
  /** Domain untuk StatusBadge (e.g. "sop") */
  statusDomain?: StatusDomain
  /** Class tambahan untuk wrapper */
  className?: string
  /** Tidak dipakai lagi; card selalu tampil nama + status saja */
  variant?: 'default' | 'compact'
}

const STATUS_DOMAIN_BADGE: StatusDomain = 'sop'

/**
 * Daftar SOP: memakai ItemListCard generik dengan mapping SOP → primary/secondary.
 * Design konsisten di semua halaman (tim penyusun, kepala OPD, tim evaluasi, kepala biro).
 */
export function SOPListCard({
  items,
  selectedId = null,
  onSelect,
  statusDomain = STATUS_DOMAIN_BADGE,
  className,
}: SOPListCardProps) {
  return (
    <ItemListCard<SOPListItem>
      items={items}
      getKey={(sop) => sop.id}
      renderPrimary={(sop) => sop.nama}
      renderSecondary={(sop) =>
        sop.status ? (
          <StatusBadge
            status={sop.status}
            domain={statusDomain}
            className="text-[10px] h-auto"
          />
        ) : null
      }
      emptyMessage="Tidak ada SOP"
      selectedId={selectedId}
      onSelect={onSelect}
      className={className}
      getItemTitle={(sop) => sop.nama}
    />
  )
}
