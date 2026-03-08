/**
 * Dialog pilih aktor pelaksana untuk metadata SOP.
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

export interface PelaksanaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Daftar pelaksana dari master (Kelola Pelaksana SOP) */
  options: { id: string; name: string }[]
  existingImplementers: { id: string; name: string }[]
  onAdd: (newItems: { id: string; name: string }[]) => void
}

export function PelaksanaDialog({
  open,
  onOpenChange,
  options,
  existingImplementers,
  onAdd,
}: PelaksanaDialogProps) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIds([])
    }
  }, [open])

  const handleClose = () => {
    setQuery('')
    setSelectedIds([])
    onOpenChange(false)
  }

  const handleConfirm = () => {
    const additional = options
      .filter((p) => selectedIds.includes(p.id) && !existingImplementers.some((e) => e.id === p.id))
      .map((p) => ({ id: p.id, name: p.name }))
    onAdd([...existingImplementers, ...additional])
    handleClose()
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? options.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      )
    : options

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col" style={{ padding: 0 }}>
        <DialogHeader className="px-4 pt-3 pb-2">
          <DialogTitle className="text-sm">Pilih Aktor Pelaksana</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 leading-snug">
            Cari pelaksana yang akan ditambahkan (nama atau kode). Data dari Kelola Pelaksana SOP.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <SearchInput
            placeholder="Cari pelaksana (nama)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-none border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-8 px-2.5"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="h-[220px]">
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-500">
                    {options.length === 0
                      ? 'Belum ada data pelaksana. Kelola di menu Kelola Pelaksana SOP.'
                      : 'Tidak ada pelaksana yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  filtered.map((p) => {
                    const already = existingImplementers.some((e) => e.id === p.id)
                    const selected = selectedIds.includes(p.id)
                    const toggle = () => {
                      if (already) return
                      setSelectedIds((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                      )
                    }
                    return (
                      <div
                        key={p.id}
                        role="button"
                        tabIndex={already ? -1 : 0}
                        aria-disabled={already}
                        aria-pressed={selected}
                        className={`w-full text-left py-2 px-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
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
                          className={`mt-0.5 h-3 w-3 shrink-0 rounded border flex items-center justify-center ${
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
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs font-medium text-gray-900 leading-snug">{p.name}</p>
                          {p.id && (
                            <p className="text-[11px] text-gray-500 font-mono leading-snug">{p.id}</p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
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
            disabled={selectedIds.length === 0}
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
