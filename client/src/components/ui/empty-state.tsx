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
        <div className="mb-2 text-gray-400 [&_svg]:w-8 [&_svg]:h-8">
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
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
