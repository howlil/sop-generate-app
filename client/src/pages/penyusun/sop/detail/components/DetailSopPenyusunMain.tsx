import { useMemo } from 'react'
import { ListTree, RefreshCw } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/sop-preview-template'
import { DetailSOPProsedurEditor } from './DetailSopProsedurEditor'
import type { SOPDetailMetadata } from "@/types/ui/sop";
import { namaLembagaToInstitutionLines } from '@/lib/sop/detailSop.mappers'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useSopEditor } from '../SopEditorContext'

export interface DetailSOPPenyusunMainProps {
  activeTab: 'flowchart' | 'bpmn'
  onActiveTabChange: (tab: 'flowchart' | 'bpmn') => void
  isEditingSteps: boolean
  setIsEditingSteps: (editing: boolean) => void
  diagramVersion: number
  onDiagramVersionChange: () => void
}

function toArrayField(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

function toPreviewMetadata(meta: SOPDetailMetadata) {
  const institutionLines =
    meta.institutionLines !== undefined && meta.institutionLines.length > 0
      ? meta.institutionLines
      : namaLembagaToInstitutionLines(meta.lembaga);
  return {
    name: meta.nama ?? meta.judul ?? '',
    number: meta.nomorSOP ?? meta.nomor ?? '',
    lembaga: meta.lembaga,
    institutionLines,
    logoUrl: meta.logoUrl,
    version: meta.version ?? 1,
    createdDate: meta.tanggalPembuatan ?? '',
    revisionDate: meta.tanggalRevisi ?? '',
    effectiveDate: meta.tanggalEfektif ?? '',
    picName: meta.picName ?? '',
    picNumber: meta.picNumber ?? '',
    lawBasis: meta.lawBasis ?? [],
    relatedSop: meta.relatedSop ?? [],
    warning: toArrayField(meta.warning),
    implementQualification: toArrayField(meta.implementQualification),
    equipment: toArrayField(meta.equipment),
    recordData: toArrayField(meta.recordData),
  }
}

export function DetailSOPPenyusunMain({
  activeTab,
  onActiveTabChange,
  isEditingSteps,
  setIsEditingSteps,
  diagramVersion,
  onDiagramVersionChange,
}: DetailSOPPenyusunMainProps) {
  const { metadata, prosedurRows, setProsedurRows, implementers, isReadOnly } = useSopEditor()
  const previewMetadata = useMemo(() => toPreviewMetadata(metadata), [metadata])
  const toolbar = isReadOnly ? null : (
            <div
              className="inline-flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-lg bg-white/55 p-0.5 ring-1 ring-gray-200/70"
              role="group"
              aria-label="Edit prosedur"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium text-gray-700',
                  isEditingSteps
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/90'
                    : 'hover:bg-white/90',
                )}
                title={
                  isEditingSteps
                    ? 'Kembali ke pratinjau diagram'
                    : 'Edit langkah prosedur dalam tabel'
                }
                onClick={() => setIsEditingSteps(!isEditingSteps)}
              >
                <ListTree className="h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
                {isEditingSteps ? 'Diagram' : 'Langkah'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium text-gray-700 hover:bg-white/90 disabled:bg-transparent disabled:text-gray-400 disabled:opacity-50"
                disabled={isEditingSteps}
                onClick={onDiagramVersionChange}
                title="Susun ulang routing diagram bila garis bertumpuk"
              >
                <RefreshCw className="h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
                Layout
              </Button>
            </div>
          )
  const diagramAlternate =
    !isReadOnly && isEditingSteps ? (
            <div className="print:hidden">
              <DetailSOPProsedurEditor
                prosedurRows={prosedurRows}
                setProsedurRows={setProsedurRows}
                implementers={implementers}
                onDone={() => setIsEditingSteps(false)}
              />
            </div>
          ) : undefined
  return (
    <div className="flex-1 overflow-auto p-4">
      <div data-print-area="sop">
        <SOPPreviewTemplate
        metadata={previewMetadata}
        prosedurRows={prosedurRows}
        implementers={implementers}
        diagramState={{
          pathLayoutSeed: diagramVersion,
          activeTab,
          onActiveTabChange,
        }}
        previewOptions={{
          toolbar,
          diagramAlternate,
        }}
      />
      </div>
    </div>
  )
}
