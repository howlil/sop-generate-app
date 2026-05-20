import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

export interface SearchableSelectDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  searchPlaceholder: string
  items: T[]
  existingIds?: readonly string[]
  getId: (item: T) => string
  getSearchText: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  emptyMessage: string
  emptySearchMessage: string
  confirmLabel?: string
  cancelLabel?: string
  contentClassName?: string
  listClassName?: string
  itemClassName?: string
  onConfirm: (selectedIds: string[]) => void
}

export function SearchableSelectDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  searchPlaceholder,
  items,
  existingIds = [],
  getId,
  getSearchText,
  renderItem,
  emptyMessage,
  emptySearchMessage,
  confirmLabel = 'Tambahkan',
  cancelLabel = 'Batal',
  contentClassName = 'max-w-lg',
  listClassName = 'h-[220px]',
  itemClassName,
  onConfirm,
}: SearchableSelectDialogProps<T>) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIds([])
    }
  }, [open])

  const existingIdSet = useMemo(() => new Set(existingIds), [existingIds])
  const normalizedQuery = query.trim().toLowerCase()
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(normalizedQuery),
    )
  }, [getSearchText, items, normalizedQuery])

  const handleClose = () => {
    setQuery('')
    setSelectedIds([])
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
    handleClose()
  }

  const toggle = (id: string) => {
    if (existingIdSet.has(id)) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          contentClassName,
          'max-h-[90vh] overflow-y-auto scrollbar-hide',
        )}
      >
        <div className="flex flex-col">
          <DialogHeader className="px-4 pt-3 pb-2">
            <DialogTitle className="text-sm">{title}</DialogTitle>
            {description != null ? (
              <DialogDescription className="text-xs text-gray-500 mt-1 leading-snug">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="px-4 pb-2">
            <SearchInput
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full max-w-none border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-8 px-2.5"
              inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
            />
          </div>

          <div className="px-4 pb-3 border-t border-gray-100 pt-2">
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className={cn('overflow-auto scrollbar-hide', listClassName)}>
                <div className="divide-y divide-gray-100">
                  {filteredItems.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500">
                      {items.length === 0 ? emptyMessage : emptySearchMessage}
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const id = getId(item)
                      const already = existingIdSet.has(id)
                      const selected = selectedIds.includes(id)
                      return (
                        <div
                          key={id}
                          role="button"
                          tabIndex={already ? -1 : 0}
                          aria-disabled={already}
                          aria-pressed={selected}
                          className={cn(
                            'w-full text-left py-2 px-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded',
                            already && 'opacity-60 cursor-not-allowed',
                            itemClassName,
                          )}
                          onClick={() => toggle(id)}
                          onKeyDown={(e) => {
                            if (already) return
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggle(id)
                            }
                          }}
                        >
                          <span
                            className={cn(
                              'mt-0.5 h-3 w-3 shrink-0 rounded border flex items-center justify-center',
                              selected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 bg-white',
                            )}
                            aria-hidden
                          >
                            {selected ? <Check className="h-2 w-2 text-white" /> : null}
                          </span>
                          {renderItem(item)}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 gap-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClose}
            >
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={selectedIds.length === 0}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
