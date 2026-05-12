import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface ItemListCardProps<T> {
  items: T[]
  getKey: (item: T) => string
  renderPrimary: (item: T) => ReactNode
  renderSecondary?: (item: T) => ReactNode
  emptyMessage?: string
  selectedId?: string | null
  onSelect?: (id: string) => void
  className?: string
  emptyClassName?: string
  itemClassName?: string
  selectedItemClassName?: string
}

const DEFAULT_ITEM_CLASS =
  'w-full justify-start text-left h-auto rounded-lg border px-2 py-1.5 text-xs transition-colors flex flex-col items-stretch border-gray-100 hover:bg-gray-50 text-gray-700'
const DEFAULT_SELECTED_CLASS = 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'

/**
 * List of items rendered as clickable/selectable cards.
 */
export function ItemListCard<T>({
  items,
  getKey,
  renderPrimary,
  renderSecondary,
  emptyMessage,
  selectedId = null,
  onSelect,
  className,
  emptyClassName,
  itemClassName = DEFAULT_ITEM_CLASS,
  selectedItemClassName = DEFAULT_SELECTED_CLASS,
}: ItemListCardProps<T>) {
  if (items.length === 0) {
    return (
      <div className={cn('p-2 text-xs text-gray-500', emptyClassName, className)}>
        {emptyMessage ?? 'Tidak ada data.'}
      </div>
    )
  }

    return (
      <div className={cn('space-y-1', className)}>
        {items.map((item) => {
        const id = getKey(item)
        const isSelected = selectedId === id
        const isSelectable = onSelect != null

        if (isSelectable) {
          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              className={cn(itemClassName, isSelected && selectedItemClassName)}
              onClick={() => onSelect(id)}
            >
              <p className="w-full truncate font-medium leading-snug">{renderPrimary(item)}</p>
              {renderSecondary && (
                <div className="mt-0.5">{renderSecondary(item)}</div>
              )}
            </Button>
          )
        }

        return (
          <div key={id} className={cn('px-2 py-1.5', itemClassName)}>
            <p className="w-full truncate font-medium leading-snug">{renderPrimary(item)}</p>
            {renderSecondary && (
              <div className="mt-0.5">{renderSecondary(item)}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
