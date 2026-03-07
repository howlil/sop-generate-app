import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { EditableStringList } from '@/components/ui/editable-string-list'
import type { SOPDetailMetadata } from '@/lib/types/sop'

function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
}

export interface SOPHeaderSectionProps {
  metadata: SOPDetailMetadata
  onMetadataChange: <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => void
  implementers: { id: string; name: string }[]
  onImplementersChange: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
  onOpenLawBasisDialog: () => void
  onOpenRelatedPosDialog: () => void
}

export function SOPHeaderSection({
  metadata,
  onMetadataChange,
  implementers,
  onImplementersChange,
  onOpenLawBasisDialog,
  onOpenRelatedPosDialog,
}: SOPHeaderSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="rounded-md border border-gray-200">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-900">Header SOP</p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsCollapsed((v) => !v)}
          title={isCollapsed ? 'Tampilkan header SOP' : 'Sembunyikan header SOP'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          )}
        </Button>
      </div>

      <div className={`p-3 space-y-3 ${isCollapsed ? 'hidden' : ''}`}>
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
              onClick={onOpenLawBasisDialog}
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
              onClick={onOpenRelatedPosDialog}
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
  )
}
