import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  /** Render as a table row with colspan */
  asTableRow?: boolean
  colSpan?: number
}

/**
 * Empty state display: icon + title + description + optional action.
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

/**
 * Empty state rendered as a table row.
 */
export function EmptyTableRow({
  icon,
  title,
  description,
  action,
  colSpan = 1,
  className,
}: Omit<EmptyStateProps, 'asTableRow'>) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
      asTableRow
      colSpan={colSpan}
      className={className}
    />
  )
}
