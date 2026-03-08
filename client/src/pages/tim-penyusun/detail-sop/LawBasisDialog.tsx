/**
 * Dialog pilih dasar hukum (peraturan) untuk metadata SOP.
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
import type { Peraturan } from '@/lib/types/peraturan'

export interface LawBasisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  peraturanList: Peraturan[]
  existingLawBasis: string[]
  onAdd: (newLabels: string[]) => void
}

export function LawBasisDialog({
  open,
  onOpenChange,
  peraturanList,
  existingLawBasis,
  onAdd,
}: LawBasisDialogProps) {
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
    const selectedPeraturan = peraturanList.filter((p) => selectedIds.includes(p.id))
    const additional = selectedPeraturan
      .map((p) => `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`)
      .filter((label) => !existingLawBasis.includes(label))
    onAdd([...existingLawBasis, ...additional])
    handleClose()
  }

  const berlakuList = peraturanList.filter((p) => p.status === 'Berlaku')
  const q = query.trim().toLowerCase()
  const filtered = q
    ? berlakuList.filter(
        (p) =>
          p.tentang.toLowerCase().includes(q) ||
          p.jenisPeraturan.toLowerCase().includes(q) ||
          `${p.nomor}/${p.tahun}`.includes(q)
      )
    : berlakuList

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col" style={{ padding: 0 }}>
        <DialogHeader className="px-4 pt-3 pb-2">
          <DialogTitle className="text-sm">Pilih Dasar Hukum</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1 leading-snug">
            Cari peraturan yang akan ditambahkan ke dasar hukum (nama, jenis, atau nomor/tahun).
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <SearchInput
            placeholder="Cari peraturan (nama, jenis, nomor)..."
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
                    {berlakuList.length === 0
                      ? 'Belum ada data peraturan.'
                      : 'Tidak ada peraturan yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  filtered.map((p) => {
                    const label = `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                    const already = existingLawBasis.includes(label)
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
                          <p className="text-xs font-medium text-gray-900 leading-snug">
                            {p.jenisPeraturan} No. {p.nomor}/{p.tahun}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">{p.tentang}</p>
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
