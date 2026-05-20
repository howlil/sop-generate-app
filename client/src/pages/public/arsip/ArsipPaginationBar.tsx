import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ArsipPaginationBarProps {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function ArsipPaginationBar({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ArsipPaginationBarProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-center text-sm text-slate-500" aria-live="polite">
        {totalItems} hasil
      </p>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-500" aria-live="polite">
        Halaman {page} dari {totalPages} ({totalItems} hasil)
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
