/**
 * Dialog untuk panel metadata SOP: pilih dasar hukum, keterkaitan POS, dan aktor pelaksana.
 * Dipakai hanya di DetailSOPMetadataPanel.
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>*]:!p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-sm">Pilih Dasar Hukum</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Cari peraturan yang akan ditambahkan ke dasar hukum (nama, jenis, atau nomor/tahun).
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-3">
          <SearchInput
            placeholder="Cari peraturan (nama, jenis, nomor)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-none border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-9 px-3"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500">
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
                        className={`w-full text-left py-4 px-4 hover:bg-gray-50 flex items-start gap-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
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
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center ${
                            selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-xs font-medium text-gray-900 leading-snug">
                            {p.jenisPeraturan} No. {p.nomor}/{p.tahun}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{p.tentang}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="px-5 py-5 gap-3 border-t border-gray-100">
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

// ----- PelaksanaDialog -----

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>*]:!p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-sm">Pilih Aktor Pelaksana</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Cari pelaksana yang akan ditambahkan (nama atau kode). Data dari Kelola Pelaksana SOP.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-3">
          <SearchInput
            placeholder="Cari pelaksana (nama)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-none border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-9 px-3"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500">
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
                        className={`w-full text-left py-4 px-4 hover:bg-gray-50 flex items-start gap-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
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
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center ${
                            selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {selected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-xs font-medium text-gray-900 leading-snug">{p.name}</p>
                          {p.id && (
                            <p className="text-[11px] text-gray-500 font-mono leading-relaxed">{p.id}</p>
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
        <DialogFooter className="px-5 py-5 gap-3 border-t border-gray-100">
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto [&>*]:!p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-sm">Pilih Keterkaitan POS</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-1.5 leading-relaxed">Cari POS yang terkait.</DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-3">
          <SearchInput
            placeholder="Cari POS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-md bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300 h-9 px-3"
            inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-xs"
          />
        </div>
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="max-h-[240px]">
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
                      className={`w-full text-left py-4 px-4 hover:bg-gray-50 flex items-center gap-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
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
                        className={`h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center ${
                          selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                        }`}
                        aria-hidden
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
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
        <DialogFooter className="px-5 py-5 gap-3 border-t border-gray-100">
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
