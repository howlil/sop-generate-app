import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { SearchInput } from '@/components/ui/search-input'
import { EditableStringList } from '@/components/ui/editable-string-list'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Peraturan } from '@/lib/types/peraturan'
import type { SOPDetailMetadata } from '@/lib/types/sop'
import { getRelatedPosOptions } from '@/lib/data/sop-detail'

function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
}

export interface DetailSOPMetadataPanelProps {
  metadata: SOPDetailMetadata
  onMetadataChange: <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => void
  implementers: { id: string; name: string }[]
  onImplementersChange: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
  peraturanList: Peraturan[]
}

export function DetailSOPMetadataPanel({
  metadata,
  onMetadataChange,
  implementers,
  onImplementersChange,
  peraturanList,
}: DetailSOPMetadataPanelProps) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isLawBasisOpen, setIsLawBasisOpen] = useState(false)
  const [lawBasisQuery, setLawBasisQuery] = useState('')
  const [selectedLawBasisIds, setSelectedLawBasisIds] = useState<string[]>([])
  const [isRelatedPosOpen, setIsRelatedPosOpen] = useState(false)
  const [relatedPosQuery, setRelatedPosQuery] = useState('')
  const [selectedRelatedPos, setSelectedRelatedPos] = useState<string[]>([])

  const relatedPosOptions = getRelatedPosOptions()

  return (
    <>
      <div className="p-3 space-y-4">
        {/* Section 1: Header SOP */}
        <div className="rounded-md border border-gray-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-900">Header SOP</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsHeaderCollapsed((v) => !v)}
              title={isHeaderCollapsed ? 'Tampilkan header SOP' : 'Sembunyikan header SOP'}
            >
              {isHeaderCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
              )}
            </Button>
          </div>

          <div className={`p-3 space-y-3 ${isHeaderCollapsed ? 'hidden' : ''}`}>
            <FormField label="Logo lembaga">
              <Input
                type="file"
                accept="image/*"
                className="h-9 text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    const result = typeof reader.result === 'string' ? reader.result : ''
                    if (!result) return
                    onMetadataChange('institutionLogo', result)
                  }
                  reader.readAsDataURL(file)
                }}
              />
              <p className="text-[11px] text-gray-500 mt-1">Disimpan sebagai data URL (mock).</p>
            </FormField>

            <FormField label="Nama/Detail lembaga (4 baris)">
              <Textarea
                className="text-xs min-h-[84px]"
                value={(metadata.institutionLines ?? []).join('\n')}
                onChange={(e) => onMetadataChange('institutionLines', toLines(e.target.value))}
                placeholder="Baris 1\nBaris 2\nBaris 3\nBaris 4"
              />
            </FormField>

            <FormField label="Nama SOP (read-only)">
              <Input
                className="h-9 text-xs bg-gray-50"
                value={metadata.name}
                readOnly
                disabled
              />
            </FormField>

            <FormField label="Nomor SOP (read-only)">
              <Input
                className="h-9 text-xs bg-gray-50"
                value={metadata.number}
                readOnly
                disabled
              />
            </FormField>

            <FormField label="Dasar hukum">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsLawBasisOpen(true)}
                >
                  Tambah
                </Button>
              </div>
              <div className="space-y-1 mt-1.5">
                {(metadata.lawBasis ?? []).length === 0 ? (
                  <p className="text-xs text-gray-500">Belum ada dasar hukum.</p>
                ) : (
                  (metadata.lawBasis ?? []).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <p className="text-xs text-gray-700 flex-1">{item}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                        onClick={() => {
                          const next = (metadata.lawBasis ?? []).filter((_, i) => i !== idx)
                          onMetadataChange('lawBasis', next)
                        }}
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </FormField>

            <FormField label="Keterkaitan dengan POS">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsRelatedPosOpen(true)}
                >
                  Tambah
                </Button>
              </div>
              <div className="space-y-1 mt-1.5">
                {(metadata.relatedSop ?? []).length === 0 ? (
                  <p className="text-xs text-gray-500">Belum ada keterkaitan POS.</p>
                ) : (
                  (metadata.relatedSop ?? []).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <p className="text-xs text-gray-700 flex-1">{item}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                        onClick={() => {
                          const next = (metadata.relatedSop ?? []).filter((_, i) => i !== idx)
                          onMetadataChange('relatedSop', next)
                        }}
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </FormField>

            <FormField label="Peringatan">
              <Input
                className="h-9 text-xs"
                value={metadata.warning}
                onChange={(e) => onMetadataChange('warning', e.target.value)}
              />
            </FormField>

            <FormField label="Kualifikasi pelaksanaan">
              <EditableStringList
                items={metadata.implementQualification ?? []}
                onChange={(next) => onMetadataChange('implementQualification', next)}
                placeholder="Kualifikasi"
                emptyMessage="Belum ada kualifikasi. Klik &quot;Tambah&quot; untuk menambahkan."
              />
            </FormField>

            <FormField label="Peralatan dan perlengkapan">
              <EditableStringList
                items={metadata.equipment ?? []}
                onChange={(next) => onMetadataChange('equipment', next)}
                placeholder="Peralatan"
                emptyMessage="Belum ada peralatan/perlengkapan. Klik &quot;Tambah&quot; untuk menambahkan."
              />
            </FormField>

            <FormField label="Pencatatan dan pendataan">
              <EditableStringList
                items={metadata.recordData ?? []}
                onChange={(next) => onMetadataChange('recordData', next)}
                placeholder="Pencatatan"
                emptyMessage="Belum ada pencatatan/pendataan. Klik &quot;Tambah&quot; untuk menambahkan."
              />
            </FormField>

            <FormField label="Aktor pelaksana">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() =>
                    onImplementersChange((prev) => [
                      ...prev,
                      { id: `impl-${prev.length + 1}`, name: `Aktor ${prev.length + 1}` },
                    ])
                  }
                >
                  Tambah
                </Button>
              </div>
              <div className="space-y-2 mt-1.5">
                {implementers.map((imp, idx) => (
                  <div key={imp.id} className="flex items-center gap-2">
                    <Input
                      className="h-9 text-xs flex-1"
                      value={imp.name}
                      onChange={(e) => {
                        const v = e.target.value
                        onImplementersChange((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, name: v } : p))
                        )
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
                      onClick={() => onImplementersChange((prev) => prev.filter((_, i) => i !== idx))}
                      title="Hapus"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </FormField>
          </div>
        </div>
      </div>

      {/* Dialog: pilih dasar hukum dari peraturan OPD (searchable) */}
      <Dialog open={isLawBasisOpen} onOpenChange={setIsLawBasisOpen}>
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
              value={lawBasisQuery}
              onChange={(e) => setLawBasisQuery(e.target.value)}
              className="w-full max-w-none border border-gray-200 rounded-lg bg-gray-50/50 focus-within:bg-white focus-within:border-gray-300"
              inputClassName="border-0 bg-transparent focus:ring-0 focus-visible:ring-0"
            />
          </div>
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
              <ScrollArea className="h-[320px]">
                <div className="divide-y divide-gray-100">
                  {(() => {
                    const berlakuList = peraturanList.filter((p) => p.status === 'Berlaku')
                    const q = lawBasisQuery.trim().toLowerCase()
                    const filtered = q
                      ? berlakuList.filter(
                          (p) =>
                            p.tentang.toLowerCase().includes(q) ||
                            p.jenisPeraturan.toLowerCase().includes(q) ||
                            `${p.nomor}/${p.tahun}`.includes(q)
                        )
                      : berlakuList
                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-gray-500">
                          {berlakuList.length === 0
                            ? 'Belum ada data peraturan.'
                            : 'Tidak ada peraturan yang cocok dengan pencarian.'}
                        </div>
                      )
                    }
                    return filtered.map((p) => {
                      const label = `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                      const already = (metadata.lawBasis ?? []).includes(label)
                      const selected = selectedLawBasisIds.includes(p.id)
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
                            setSelectedLawBasisIds((prev) =>
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
                  })()}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter className="p-4 pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsLawBasisOpen(false)
                setSelectedLawBasisIds([])
                setLawBasisQuery('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={selectedLawBasisIds.length === 0}
              onClick={() => {
                const selectedPeraturan = peraturanList.filter((p) =>
                  selectedLawBasisIds.includes(p.id)
                )
                const existing = metadata.lawBasis ?? []
                const additional = selectedPeraturan
                  .map(
                    (p) => `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                  )
                  .filter((label) => !existing.includes(label))
                onMetadataChange('lawBasis', [...existing, ...additional])
                setSelectedLawBasisIds([])
                setLawBasisQuery('')
                setIsLawBasisOpen(false)
              }}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: pilih keterkaitan POS (searchable) */}
      <Dialog open={isRelatedPosOpen} onOpenChange={setIsRelatedPosOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Pilih Keterkaitan POS</DialogTitle>
            <DialogDescription className="text-xs">Cari POS yang terkait.</DialogDescription>
          </DialogHeader>
          <SearchInput
            placeholder="Cari POS..."
            value={relatedPosQuery}
            onChange={(e) => setRelatedPosQuery(e.target.value)}
            className="mb-2 border border-gray-200 rounded-md px-0 py-0"
            inputClassName="border-0 focus:ring-0 focus:outline-none"
          />
          <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="divide-y divide-gray-100">
            {relatedPosOptions.filter((x) =>
                x.toLowerCase().includes(relatedPosQuery.toLowerCase())
              ).map((x) => {
                const already = (metadata.relatedSop ?? []).includes(x)
                const selected = selectedRelatedPos.includes(x)
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
                      setSelectedRelatedPos((prev) =>
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsRelatedPosOpen(false)
                setSelectedRelatedPos([])
                setRelatedPosQuery('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={selectedRelatedPos.length === 0}
              onClick={() => {
                const existing = metadata.relatedSop ?? []
                const additional = selectedRelatedPos.filter((x) => !existing.includes(x))
                onMetadataChange('relatedSop', [...existing, ...additional])
                setSelectedRelatedPos([])
                setRelatedPosQuery('')
                setIsRelatedPosOpen(false)
              }}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
