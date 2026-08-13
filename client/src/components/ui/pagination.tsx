import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";

export interface PaginationProps {
  /** Total jumlah item */
  totalItems: number
  /** Halaman saat ini (1-based) */
  currentPage: number
  /** Callback saat halaman berubah */
  onPageChange: (page: number) => void
  /** Jumlah per halaman. Default 10. */
  pageSize?: number
  /** Label entitas (opsional), e.g. "SOP" untuk "1–10 dari 24 SOP" */
  label?: string
  /** Tampilkan ringkasan jumlah saat hanya ada satu halaman. */
  showSinglePageSummary?: boolean
  className?: string
}

/** Pagination compact: info item + tombol Sebelumnya / halaman aktif / Selanjutnya. */
export function Pagination({
  totalItems,
  currentPage,
  onPageChange,
  pageSize = DEFAULT_PAGE_SIZE,
  label = '',
  showSinglePageSummary = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const start = (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalItems)
  const labelText = label ? ` ${label}` : ''

  if (totalItems <= pageSize) {
    if (!showSinglePageSummary) return null

    return (
      <p className={cn('text-center text-ui-body text-muted-foreground', className)} aria-live="polite">
        {totalItems}
        {labelText}
      </p>
    )
  }

  const canPrev = safePage > 1
  const canNext = safePage < totalPages

  return (
    <nav
      aria-label={`Navigasi halaman${labelText}`}
      className={cn(
        'flex flex-col items-stretch justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center',
        className
      )}
    >
      <p className="text-center text-ui-body text-secondary-foreground sm:text-left" aria-live="polite" aria-atomic="true">
        {start}–{end} dari {totalItems}
        {labelText}
      </p>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>
        <span className="min-w-[7rem] flex-1 text-center text-ui-body font-medium text-foreground sm:flex-none" aria-current="page">
          Halaman {safePage} dari {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
