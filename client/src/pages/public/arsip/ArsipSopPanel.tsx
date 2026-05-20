import { FileText, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArsipPaginationBar } from './ArsipPaginationBar'
import { ArsipSopTable } from './ArsipSopTable'
import type { PublicSopItem } from '@/types/dto/sop-public.dto'
import type { PaginationMetaDto } from '@/types/dto/evaluasi.dto'

export interface ArsipSopPanelProps {
  title: string
  subtitle?: string
  items: PublicSopItem[]
  pagination?: PaginationMetaDto
  page: number
  onPageChange: (page: number) => void
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  showOpdColumn?: boolean
  selectedDetailSopId?: string
  onSelectSop: (sop: PublicSopItem) => void
  emptyTitle: string
  emptyHint: string
  embedded?: boolean
  hideHeader?: boolean
}

export function ArsipSopPanel({
  title,
  subtitle,
  items,
  pagination,
  page,
  onPageChange,
  isLoading,
  isError,
  isFetching,
  showOpdColumn = false,
  selectedDetailSopId,
  onSelectSop,
  emptyTitle,
  emptyHint,
  embedded = false,
  hideHeader = false,
}: ArsipSopPanelProps) {
  return (
    <section
      className={cn(
        'flex h-full min-h-0 flex-col bg-white',
        !embedded && 'min-h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] rounded-xl border border-slate-200 shadow-sm',
      )}
      aria-label={title}
    >
      {!hideHeader ? (
        <header className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {isLoading ? (
          <SopPanelSkeleton />
        ) : null}
        {isError ? (
          <Card className="border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
            Gagal memuat daftar SOP.
          </Card>
        ) : null}
        {!isLoading && !isError && items.length === 0 ? (
          <Card className="p-10 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden />
            <p className="font-medium text-slate-800">{emptyTitle}</p>
            <p className="mt-1 text-sm text-slate-500">{emptyHint}</p>
          </Card>
        ) : null}
        {!isLoading && !isError && items.length > 0 ? (
          <div aria-live="polite">
            <ArsipSopTable
              items={items}
              showOpdColumn={showOpdColumn}
              selectedDetailSopId={selectedDetailSopId}
              onSelectSop={onSelectSop}
            />
          </div>
        ) : null}
      </div>
      {isFetching && !isLoading ? (
        <p className="flex items-center justify-center gap-2 border-t border-slate-100 py-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Memperbarui…
        </p>
      ) : null}
      {pagination && !isLoading && !isError ? (
        <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
          <ArsipPaginationBar
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </section>
  )
}

function SopPanelSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  )
}
