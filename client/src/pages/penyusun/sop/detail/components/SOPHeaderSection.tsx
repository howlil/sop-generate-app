import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { EditableStringList } from '@/components/ui/editable-string-list'
import type { SOPDetailMetadata } from '@/types/ui/sop'
import { useSopEditor } from '../SopEditorContext'

/** Memecah teks jadi array baris; baris kosong dipertahankan agar Enter = baris baru. */
function toLinesKeepEmpty(value: string): string[] {
  return value.split('\n')
}

/** Sama seperti panel utama / `toPreviewMetadata`: judul & nomor dari field API. */
function metadataDisplayName(meta: SOPDetailMetadata): string {
  return meta.nama ?? meta.judul ?? meta.name ?? ''
}

function metadataDisplayNumber(meta: SOPDetailMetadata): string {
  return meta.nomorSOP ?? meta.nomor ?? meta.number ?? ''
}

/** Tampilan textarea lembaga: baris terstruktur atau teks `lembaga` mentah. */
function metadataInstitutionTextareaValue(meta: SOPDetailMetadata): string {
  if (meta.institutionLines !== undefined && meta.institutionLines.length > 0) {
    return meta.institutionLines.join('\n')
  }
  return meta.lembaga ?? ''
}

function asArray(v: string | string[] | undefined): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.length > 0) return [v]
  return []
}

export interface SOPHeaderSectionProps {
  onOpenLawBasisDialog: () => void
  onOpenRelatedPosDialog: () => void
  onOpenPelaksanaDialog?: () => void
}

/**
 * Form input header SOP. Mengonsumsi state metadata/implementers dari `useSopEditor()`.
 * Hanya menerima props untuk membuka dialog (state UI lokal milik panel).
 */
export function SOPHeaderSection({
  onOpenLawBasisDialog,
  onOpenRelatedPosDialog,
  onOpenPelaksanaDialog,
}: SOPHeaderSectionProps) {
  const { metadata, handleMetadataChange, implementers, setImplementers } = useSopEditor()

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-3 py-2">
        <p className="text-xs font-semibold text-gray-900">Header SOP</p>
      </div>

      <div className="space-y-3 p-3">
        <FormField label="Nama/Detail lembaga (4 baris)">
          <Textarea
            className="text-xs min-h-[84px]"
            value={metadataInstitutionTextareaValue(metadata)}
            onChange={(e) => {
              const lines = toLinesKeepEmpty(e.target.value)
              handleMetadataChange('institutionLines', lines)
              handleMetadataChange('lembaga', lines.join('\n'))
            }}
            placeholder="Baris 1&#10;Baris 2&#10;Baris 3&#10;Baris 4"
          />
        </FormField>

        <FormField label="Nama SOP">
          <Input
            className="h-9 text-xs"
            value={metadataDisplayName(metadata)}
            onChange={(e) => {
              const v = e.target.value
              handleMetadataChange('judul', v)
              handleMetadataChange('nama', v)
            }}
            placeholder="Judul SOP"
          />
        </FormField>

        <FormField label="Nomor SOP">
          <Input
            className="h-9 text-xs"
            value={metadataDisplayNumber(metadata)}
            onChange={(e) => {
              const v = e.target.value
              handleMetadataChange('nomorSOP', v)
              handleMetadataChange('nomor', v)
            }}
            placeholder="Mis. 001/SOP/2026"
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
                <div key={`${idx}-${item}`} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">{item}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                    onClick={() => {
                      const nextLabels = (metadata.lawBasis ?? []).filter((_, i) => i !== idx)
                      const nextIds = (metadata.lawBasisIds ?? []).filter((_, i) => i !== idx)
                      handleMetadataChange('lawBasis', nextLabels)
                      handleMetadataChange('lawBasisIds', nextIds)
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

        <FormField label="Keterkaitan dengan SOP">
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
              <p className="text-xs text-gray-500">Belum ada keterkaitan SOP.</p>
            ) : (
              (metadata.relatedSop ?? []).map((item: string, idx: number) => (
                <div key={`${idx}-${item}`} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">{item}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                    onClick={() => {
                      const nextLabels = (metadata.relatedSop ?? []).filter((_, i) => i !== idx)
                      const nextIds = (metadata.relatedSopDetailIds ?? []).filter((_, i) => i !== idx)
                      handleMetadataChange('relatedSop', nextLabels)
                      handleMetadataChange('relatedSopDetailIds', nextIds)
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
            value={metadata.warning ?? ''}
            onChange={(e) => handleMetadataChange('warning', e.target.value)}
          />
        </FormField>

        <FormField label="Kualifikasi pelaksanaan">
          <EditableStringList
            items={asArray(metadata.implementQualification)}
            onChange={(next) => handleMetadataChange('implementQualification', next)}
            placeholder="Kualifikasi"
            emptyMessage='Belum ada kualifikasi. Klik "Tambah" untuk menambahkan.'
          />
        </FormField>

        <FormField label="Peralatan dan perlengkapan">
          <EditableStringList
            items={asArray(metadata.equipment)}
            onChange={(next) => handleMetadataChange('equipment', next)}
            placeholder="Peralatan"
            emptyMessage='Belum ada peralatan/perlengkapan. Klik "Tambah" untuk menambahkan.'
          />
        </FormField>

        <FormField label="Pencatatan dan pendataan">
          <EditableStringList
            items={asArray(metadata.recordData)}
            onChange={(next) => handleMetadataChange('recordData', next)}
            placeholder="Pencatatan"
            emptyMessage='Belum ada pencatatan/pendataan. Klik "Tambah" untuk menambahkan.'
          />
        </FormField>

        <FormField label="Aktor pelaksana">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={onOpenPelaksanaDialog}
            >
              Tambah
            </Button>
          </div>
          <div className="space-y-1 mt-1.5">
            {implementers.length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada aktor pelaksana.</p>
            ) : (
              implementers.map((imp, idx) => (
                <div key={imp.id} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">{imp.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                    onClick={() =>
                      setImplementers((prev) => prev.filter((_, i) => i !== idx))
                    }
                    title="Hapus"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </FormField>
      </div>
    </div>
  )
}
