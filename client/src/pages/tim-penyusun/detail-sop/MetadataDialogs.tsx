/**
 * Dialog untuk panel metadata SOP: pilih dasar hukum dan pilih keterkaitan POS.
 * Keduanya dipakai hanya di DetailSOPMetadataPanel.
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

// ----- LawBasisDialog -----

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>*]:p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-sm">Pilih Dasar Hukum</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1">
            Cari peraturan yang akan ditambahkan ke dasar hukum (nama, jenis, atau nomor/tahun).
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <SearchInput
            placeholder="Cari peraturan (nama, jenis, nomor)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-none border border-gray-200 rounded-lg bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0"
          />
        </div>
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
            <ScrollArea className="h-[320px]">
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    {berlakuList.length === 0
                      ? 'Belum ada data peraturan.'
                      : 'Tidak ada peraturan yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  filtered.map((p) => {
                    const label = `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                    const already = existingLawBasis.includes(label)
                    const selected = selectedIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`w-full text-left p-3 hover:bg-gray-50 flex items-start gap-2 ${
                          already ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        disabled={already}
                        onClick={() => {
                          if (already) return
                          setSelectedIds((prev) =>
                            prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          )
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {p.jenisPeraturan} No. {p.nomor}/{p.tahun}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{p.tentang}</p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="p-4 pt-3 gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleClose}>
            Batal
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={selectedIds.length === 0}
            onClick={handleConfirm}
          >
            Tambahkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- RelatedPosDialog -----

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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Pilih Keterkaitan POS</DialogTitle>
          <DialogDescription className="text-xs">Cari POS yang terkait.</DialogDescription>
        </DialogHeader>
        <SearchInput
          placeholder="Cari POS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2 border border-gray-200 rounded-md px-0 py-0"
          inputClassName="border-0 focus:ring-0 focus:outline-none"
        />
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((x) => {
              const already = existingRelatedSop.includes(x)
              const selected = selectedPos.includes(x)
              return (
                <button
                  key={x}
                  type="button"
                  className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 ${
                    already ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={already}
                  onClick={() => {
                    if (already) return
                    setSelectedPos((prev) =>
                      prev.includes(x) ? prev.filter((v) => v !== x) : [...prev, x]
                    )
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                  />
                  <p className="text-xs font-medium text-gray-900">{x}</p>
                </button>
              )
            })}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleClose}>
            Batal
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={selectedPos.length === 0}
            onClick={handleConfirm}
          >
            Tambahkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
