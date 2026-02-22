import { Button } from '@/components/ui/button'
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
  /** Domain untuk StatusBadge (e.g. "sop") */
  statusDomain?: 'sop' | 'penugasan-evaluasi'
  /** Class tambahan untuk wrapper */
  className?: string
}

/**
 * Daftar SOP: satu card read-only (satu item, tanpa onSelect) atau list card yang bisa dipilih.
 * Design konsisten di semua halaman (tim penyusun, kepala OPD, tim evaluasi, kepala biro).
 */
export function SOPListCard({
  items,
  selectedId = null,
  onSelect,
  statusDomain = 'sop',
  className,
}: SOPListCardProps) {
  if (items.length === 0) {
    return (
      <div className={`p-2 text-xs text-gray-500 ${className ?? ''}`}>
        Tidak ada SOP
      </div>
    )
  }

  const isSelectable = onSelect != null && items.length >= 1

  if (items.length === 1 && !isSelectable) {
    const sop = items[0]
    return (
      <div className={`p-2 ${className ?? ''}`}>
        <div className="p-2 rounded-md border border-blue-200 bg-blue-50 text-xs">
          <span className="block font-medium text-gray-900 truncate" title={sop.nama}>
            {sop.nama}
          </span>
          <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
            {sop.nomor}
          </span>
          {sop.status && (
            <span className="mt-1 inline-block">
              <StatusBadge status={sop.status} domain={statusDomain} className="text-[10px] h-auto" />
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`p-2 space-y-1 ${className ?? ''}`}>
      {items.map((sop) => (
        <Button
          key={sop.id}
          type="button"
          variant="ghost"
          className={`w-full justify-start text-left h-auto p-2 rounded-md border text-xs transition-colors ${
            selectedId === sop.id
              ? 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:text-blue-900'
              : 'border-gray-100 hover:bg-gray-50 text-gray-700'
          }`}
          onClick={() => onSelect?.(sop.id)}
        >
          <span className="block font-medium truncate w-full text-left" title={sop.nama}>
            {sop.nama}
          </span>
          <span className="block text-[10px] text-gray-500 font-mono">{sop.nomor}</span>
          {sop.status && (
            <span className="mt-1 inline-block">
              <StatusBadge status={sop.status} domain={statusDomain} className="text-[10px] h-auto" />
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}
