import type { ReactNode } from 'react'
import { useState, useMemo } from 'react'
import { SOPHeaderInfo, type SOPHeaderInfoProps } from '@/components/sop/diagram/SOPHeaderInfo'
import { SOPDiagramFlowchart } from '@/components/sop/diagram/SOPDiagramFlowchart'
import { SOPDiagramBpmn } from '@/components/sop/diagram/SOPDiagramBpmn'
import { rowsToSteps } from '@/components/sop/diagram/sopDiagramTypes'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TTESignaturePayload } from '@/lib/types/tte'
import type { ProsedurRow } from '@/lib/types/sop'
import {
  SEED_SOP_DETAIL_METADATA,
  SEED_SOP_DETAIL_PROSEDUR_ROWS,
  SEED_IMPLEMENTERS,
} from '@/lib/seed/sop-detail-seed'

const DEFAULT_IMPLEMENTERS = SEED_IMPLEMENTERS

export interface SOPPreviewTemplateProps {
  /** Override nama SOP (default: Percobaan) */
  name?: string
  /** Override nomor SOP */
  number?: string
  /** TTE signature payload jika SOP sudah disahkan */
  tteSignaturePayload?: TTESignaturePayload | null
  /** Sembunyikan tab Flowchart/BPMN (hanya tampil flowchart) */
  hideDiagramTabs?: boolean
  /** Metadata lengkap (jika ada, dipakai untuk header; jika tidak, pakai seed + name/number) */
  metadata?: Partial<SOPHeaderInfoProps> & { name: string }
  /** Prosedur rows (jika tidak ada, pakai seed) */
  prosedurRows?: ProsedurRow[]
  /** Implementers (jika tidak ada, pakai seed) */
  implementers?: { id: string; name: string }[]
  /** Seed layout flowchart (e.g. diagramVersion) */
  pathLayoutSeed?: number
  /** Header editable + callback */
  editable?: boolean
  onMetadataChange?: (field: string, value: unknown) => void
  /** Tab aktif (controlled) */
  activeTab?: 'flowchart' | 'bpmn'
  onActiveTabChange?: (v: 'flowchart' | 'bpmn') => void
  /** Toolbar di atas diagram (e.g. Ubah langkah, Perbaiki diagram) */
  toolbar?: ReactNode
  /** Jika ada, tampilkan ini instead of diagram (e.g. editor prosedur) */
  diagramAlternate?: ReactNode
}

export function SOPPreviewTemplate({
  name: nameOverride,
  number: numberOverride,
  tteSignaturePayload = null,
  hideDiagramTabs = false,
  metadata: metadataOverride,
  prosedurRows = SEED_SOP_DETAIL_PROSEDUR_ROWS,
  implementers = DEFAULT_IMPLEMENTERS,
  pathLayoutSeed = 0,
  editable = false,
  onMetadataChange,
  activeTab: controlledActiveTab,
  onActiveTabChange,
  toolbar,
  diagramAlternate,
}: SOPPreviewTemplateProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const activeTab = controlledActiveTab ?? internalActiveTab
  const setActiveTab = onActiveTabChange ?? setInternalActiveTab

  const diagramSteps = useMemo(
    () => rowsToSteps(prosedurRows, implementers),
    [prosedurRows, implementers]
  )

  const metadata: SOPHeaderInfoProps = {
    ...SEED_SOP_DETAIL_METADATA,
    ...(nameOverride != null && { name: nameOverride }),
    ...(numberOverride != null && { number: numberOverride }),
    ...metadataOverride,
  } as SOPHeaderInfoProps

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="sop-a4-preview p-2">
        <div className="space-y-8">
          <SOPHeaderInfo
            {...metadata}
            editable={editable}
            onMetadataChange={onMetadataChange}
            tteSignaturePayload={tteSignaturePayload}
          />

          {diagramAlternate != null ? (
            <div className="flex justify-center">{diagramAlternate}</div>
          ) : (
            <>
              {!hideDiagramTabs && (
                <div className="flex justify-center print:hidden">
                  {toolbar ?? (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'flowchart' | 'bpmn')} className="w-full">
                      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                        <TabsTrigger value="flowchart" className="text-xs">Flowchart</TabsTrigger>
                        <TabsTrigger value="bpmn" className="text-xs">BPMN</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              )}

              <div className="w-full">
                {activeTab === 'flowchart' ? (
                  <SOPDiagramFlowchart
                    rows={prosedurRows}
                    steps={diagramSteps}
                    implementers={implementers}
                    pathLayoutSeed={pathLayoutSeed}
                  />
                ) : (
                  <SOPDiagramBpmn
                    name={metadata.name}
                    steps={diagramSteps}
                    implementers={implementers}
                    pathLayoutSeed={pathLayoutSeed}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
