/**
 * Dialog pilih keterkaitan SOP untuk metadata header.
 * Sumber data: daftar SOP penyusun (judul + detailSopId terbaru).
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSopEditor } from '../SopEditorContext'

export interface RelatedSopOption {
  /** detailSopId terbaru dari header SOP yang relevan. */
  id: string
  /** Label tampilan (judul SOP). */
  label: string
}

export interface RelatedSopDialogResult {
  ids: string[]
  labels: string[]
}

export interface RelatedPosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Override opsional bila dipakai di luar editor SOP. */
  options?: RelatedSopOption[]
  /** Override label yang sudah terpasang. Default dari context. */
  existingRelatedSop?: string[]
  /** Override ID DetailSOP terpasang. Default dari context. */
  existingRelatedSopIds?: string[]
  onAdd: (next: RelatedSopDialogResult) => void
}

export function RelatedPosDialog({
  open,
  onOpenChange,
  options: optionsOverride,
  existingRelatedSop: existingRelatedSopOverride,
  existingRelatedSopIds: existingRelatedSopIdsOverride,
  onAdd,
}: RelatedPosDialogProps) {
  const { relatedSopOptions, metadata } = useSopEditor()
  const options = optionsOverride ?? relatedSopOptions
  const existingRelatedSop = existingRelatedSopOverride ?? metadata.relatedSop ?? []
  const existingRelatedSopIds = existingRelatedSopIdsOverride ?? metadata.relatedSopDetailIds ?? []
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  /* Reset state lokal saat dialog ditutup (sinkron UI, bukan fetch). */
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

  const existingIdSet = new Set(existingRelatedSopIds)

  const handleConfirm = () => {
    const additionalIds: string[] = []
    const additionalLabels: string[] = []
    for (const id of selectedIds) {
      if (existingIdSet.has(id)) continue
      const opt = options.find((o) => o.id === id)
      if (!opt) continue
      additionalIds.push(id)
      additionalLabels.push(opt.label)
    }
    onAdd({
      ids: [...existingRelatedSopIds, ...additionalIds],
      labels: [...existingRelatedSop, ...additionalLabels],
    })
    handleClose()
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col" style={{ padding: 0 }}>
        <DialogHeader className="px-4 pt-3 pb-2">
          <DialogTitle className="text-sm">Pilih Keterkaitan SOP</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 leading-snug">Cari SOP yang terkait.</DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <SearchInput
            placeholder="Cari SOP..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-8 px-2.5"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="max-h-[200px] overflow-auto scrollbar-hide">
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-500">
                    {options.length === 0
                      ? 'Belum ada SOP lain pada OPD ini.'
                      : 'Tidak ada SOP yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  filtered.map((opt) => {
                    const already = existingIdSet.has(opt.id)
                    const selected = selectedIds.includes(opt.id)
                    const toggle = () => {
                      if (already) return
                      setSelectedIds((prev) =>
                        prev.includes(opt.id)
                          ? prev.filter((v) => v !== opt.id)
                          : [...prev, opt.id],
                      )
                    }
                    return (
                      <div
                        key={opt.id}
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
                        <p className="text-xs font-medium text-gray-900 leading-snug">{opt.label}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
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
