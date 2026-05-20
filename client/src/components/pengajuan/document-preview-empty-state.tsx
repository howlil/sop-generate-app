import { cn } from '@/utils/cn'

export interface DocumentPreviewEmptyStateProps {
  message?: string
  className?: string
}

export function DocumentPreviewEmptyState({
  message = 'Tidak ada SOP untuk ditampilkan.',
  className,
}: DocumentPreviewEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[240px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500',
        className,
      )}
    >
      {message}
    </div>
  )
}
