import { ItemListCard } from '@/components/ui/item-list-card'
import { StatusBadge } from '@/components/ui/status-badge'

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
  /** Class tambahan untuk wrapper */
  className?: string
  /** Tidak dipakai lagi; card selalu tampil nama + status saja */
  variant?: 'default' | 'compact'
}

/**
 * Daftar SOP: memakai ItemListCard generik dengan mapping SOP → primary/secondary.
 * Design konsisten di semua halaman (tim penyusun, kepala OPD, tim evaluasi, kepala biro).
 */
export function SOPListCard({
  items,
  selectedId = null,
  onSelect,
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
