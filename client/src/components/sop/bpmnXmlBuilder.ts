/**
 * Build BPMN 2.0 XML from SOP steps and implementers for use with bpmn-js.
 * Uses the same logical model as the previous BPMN diagram (start, tasks, gateways, end, lanes).
 */

import type { Implementer, SOPStep } from './sopDiagramTypes'
import type { LabelConfig } from './sopDiagramTypes'

const LANE_HEIGHT = 120
const LANE_SPACING = 20
const COL_WIDTH = 140
const COL_SPACING = 30
const EVENT_SIZE = 36
const TASK_WIDTH = 120
const TASK_HEIGHT = 60
const GATEWAY_SIZE = 80

interface ProcessedStep {
  id: string
  seq: number
  name: string
  type: 'terminator' | 'task' | 'decision'
  id_implementer?: string
  id_next_step_if_yes?: string
  id_next_step_if_no?: string
}

interface Flow {
  id: string
  fromSeq: number
  toSeq: number
  name?: string
}

interface LayoutNode {
  id: string
  seq: number
  type: 'start' | 'end' | 'task' | 'gateway'
  laneIndex: number
  columnIndex: number
  width: number
  height: number
  x: number
  y: number
}

function processSteps(steps: SOPStep[]): ProcessedStep[] {
  if (!steps?.length) return []
  const sorted = [...steps].sort((a, b) => a.seq_number - b.seq_number)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const start: ProcessedStep = {
    id: 'start-terminator',
    seq: 0,
    name: 'Mulai',
    type: 'terminator',
    id_implementer: first?.id_implementer,
  }
  const end: ProcessedStep = {
    id: 'end-terminator',
    seq: sorted.length + 1,
    name: 'Selesai',
    type: 'terminator',
    id_implementer: last?.id_implementer,
  }
  const middle = sorted.map((s, i) => ({
    id: s.id_step ?? `step-${i + 1}`,
    seq: i + 1,
    name: s.name,
    type: (s.type === 'terminator' ? 'task' : s.type) as 'task' | 'decision',
    id_implementer: s.id_implementer,
    id_next_step_if_yes: s.id_next_step_if_yes,
    id_next_step_if_no: s.id_next_step_if_no,
  }))
  return [start, ...middle, end]
}

function buildFlows(steps: ProcessedStep[], customLabels: Record<string, string>): Flow[] {
  const flows: Flow[] = []
  steps.forEach((step) => {
    if (step.type === 'decision') {
      const yesTarget = step.id_next_step_if_yes
        ? steps.find((s) => s.id === step.id_next_step_if_yes)
        : null
      if (yesTarget) {
        const key = `step-${step.seq}-yes`
        flows.push({
          id: `Flow_${step.seq}_${yesTarget.seq}_yes`,
          fromSeq: step.seq,
          toSeq: yesTarget.seq,
          name: customLabels[key] ?? 'Ya',
        })
      }
      const noTarget = step.id_next_step_if_no
        ? steps.find((s) => s.id === step.id_next_step_if_no)
        : null
      if (noTarget) {
        const key = `step-${step.seq}-no`
        flows.push({
          id: `Flow_${step.seq}_${noTarget.seq}_no`,
          fromSeq: step.seq,
          toSeq: noTarget.seq,
          name: customLabels[key] ?? 'Tidak',
        })
      }
    } else {
      const next = steps.find((s) => s.seq === step.seq + 1)
      if (next) {
        flows.push({ id: `Flow_${step.seq}_${next.seq}`, fromSeq: step.seq, toSeq: next.seq })
      }
    }
  })
  return flows
}

function computeLayout(
  steps: ProcessedStep[],
  flows: Flow[],
  orderedImplementers: Implementer[],
): LayoutNode[] {
  const numLanes = Math.max(1, orderedImplementers.length)
  const laneIndex = (implId: string | undefined) => {
    if (!implId) return 0
    const i = orderedImplementers.findIndex((impl) => impl.id === implId)
    return i >= 0 ? i : 0
  }

  const stepColumnMap = new Map<number, number>()
  const laneMaxCol = new Array(numLanes).fill(-1)

  steps.forEach((step) => {
    const laneIdx = laneIndex(step.id_implementer)
    const preds = flows.filter((f) => f.toSeq === step.seq)
    let col = 0
    preds.forEach((f) => {
      const predCol = stepColumnMap.get(f.fromSeq) ?? 0
      const predStep = steps.find((s) => s.seq === f.fromSeq)
      const predLane = predStep ? laneIndex(predStep.id_implementer) : 0
      col = Math.max(col, predLane === laneIdx ? predCol + 1 : predCol)
    })
    col = Math.max(col, laneMaxCol[laneIdx] + 1)
    stepColumnMap.set(step.seq, col)
    laneMaxCol[laneIdx] = Math.max(laneMaxCol[laneIdx], col)
  })

  const nodes: LayoutNode[] = []

  steps.forEach((step) => {
    const laneIdx = laneIndex(step.id_implementer)
    const col = stepColumnMap.get(step.seq) ?? 0
    const offsetY = laneIdx * (LANE_HEIGHT + LANE_SPACING) + LANE_HEIGHT / 2
    const offsetX = col * (COL_WIDTH + COL_SPACING) + COL_WIDTH / 2

    let width: number
    let height: number
    let type: LayoutNode['type']

    if (step.type === 'terminator') {
      width = height = EVENT_SIZE
      type = step.seq === 0 ? 'start' : 'end'
    } else if (step.type === 'decision') {
      width = height = GATEWAY_SIZE
      type = 'gateway'
    } else {
      width = TASK_WIDTH
      height = TASK_HEIGHT
      type = 'task'
    }

    nodes.push({
      id: step.seq === 0 ? 'StartEvent_1' : step.seq === steps.length - 1 ? 'EndEvent_1' : `Element_${step.seq}`,
      seq: step.seq,
      type,
      laneIndex: laneIdx,
      columnIndex: col,
      width,
      height,
      x: offsetX - width / 2,
      y: offsetY - height / 2,
    })
  })

  return nodes
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Hit shape edge, not center: waypoints for sequence flow from shape boundary to shape boundary */
function getEdgeWaypoints(
  from: LayoutNode,
  to: LayoutNode,
): { x1: number; y1: number; x2: number; y2: number } {
  const fx = from.x + from.width / 2
  const fy = from.y + from.height / 2
  const tx = to.x + to.width / 2
  const ty = to.y + to.height / 2
  const dx = tx - fx
  const dy = ty - fy

  let x1: number
  let y1: number
  let x2: number
  let y2: number

  const fromRight = from.x + from.width
  const fromBottom = from.y + from.height
  const toRight = to.x + to.width
  const toBottom = to.y + to.height

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) {
      x1 = fromRight
      y1 = fy
      x2 = to.x
      y2 = ty
    } else {
      x1 = from.x
      y1 = fy
      x2 = toRight
      y2 = ty
    }
  } else {
    if (dy >= 0) {
      x1 = fx
      y1 = fromBottom
      x2 = tx
      y2 = to.y
    } else {
      x1 = fx
      y1 = from.y
      x2 = tx
      y2 = toBottom
    }
  }
  return { x1, y1, x2, y2 }
}

const POOL_PADDING = 40

export function buildBpmnXml(
  steps: SOPStep[],
  implementers: Implementer[],
  labelConfig?: LabelConfig | null,
  /** Nama SOP untuk pool (swimlane label) */
  processName?: string,
): string {
  const processed = processSteps(steps)
  if (processed.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_1" name="${escapeXml(processName || 'Proses')}" processRef="Process_1"/>
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Mulai"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Shape_Participant_1" bpmnElement="Participant_1">
        <dc:Bounds x="0" y="0" width="200" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="82" y="62" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`
  }

  const customLabels = labelConfig?.custom_labels ?? {}
  const flows = buildFlows(processed, customLabels)

  const orderedImplementers: Implementer[] = []
  const seen = new Set<string>()
  processed.forEach((s) => {
    if (s.id_implementer && implementers?.length) {
      const impl = implementers.find((i) => i.id === s.id_implementer)
      if (impl && !seen.has(impl.id)) {
        seen.add(impl.id)
        orderedImplementers.push(impl)
      }
    }
  })
  implementers?.forEach((impl) => {
    if (!seen.has(impl.id)) orderedImplementers.push(impl)
  })
  if (orderedImplementers.length === 0 && implementers?.length) {
    orderedImplementers.push(...implementers)
  }
  if (orderedImplementers.length === 0) {
    orderedImplementers.push({ id: '_default', name: 'Lane' })
  }

  const layout = computeLayout(processed, flows, orderedImplementers)
  const nodeBySeq = new Map(layout.map((n) => [n.seq, n]))

  const ns = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
  const nsdi = 'http://www.omg.org/spec/BPMN/20100524/DI'
  const nsdc = 'http://www.omg.org/spec/DD/20100524/DC'
  const nsd = 'http://www.omg.org/spec/DD/20100524/DI'

  const parts: string[] = []
  parts.push(
    `<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="${ns}" xmlns:bpmndi="${nsdi}" xmlns:dc="${nsdc}" xmlns:di="${nsd}" id="def_1" targetNamespace="http://bpmn.io/schema/bpmn">`
  )
  const processNameSafe = processName?.trim() || 'Proses'
  parts.push(`  <bpmn:collaboration id="Collaboration_1">`)
  parts.push(
    `    <bpmn:participant id="Participant_1" name="${escapeXml(processNameSafe)}" processRef="Process_1"/>`
  )
  parts.push(`  </bpmn:collaboration>`)
  parts.push(`  <bpmn:process id="Process_1" isExecutable="false">`)

  const laneSetLanes: string[] = []
  const flowNodeRefsByLane = new Map<number, string[]>()
  layout.forEach((n) => {
    const list = flowNodeRefsByLane.get(n.laneIndex) ?? []
    list.push(n.id)
    flowNodeRefsByLane.set(n.laneIndex, list)
  })

  orderedImplementers.forEach((impl, idx) => {
    const refs = flowNodeRefsByLane.get(idx) ?? []
    laneSetLanes.push(
      `    <bpmn:lane id="Lane_${idx}" name="${escapeXml(impl.name)}">` +
        refs.map((r) => `\n      <bpmn:flowNodeRef>${r}</bpmn:flowNodeRef>`).join('') +
        '\n    </bpmn:lane>'
    )
  })
  if (laneSetLanes.length > 0) {
    parts.push('    <bpmn:laneSet id="LaneSet_1">')
    parts.push(laneSetLanes.join('\n'))
    parts.push('    </bpmn:laneSet>')
  }

  processed.forEach((step, i) => {
    const n = layout[i]
    if (!n) return
    if (step.type === 'terminator') {
      if (step.seq === 0) {
        parts.push(`    <bpmn:startEvent id="StartEvent_1" name="${escapeXml(step.name)}"/>`)
      } else {
        parts.push(`    <bpmn:endEvent id="EndEvent_1" name="${escapeXml(step.name)}"/>`)
      }
    } else if (step.type === 'decision') {
      parts.push(
        `    <bpmn:exclusiveGateway id="${n.id}" name="${escapeXml(step.name)}"/>`
      )
    } else {
      parts.push(
        `    <bpmn:task id="${n.id}" name="${escapeXml(step.name)}"/>`
      )
    }
  })

  flows.forEach((f) => {
    const nameAttr = f.name ? ` name="${escapeXml(f.name)}"` : ''
    parts.push(
      `    <bpmn:sequenceFlow id="${f.id}" sourceRef="${nodeBySeq.get(f.fromSeq)?.id ?? ''}" targetRef="${nodeBySeq.get(f.toSeq)?.id ?? ''}"${nameAttr}/>`
    )
  })

  parts.push('  </bpmn:process>')
  parts.push('  <bpmndi:BPMNDiagram id="BPMNDiagram_1">')
  parts.push('    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">')

  const minX = Math.min(...layout.map((n) => n.x))
  const minY = Math.min(...layout.map((n) => n.y))
  const maxX = Math.max(...layout.map((n) => n.x + n.width))
  const maxY = Math.max(...layout.map((n) => n.y + n.height))
  const poolW = maxX - minX + POOL_PADDING * 2
  const poolH = maxY - minY + POOL_PADDING * 2
  const offsetX = POOL_PADDING - minX
  const offsetY = POOL_PADDING - minY

  parts.push(
    `      <bpmndi:BPMNShape id="Shape_Participant_1" bpmnElement="Participant_1">` +
      `<dc:Bounds x="0" y="0" width="${Math.round(poolW)}" height="${Math.round(poolH)}"/>` +
      '</bpmndi:BPMNShape>'
  )

  layout.forEach((n) => {
    const x = n.x + offsetX
    const y = n.y + offsetY
    parts.push(
      `      <bpmndi:BPMNShape id="Shape_${n.id}" bpmnElement="${n.id}">` +
        `<dc:Bounds x="${Math.round(x)}" y="${Math.round(y)}" width="${n.width}" height="${n.height}"/>` +
        '</bpmndi:BPMNShape>'
    )
  })

  flows.forEach((f) => {
    const fromN = nodeBySeq.get(f.fromSeq)
    const toN = nodeBySeq.get(f.toSeq)
    if (!fromN || !toN) return
    const { x1, y1, x2, y2 } = getEdgeWaypoints(fromN, toN)
    parts.push(
      `      <bpmndi:BPMNEdge id="Edge_${f.id}" bpmnElement="${f.id}">` +
        `<di:waypoint x="${Math.round(x1 + offsetX)}" y="${Math.round(y1 + offsetY)}"/>` +
        `<di:waypoint x="${Math.round(x2 + offsetX)}" y="${Math.round(y2 + offsetY)}"/>` +
        '</bpmndi:BPMNEdge>'
    )
  })

  parts.push('    </bpmndi:BPMNPlane>')
  parts.push('  </bpmndi:BPMNDiagram>')
  parts.push('</bpmn:definitions>')

  return parts.join('\n')
}
