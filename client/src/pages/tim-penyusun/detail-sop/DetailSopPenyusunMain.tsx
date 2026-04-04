import { SOPPreviewTemplate } from '@/features/sop/components/SOPPreviewTemplate'
import { DetailSOPProsedurEditor } from './DetailSopProsedurEditor'
import type { SOPDetailMetadata, ProsedurRow } from '@/features/sop'

export interface DetailSOPPenyusunMainProps {
  metadata: SOPDetailMetadata
  prosedurRows: ProsedurRow[]
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>
  implementers: { id: string; name: string }[]
  activeTab: 'flowchart' | 'bpmn'
  onActiveTabChange: (tab: 'flowchart' | 'bpmn') => void
  isEditingSteps: boolean
  setIsEditingSteps: (editing: boolean) => void
  diagramVersion: number
  onDiagramVersionChange: () => void
}

export function DetailSOPPenyusunMain({
  metadata,
  prosedurRows,
  setProsedurRows,
  implementers,
  activeTab,
  onActiveTabChange,
  isEditingSteps,
  setIsEditingSteps,
  diagramVersion,
  onDiagramVersionChange,
}: DetailSOPPenyusunMainProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <SOPPreviewTemplate
        metadata={metadata as any}
        prosedurRows={prosedurRows}
        implementers={implementers}
        pathLayoutSeed={diagramVersion}
        activeTab={activeTab}
        onActiveTabChange={onActiveTabChange}
        toolbar={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center rounded-lg border border-gray-200 bg-white p-2 sm:p-1.5 shadow-sm gap-2 sm:gap-0 w-full sm:w-auto">
              <Tabs
                value={activeTab}
                onValueChange={(v) => onActiveTabChange(v as 'flowchart' | 'bpmn')}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full sm:w-auto grid-cols-2 h-8 bg-gray-100/80 p-0.5 gap-0.5 rounded-md border-0">
                  <TabsTrigger value="flowchart" className="text-xs font-medium h-7 px-4">
                    Flowchart
                  </TabsTrigger>
                  <TabsTrigger value="bpmn" className="text-xs font-medium h-7 px-4">
                    BPMN
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="hidden sm:block w-px bg-gray-200 mx-1 min-h-5 self-stretch" aria-hidden />
              <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:pr-1 sm:pl-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3 rounded-md border-gray-200"
                  onClick={() => setIsEditingSteps(!isEditingSteps)}
                >
                  Ubah langkah
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-3 rounded-md border-gray-200 hover:bg-gray-50"
                  disabled={isEditingSteps}
                  onClick={onDiagramVersionChange}
                  title="Paksa susun ulang layout diagram"
                >
                  Perbaiki diagram
                </Button>
              </div>
            </div>
          </div>
        }
        diagramAlternate={
          isEditingSteps ? (
            <DetailSOPProsedurEditor
              prosedurRows={prosedurRows}
              setProsedurRows={setProsedurRows}
              implementers={implementers}
              onDone={() => setIsEditingSteps(false)}
            />
          ) : undefined
        }
      />
    </div>
  )
}

// Inline Tabs imports to avoid circular dependency
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
