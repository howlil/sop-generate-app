import type { ReactNode } from 'react'
import { Building2, FileText, Hash, ShieldAlert, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Textarea } from '@/components/ui/textarea'
import { EditableStringList } from '@/components/ui/editable-string-list'
import type { SOPDetailMetadata } from '@/types/ui/sop'
import { cn } from '@/utils/cn'
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

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <div>
        <h3 className="text-xs font-semibold text-gray-900">{title}</h3>
        {subtitle ? <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p> : null}
      </div>
    </div>
  )
}

function ReadOnlyTextBlock({
  value,
  placeholder,
  multiline = false,
}: {
  value: string
  placeholder: string
  multiline?: boolean
}) {
  const hasValue = value.trim().length > 0
  return (
    <div
      className={cn(
        'rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800',
        multiline ? 'whitespace-pre-wrap leading-relaxed min-h-[84px]' : 'min-h-9 flex items-center',
      )}
    >
      {hasValue ? value : <span className="text-gray-400">{placeholder}</span>}
    </div>
  )
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
  const { metadata, handleMetadataChange, implementers, setImplementers, isReadOnly } =
    useSopEditor()

  const roInput = isReadOnly ? 'cursor-default bg-gray-50 text-gray-800' : ''
  const institutionText = metadataInstitutionTextareaValue(metadata)
  const sopName = metadataDisplayName(metadata)
  const sopNumber = metadataDisplayNumber(metadata)

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-900 px-1">
        Header SOP{isReadOnly ? ' (lihat)' : ''}
      </p>
      <div className="space-y-4">
        <section className="space-y-3 rounded-md border border-gray-100 bg-white p-3">
          <SectionTitle
            icon={<Building2 className="h-3.5 w-3.5" />}
            title="Identitas Dokumen"
            subtitle="Informasi utama SOP untuk header dokumen."
          />
          <FormField label={<span className="font-semibold text-gray-900">Nama/Detail lembaga (4 baris)</span>}>
            {isReadOnly ? (
              <ReadOnlyTextBlock
                value={institutionText}
                placeholder="Belum diisi."
                multiline
              />
            ) : (
              <Textarea
                className={cn('text-xs min-h-[84px]', roInput)}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                value={institutionText}
                onChange={(e) => {
                  const lines = toLinesKeepEmpty(e.target.value)
                  handleMetadataChange('institutionLines', lines)
                  handleMetadataChange('lembaga', lines.join('\n'))
                }}
                placeholder="Baris 1&#10;Baris 2&#10;Baris 3&#10;Baris 4"
              />
            )}
          </FormField>
          <FormField label={<span className="font-semibold text-gray-900">Nama SOP</span>}>
            {isReadOnly ? (
              <ReadOnlyTextBlock value={sopName} placeholder="Belum ada nama SOP." />
            ) : (
              <AutoResizeTextarea
                className={cn('text-xs min-h-9 py-1.5', roInput)}
                minRows={1}
                maxRows={8}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                value={sopName}
                onChange={(e) => {
                  const v = e.target.value
                  handleMetadataChange('judul', v)
                  handleMetadataChange('nama', v)
                }}
                placeholder="Judul SOP"
              />
            )}
          </FormField>
          <FormField label={<span className="font-semibold text-gray-900">Nomor SOP</span>}>
            {isReadOnly ? (
              <ReadOnlyTextBlock value={sopNumber} placeholder="Belum ada nomor SOP." />
            ) : (
              <Input
                className={cn('h-9 text-xs', roInput)}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                value={sopNumber}
                onChange={(e) => {
                  const v = e.target.value
                  handleMetadataChange('nomorSOP', v)
                  handleMetadataChange('nomor', v)
                }}
                placeholder="Mis. 001/SOP/2026"
              />
            )}
          </FormField>
        </section>

        <section className="space-y-3 rounded-md border border-gray-100 bg-white p-3">
          <SectionTitle
            icon={<FileText className="h-3.5 w-3.5" />}
            title="Referensi Dokumen"
            subtitle="Dasar hukum dan keterkaitan dengan SOP lain."
          />

        <FormField label={<span className="font-semibold text-gray-900">Dasar hukum</span>}>
          {!isReadOnly ? (
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
          ) : null}
          <div className="space-y-1 mt-1.5">
            {(metadata.lawBasis ?? []).length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada dasar hukum.</p>
            ) : (
              (metadata.lawBasis ?? []).map((item: string, idx: number) => (
                <div key={`${idx}-${item}`} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">• {item}</p>
                  {!isReadOnly ? (
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
                  ) : null}
                </div>
              ))
            )}
          </div>
        </FormField>

        <FormField label={<span className="font-semibold text-gray-900">Keterkaitan dengan SOP</span>}>
          {!isReadOnly ? (
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
          ) : null}
          <div className="space-y-1 mt-1.5">
            {(metadata.relatedSop ?? []).length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada keterkaitan SOP.</p>
            ) : (
              (metadata.relatedSop ?? []).map((item: string, idx: number) => (
                <div key={`${idx}-${item}`} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">• {item}</p>
                  {!isReadOnly ? (
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
                  ) : null}
                </div>
              ))
            )}
          </div>
        </FormField>
        </section>

        <section className="space-y-3 rounded-md border border-gray-100 bg-white p-3">
          <SectionTitle
            icon={<Hash className="h-3.5 w-3.5" />}
            title="Ketentuan Pelaksanaan"
            subtitle="Informasi teknis pendukung pelaksanaan SOP."
          />

        <FormField label={<span className="font-semibold text-gray-900">Peringatan</span>}>
          {isReadOnly ? (
            <ul className="mt-1 space-y-1 list-disc pl-4">
              {asArray(metadata.warning).length === 0 ? (
                <li className="text-xs text-gray-500">Tidak ada peringatan.</li>
              ) : (
                asArray(metadata.warning).map((line, idx) => (
                  <li key={`${idx}-${line}`} className="text-xs text-gray-700">
                    {line}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <EditableStringList
              items={asArray(metadata.warning)}
              onChange={(next) => handleMetadataChange('warning', next)}
              placeholder="Peringatan"
              emptyMessage='Belum ada peringatan. Klik "Tambah" untuk menambahkan.'
            />
          )}
        </FormField>

        <FormField label={<span className="font-semibold text-gray-900">Kualifikasi pelaksanaan</span>}>
          {isReadOnly ? (
            <ul className="mt-1 space-y-1 list-disc pl-4">
              {asArray(metadata.implementQualification).length === 0 ? (
                <li className="text-xs text-gray-500">Belum ada kualifikasi.</li>
              ) : (
                asArray(metadata.implementQualification).map((line, idx) => (
                  <li key={`${idx}-${line}`} className="text-xs text-gray-700">
                    {line}
                  </li>
                ))
              )}
            </ul>
          ) : (
          <EditableStringList
            items={asArray(metadata.implementQualification)}
            onChange={(next) => handleMetadataChange('implementQualification', next)}
            placeholder="Kualifikasi"
            emptyMessage='Belum ada kualifikasi. Klik "Tambah" untuk menambahkan.'
          />
          )}
        </FormField>

        <FormField label={<span className="font-semibold text-gray-900">Peralatan dan perlengkapan</span>}>
          {isReadOnly ? (
            <ul className="mt-1 space-y-1 list-disc pl-4">
              {asArray(metadata.equipment).length === 0 ? (
                <li className="text-xs text-gray-500">Belum ada peralatan/perlengkapan.</li>
              ) : (
                asArray(metadata.equipment).map((line, idx) => (
                  <li key={`${idx}-${line}`} className="text-xs text-gray-700">
                    {line}
                  </li>
                ))
              )}
            </ul>
          ) : (
          <EditableStringList
            items={asArray(metadata.equipment)}
            onChange={(next) => handleMetadataChange('equipment', next)}
            placeholder="Peralatan"
            emptyMessage='Belum ada peralatan/perlengkapan. Klik "Tambah" untuk menambahkan.'
          />
          )}
        </FormField>

        <FormField label={<span className="font-semibold text-gray-900">Pencatatan dan pendataan</span>}>
          {isReadOnly ? (
            <ul className="mt-1 space-y-1 list-disc pl-4">
              {asArray(metadata.recordData).length === 0 ? (
                <li className="text-xs text-gray-500">Belum ada pencatatan/pendataan.</li>
              ) : (
                asArray(metadata.recordData).map((line, idx) => (
                  <li key={`${idx}-${line}`} className="text-xs text-gray-700">
                    {line}
                  </li>
                ))
              )}
            </ul>
          ) : (
          <EditableStringList
            items={asArray(metadata.recordData)}
            onChange={(next) => handleMetadataChange('recordData', next)}
            placeholder="Pencatatan"
            emptyMessage='Belum ada pencatatan/pendataan. Klik "Tambah" untuk menambahkan.'
          />
          )}
        </FormField>
        </section>

        <section className="space-y-3 rounded-md border border-gray-100 bg-white p-3">
          <SectionTitle
            icon={<Users className="h-3.5 w-3.5" />}
            title="Aktor Pelaksana"
            subtitle="Daftar pelaksana yang terlibat pada SOP."
          />

        <FormField label={<span className="font-semibold text-gray-900">Aktor pelaksana</span>}>
          {!isReadOnly ? (
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
          ) : null}
          <div className="space-y-1 mt-1.5">
            {implementers.length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada aktor pelaksana.</p>
            ) : (
              implementers.map((imp, idx) => (
                <div key={imp.id} className="flex items-start gap-2">
                  <p className="text-xs text-gray-700 flex-1">• {imp.name}</p>
                  {!isReadOnly ? (
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
                  ) : null}
                </div>
              ))
            )}
          </div>
        </FormField>
        </section>

        {isReadOnly ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-amber-700" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                Mode lihat aktif. Gunakan tab Edit pada dokumen yang dapat diubah untuk memperbarui metadata.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
