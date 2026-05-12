import { ItemListCard } from '@/components/ui/item-list-card'
import { StatusBadge } from '@/components/ui/status-badge'

export interface SOPListItem {
  id: string
  nama: string
  nomor: string
  status?: string
  statusSop?: string
  statusEvaluasi?: string
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
 * Design konsisten di semua halaman (penyusun, kepala OPD, tim evaluasi, biro).
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
        ) : sop.statusSop || sop.statusEvaluasi ? (
          <div className="flex flex-col gap-1">
            {sop.statusSop ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">SOP</span>
                <StatusBadge status={sop.statusSop} className="text-[10px] h-auto" />
              </div>
            ) : null}
            {sop.statusEvaluasi ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500">Evaluasi</span>
                <StatusBadge status={sop.statusEvaluasi} className="text-[10px] h-auto" />
              </div>
            ) : null}
          </div>
        ) : null
      }
      emptyMessage="Tidak ada SOP"
      selectedId={selectedId}
      onSelect={onSelect}
      className={className}
    />
  )
}
