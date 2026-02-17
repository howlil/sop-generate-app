import { SOPDiagramFlowchart } from './SOPDiagramFlowchart.tsx'
import { SOPDiagramBpmn } from './SOPDiagramBpmn.tsx'
import type { ProsedurRow, LayoutConfig, Implementer, SOPStep } from './sopDiagramTypes.ts'

export type { ProsedurRow, LayoutConfig, Implementer, SOPStep }
export { getFullTimeUnit } from './sopDiagramTypes.ts'

interface SOPDiagramProps {
  rows: ProsedurRow[]
  implementers: Implementer[]
  diagramType?: 'flowchart' | 'bpmn'
  layoutConfig?: LayoutConfig
  /** Optional name for BPMN diagram title (e.g. SOP name) */
  name?: string
}

export function SOPDiagram({
  rows,
  implementers,
  diagramType = 'flowchart',
  layoutConfig = {},
  name,
}: SOPDiagramProps) {
  const steps: SOPStep[] = rows.map((row) => {
    const implementerId = Object.keys(row.pelaksana).find(
      (key) => row.pelaksana[key] && row.pelaksana[key] !== ''
    )
    const type =
      row.type ??
      (row.no === 1 || row.no === rows.length ? 'terminator' : 'task')
    return {
      seq_number: row.no,
      name: row.kegiatan,
      type,
      id_implementer: implementerId || implementers[0]?.id,
      id_step: row.id,
      id_next_step_if_yes: row.id_next_step_if_yes,
      id_next_step_if_no: row.id_next_step_if_no,
    }
  })

  if (diagramType === 'flowchart') {
    return (
      <SOPDiagramFlowchart
        rows={rows}
        steps={steps}
        implementers={implementers}
        layoutConfig={layoutConfig}
      />
    )
  }
  return (
    <SOPDiagramBpmn
      name={name}
      steps={steps}
      implementers={implementers}
    />
  )
}
