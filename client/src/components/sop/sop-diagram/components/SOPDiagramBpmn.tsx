import { useMemo } from 'react'
import type { FlowchartConnection } from '../shapes/FlowchartArrowConnector'
import type { Implementer, SOPStep, ArrowConfig, LabelConfig } from '../core/sopDiagramTypes'
import { BpmnPage, type ProcessedBpmnStep } from './BpmnPage'
import { sortConnectionsForRouting } from '../core/route/connection-route-order.util'

const BPMN_SHAPE_PREFIX = 'bpmn-step-'

export interface SOPDiagramBpmnProps {
  data: {
    name?: string
    steps: SOPStep[]
    implementers: Implementer[]
  }
  config?: {
    pathLayoutSeed?: number
    arrowConfig?: ArrowConfig
    labelConfig?: LabelConfig
    editMode?: boolean
    selectedConnectionId?: string | null
  }
  events?: {
    onManualEdit?: (config: unknown) => void
    onLabelEdit?: (config: unknown) => void
    onManualChange?: (payload: import('../shapes/FlowchartArrowConnector').PathUpdatedPayload) => void
    onSelectConnection?: (connectionId: string | null) => void
  }
}

function buildFullProcessedSteps(steps: SOPStep[]): ProcessedBpmnStep[] {
  if (!steps.length) return []
  const sorted = [...steps].sort((a, b) => a.seq_number - b.seq_number)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const start: ProcessedBpmnStep = {
    id_step: 'start-terminator',
    seq_number: 0,
    name: 'Mulai',
    type: 'terminator',
    id_implementer: first?.id_implementer,
  }
  const end: ProcessedBpmnStep = {
    id_step: 'end-terminator',
    seq_number: sorted.length + 1,
    name: 'Selesai',
    type: 'terminator',
    id_implementer: last?.id_implementer,
  }
  const modified = sorted.map((s) => ({
    ...s,
    type: s.type === 'terminator' ? 'task' : s.type,
    seq_number: s.seq_number,
    id_step: s.id_step ?? `step-${s.seq_number}`,
  })) as ProcessedBpmnStep[]
  return [start, ...modified, end]
}

function buildBpmnConnections(
  processedSteps: ProcessedBpmnStep[],
  labelConfig: LabelConfig | undefined,
  pathLayoutSeed: number,
): FlowchartConnection[] {
  const list: FlowchartConnection[] = []
  const customLabels = labelConfig?.custom_labels ?? {}
  const targetType = (s: ProcessedBpmnStep | undefined) =>
    s?.type === 'terminator'
      ? 'flowchart-terminator'
      : s?.type === 'decision'
        ? 'flowchart-decision'
        : 'flowchart-process'

  processedSteps.forEach((step) => {
    if (step.type === 'decision') {
      if (step.id_next_step_if_yes) {
        const target = processedSteps.find((s) => s.id_step === step.id_next_step_if_yes)
        if (target) {
          const yesKey = `step-${step.seq_number}-yes`
          list.push({
            id: `conn-${step.seq_number}-to-${target.seq_number}-yes`,
            from: `${BPMN_SHAPE_PREFIX}${step.seq_number}`,
            to: `${BPMN_SHAPE_PREFIX}${target.seq_number}`,
            label: customLabels[yesKey] ?? 'Ya',
            sourceType: 'flowchart-decision',
            targetType: targetType(target),
          })
        }
      }
      if (step.id_next_step_if_no) {
        const target = processedSteps.find((s) => s.id_step === step.id_next_step_if_no)
        if (target) {
          const noKey = `step-${step.seq_number}-no`
          list.push({
            id: `conn-${step.seq_number}-to-${target.seq_number}-no`,
            from: `${BPMN_SHAPE_PREFIX}${step.seq_number}`,
            to: `${BPMN_SHAPE_PREFIX}${target.seq_number}`,
            label: customLabels[noKey] ?? 'Tidak',
            sourceType: 'flowchart-decision',
            targetType: targetType(target),
          })
        }
      }
    } else {
      const next = processedSteps.find((s) => s.seq_number === step.seq_number + 1)
      if (next) {
        list.push({
          id: `conn-${step.seq_number}-to-${next.seq_number}`,
          from: `${BPMN_SHAPE_PREFIX}${step.seq_number}`,
          to: `${BPMN_SHAPE_PREFIX}${next.seq_number}`,
          sourceType: step.type === 'terminator' ? 'flowchart-terminator' : 'flowchart-process',
          targetType: targetType(next),
        })
      }
    }
  })

  return sortConnectionsForRouting(list, pathLayoutSeed)
}

/** Satu diagram BPMN utuh per SOP (paginasi hanya untuk flowchart cetak). */
export function SOPDiagramBpmn({ data, config, events }: SOPDiagramBpmnProps) {
  const { name, steps, implementers } = data
  const pathLayoutSeed = config?.pathLayoutSeed ?? 0
  const labelConfig = config?.labelConfig

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.seq_number - b.seq_number),
    [steps],
  )

  const maxTaskSeq = sortedSteps.length > 0 ? sortedSteps[sortedSteps.length - 1]!.seq_number : 0

  const fullProcessedSteps = useMemo(() => buildFullProcessedSteps(sortedSteps), [sortedSteps])

  const connections = useMemo(
    () => buildBpmnConnections(fullProcessedSteps, labelConfig, pathLayoutSeed),
    [fullProcessedSteps, labelConfig, pathLayoutSeed],
  )

  if (sortedSteps.length === 0) {
    return null
  }

  return (
    <BpmnPage
      pageIndex={0}
      isLastPage
      maxTaskSeq={maxTaskSeq}
      pageSteps={sortedSteps}
      pageConnections={connections}
      name={name}
      implementers={implementers}
      config={config}
      events={events}
    />
  )
}
