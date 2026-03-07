import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  /** Icon (e.g. FileText, Inbox). Optional. */
  icon?: ReactNode
  /** Judul atau kalimat utama */
  title: string
  /** Deskripsi tambahan (opsional) */
  description?: string
  /** Tombol atau link aksi (opsional) */
  action?: ReactNode
  className?: string
  /** Untuk tampilan di dalam tabel: satu sel colspan */
  asTableRow?: boolean
  colSpan?: number
  /** Class untuk wrapper icon. */
  iconClassName?: string
  /** Class untuk teks judul. */
  titleClassName?: string
  /** Class untuk teks deskripsi. */
  descriptionClassName?: string
  /** Class untuk wrapper aksi. */
  actionClassName?: string
}

/**
 * Tampilan kosong seragam: icon + judul + deskripsi + aksi.
 * Dipakai di list kosong, dialog kosong, atau state "tidak ada data".
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  asTableRow,
  colSpan = 1,
  iconClassName,
  titleClassName,
  descriptionClassName,
  actionClassName,
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6',
        !asTableRow && 'min-h-[120px]',
        className
      )}
    >
      {icon && (
        <div className={cn('mb-2 text-gray-400 [&_svg]:w-8 [&_svg]:h-8', iconClassName)}>
          {icon}
        </div>
      )}
      <p className={cn('text-sm text-gray-600', titleClassName)}>{title}</p>
      {description && (
        <p className={cn('text-xs text-gray-400 mt-1 max-w-sm', descriptionClassName)}>{description}</p>
      )}
      {action && <div className={cn('mt-3', actionClassName)}>{action}</div>}
    </div>
  )

  if (asTableRow) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-0 align-middle">
          {content}
        </td>
      </tr>
    )
  }

  return content
}
