import { useEffect, useId, useMemo, useState } from 'react'
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
  const selectionStatusId = useId()
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
              <DialogDescription className="mt-1 leading-snug">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="px-4 pb-2">
            <SearchInput
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full max-w-none rounded-control border border-border-strong bg-surface-subtle px-2.5 focus-within:border-primary focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary"
              inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
            />
          </div>

          <div className="px-4 pb-3 border-t border-border pt-2">
            <p
              id={selectionStatusId}
              className="mb-2 text-xs text-secondary-foreground"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {filteredItems.length} pilihan ditemukan
              {selectedIds.length > 0 ? ` · ${selectedIds.length} dipilih` : ''}
            </p>
            <div className="overflow-hidden rounded-control border border-border">
              <div
                className={cn('overflow-auto scrollbar-hide', listClassName)}
                aria-describedby={selectionStatusId}
              >
                <div className="divide-y divide-border">
                  {filteredItems.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      {items.length === 0 ? emptyMessage : emptySearchMessage}
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const id = getId(item)
                      const already = existingIdSet.has(id)
                      const selected = selectedIds.includes(id)
                      return (
                        <label
                          key={id}
                          className={cn(
                            'relative flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-control px-3 py-2 text-left transition-colors hover:bg-surface-subtle focus-within:z-[1] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1',
                            selected && 'bg-primary-subtle/70',
                            already && 'opacity-60 cursor-not-allowed',
                            itemClassName,
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selected || already}
                            disabled={already}
                            onChange={() => toggle(id)}
                          />
                          <span
                            className={cn(
                              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              selected || already
                                ? 'border-primary bg-primary'
                                : 'border-border-strong bg-surface',
                            )}
                            aria-hidden
                          >
                            {selected || already ? <Check className="h-3 w-3 text-white" /> : null}
                          </span>
                          <div className="min-w-0 flex-1">
                            {renderItem(item)}
                            {already ? <span className="sr-only"> Sudah ditambahkan.</span> : null}
                          </div>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 py-3 gap-2 border-t border-border">
            <Button
              variant="outline"
              size="default"
              onClick={handleClose}
            >
              {cancelLabel}
            </Button>
            <Button
              size="default"
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
