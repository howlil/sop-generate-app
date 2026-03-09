import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface ItemListCardProps<T> {
  /** Daftar item */
  items: T[]
  /** Key unik per item */
  getKey: (item: T) => string
  /** Konten utama per item (judul/nama) */
  renderPrimary: (item: T) => ReactNode
  /** Konten sekunder (opsional, e.g. badge) */
  renderSecondary?: (item: T) => ReactNode
  /** Teks saat daftar kosong */
  emptyMessage: string
  /** ID item yang dipilih (untuk highlight) */
  selectedId?: string | null
  /** Callback saat item diklik; jika ada, item di-render sebagai button */
  onSelect?: (id: string) => void
  /** Class wrapper daftar */
  className?: string
  /** Class wrapper state kosong */
  emptyClassName?: string
  /** Class tiap item (button/div); default style list selectable */
  itemClassName?: string
  /** Class item saat terpilih */
  selectedItemClassName?: string
  /** Saat 1 item dan tidak ada onSelect: style kotak single (e.g. read-only card) */
  singleItemClassName?: string
  /** Optional: tooltip untuk item (jika renderPrimary bukan string) */
  getItemTitle?: (item: T) => string
}

const DEFAULT_ITEM_CLASS =
  'w-full justify-start text-left h-auto p-2 rounded-lg border text-xs transition-colors flex flex-col items-stretch border-gray-100 hover:bg-gray-50 text-gray-700'
const DEFAULT_SELECTED_CLASS =
  'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 hover:text-blue-900'
const DEFAULT_SINGLE_CLASS =
  'p-2 rounded-lg border border-blue-200 bg-blue-50 text-xs'

/**
 * Daftar item dengan tampilan card/button, optional selection.
 * Agnostic: tidak mengasumsikan SOP atau domain tertentu; konten sepenuhnya dari render props.
 */
export function ItemListCard<T>({
  items,
  getKey,
  renderPrimary,
  renderSecondary,
  emptyMessage,
  selectedId = null,
  onSelect,
  getItemTitle,
  className,
  emptyClassName,
  itemClassName = DEFAULT_ITEM_CLASS,
  selectedItemClassName = DEFAULT_SELECTED_CLASS,
  singleItemClassName = DEFAULT_SINGLE_CLASS,
}: ItemListCardProps<T>) {
  if (items.length === 0) {
    return (
      <div className={cn('p-2 text-xs text-gray-500', emptyClassName, className)}>
        {emptyMessage}
      </div>
    )
  }

  const isSelectable = onSelect != null && items.length >= 1

  if (items.length === 1 && !isSelectable) {
    const item = items[0]
    return (
      <div className={cn('p-2', className)}>
        <div className={singleItemClassName}>
          <p
            className="font-medium text-gray-900 truncate w-full"
            title={getItemTitle?.(item) ?? (typeof renderPrimary(item) === 'string' ? renderPrimary(item) as string : undefined)}
          >
            {renderPrimary(item)}
          </p>
          {renderSecondary && (
            <div className="mt-1">{renderSecondary(item)}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('p-2 space-y-1', className)}>
      {items.map((item) => {
        const id = getKey(item)
        const isSelected = selectedId === id
        return (
          <Button
            key={id}
            type="button"
            variant="ghost"
            className={cn(
              itemClassName,
              isSelected && selectedItemClassName
            )}
            onClick={() => onSelect?.(id)}
          >
            <p
              className="font-medium truncate w-full"
              title={getItemTitle?.(item) ?? (typeof renderPrimary(item) === 'string' ? renderPrimary(item) as string : undefined)}
            >
              {renderPrimary(item)}
            </p>
            {renderSecondary && (
              <div className="mt-1">{renderSecondary(item)}</div>
            )}
          </Button>
        )
      })}
    </div>
  )
}
