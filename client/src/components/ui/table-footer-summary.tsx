import { Button } from '@/components/ui/button'

export interface TableFooterSummaryProps {
  /** Jumlah yang ditampilkan (biasanya filteredList.length) */
  displayedCount: number
  /** Total jumlah (biasanya full list length) */
  totalCount: number
  /** Label entitas, e.g. "SOP", "penugasan" */
  label?: string
  /** Tampilkan tombol paginasi placeholder (Sebelumnya / 1 / Selanjutnya). Default true. */
  showPagination?: boolean
  className?: string
}

/**
 * Footer tabel list: "Menampilkan X dari Y {label}" + optional tombol paginasi.
 * Dipakai di DaftarSOP, dan halaman list lain yang punya summary + paginasi.
 */
export function TableFooterSummary({
  displayedCount,
  totalCount,
  label = 'item',
  showPagination = true,
  className,
}: TableFooterSummaryProps) {
  return (
    <div
      className={
        className ??
        'border-t border-gray-200 p-3 flex items-center justify-between flex-wrap gap-2'
      }
    >
      <p className="text-xs text-gray-600">
        Menampilkan {displayedCount} dari {totalCount} {label}
      </p>
      {showPagination && (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-blue-50">
            1
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  )
}
