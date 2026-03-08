/**
 * Dialog pilih keterkaitan POS untuk metadata SOP.
 */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export interface RelatedPosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: string[]
  existingRelatedSop: string[]
  onAdd: (newItems: string[]) => void
}

export function RelatedPosDialog({
  open,
  onOpenChange,
  options,
  existingRelatedSop,
  onAdd,
}: RelatedPosDialogProps) {
  const [query, setQuery] = useState('')
  const [selectedPos, setSelectedPos] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedPos([])
    }
  }, [open])

  const handleClose = () => {
    setQuery('')
    setSelectedPos([])
    onOpenChange(false)
  }

  const handleConfirm = () => {
    const additional = selectedPos.filter((x) => !existingRelatedSop.includes(x))
    onAdd([...existingRelatedSop, ...additional])
    handleClose()
  }

  const filtered = options.filter((x) =>
    x.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col" style={{ padding: 0 }}>
        <DialogHeader className="px-4 pt-3 pb-2">
          <DialogTitle className="text-sm">Pilih Keterkaitan POS</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 leading-snug">Cari POS yang terkait.</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <SearchInput
            placeholder="Cari POS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-8 px-2.5"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-gray-100">
                {filtered.map((x) => {
                  const already = existingRelatedSop.includes(x)
                  const selected = selectedPos.includes(x)
                  const toggle = () => {
                    if (already) return
                    setSelectedPos((prev) =>
                      prev.includes(x) ? prev.filter((v) => v !== x) : [...prev, x]
                    )
                  }
                  return (
                    <div
                      key={x}
                      role="button"
                      tabIndex={already ? -1 : 0}
                      aria-disabled={already}
                      aria-pressed={selected}
                      className={`w-full text-left py-2 px-3 hover:bg-gray-50 flex items-center gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
                        already ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      onClick={toggle}
                      onKeyDown={(e) => {
                        if (already) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggle()
                        }
                      }}
                    >
                      <span
                        className={`h-3 w-3 shrink-0 rounded border flex items-center justify-center ${
                          selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                        }`}
                        aria-hidden
                      >
                        {selected && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <p className="text-xs font-medium text-gray-900 leading-snug">{x}</p>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="px-4 py-3 gap-2 border-t border-gray-100">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleClose}>
            Batal
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={selectedPos.length === 0}
            onClick={handleConfirm}
          >
            Tambahkan
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
