import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const DEFAULT_PAGE_SIZE = 10

export interface PaginationProps {
  /** Total jumlah item */
  totalItems: number
  /** Halaman saat ini (1-based) */
  currentPage: number
  /** Callback saat halaman berubah */
  onPageChange: (page: number) => void
  /** Jumlah per halaman. Default 10. Pagination hanya tampil jika totalItems > pageSize. */
  pageSize?: number
  /** Label entitas (opsional), e.g. "SOP" untuk "1–10 dari 24 SOP" */
  label?: string
  className?: string
}

/**
 * Pagination compact: info "X–Y dari Z" + tombol Sebelumnya / nomor halaman / Selanjutnya.
 * Hanya di-render jika totalItems > pageSize (default 10). Sesuai design style guide (text-xs, h-8).
 */
export function Pagination({
  totalItems,
  currentPage,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  label = '',
  className,
}: PaginationProps) {
  if (totalItems <= pageSize) return null

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const start = (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)
  const labelText = label ? ` ${label}` : ''

  const canPrev = safePage > 1
  const canNext = safePage < totalPages

  const pageNumbers = getPageNumbers(safePage, totalPages)

  return (
    <div
      className={cn(
        'border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2',
        className
      )}
    >
      <p className="text-xs text-gray-600">
        {start}–{end} dari {totalItems}
        {labelText}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pageNumbers.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === safePage ? 'default' : 'outline'}
              size="sm"
              className={cn('h-8 min-w-[2rem] px-2 text-xs', p === safePage && 'bg-blue-500 hover:bg-blue-600')}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) return [1, 2, 3, '…', total]
  if (current >= total - 2) return [1, '…', total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}
