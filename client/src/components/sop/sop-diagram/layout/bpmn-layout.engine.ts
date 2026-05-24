import type { BpmnLaneLayout } from '../core/route/bpmnRouter'
import type { FlowchartConnection } from '../shapes/FlowchartArrowConnector'
import { assignStepColumns, type BpmnLayoutStepInput } from './bpmn-graph-layer.util'
import {
  BPMN_BASE_ROW_HEIGHT,
  BPMN_BASE_X,
  BPMN_COLLISION_PADDING,
  BPMN_COLUMN_SPACING,
  BPMN_DECISION_TEXT_OFFSET_Y,
  BPMN_GATEWAY_EXTRA_GAP,
  BPMN_LANE_STEP_PADDING,
  BPMN_ROW_SPACING,
  BPMN_TASK_MIN_HEIGHT,
  BPMN_TASK_MIN_WIDTH,
  getBpmnStepLayoutDimensions,
} from './bpmnDiagramMetrics'

export interface BpmnLayoutGlobalStep {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  name: string
  seq: number
  lane: number
  columnIndex: number
  laneHeight: number
  decisionTextGlobalY?: number
}

export interface BpmnLaneLayoutEntry {
  impId: string
  height: number
  steps: Array<
    BpmnLayoutGlobalStep & {
      id: string
    }
  >
}

export interface BpmnLayoutResult {
  globalSteps: BpmnLayoutGlobalStep[]
  columnStartXs: number[]
  maxColumnWidths: number[]
  laneLayouts: BpmnLaneLayoutEntry[]
  bpmnLaneLayoutForRouter: BpmnLaneLayout | null
}

export interface ComputeBpmnLayoutInput {
  steps: BpmnLayoutStepInput[]
  connections: FlowchartConnection[]
  implementerIds: string[]
}

function laneIndexForStep(step: BpmnLayoutStepInput, implementerIds: string[]): number {
  if (!step.id_implementer) return 0
  const idx = implementerIds.findIndex((id) => id === step.id_implementer)
  return idx === -1 ? 0 : idx
}

function stepRect(
  x: number,
  y: number,
  width: number,
  height: number,
  pad: number,
): { left: number; top: number; right: number; bottom: number } {
  return {
    left: x - width / 2 - pad,
    top: y - height / 2 - pad,
    right: x + width / 2 + pad,
    bottom: y + height / 2 + pad,
  }
}

function rectsOverlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

function resolveColumnCollisions(
  steps: BpmnLayoutGlobalStep[],
  maxIterations = 3,
): BpmnLayoutGlobalStep[] {
  const next = steps.map((s) => ({ ...s }))
  for (let iter = 0; iter < maxIterations; iter += 1) {
    let moved = false
    for (let i = 0; i < next.length; i += 1) {
      for (let j = i + 1; j < next.length; j += 1) {
        const a = next[i]!
        const b = next[j]!
        if (a.lane !== b.lane) continue
        const ra = stepRect(a.x, a.y, a.width, a.height, BPMN_COLLISION_PADDING)
        const rb = stepRect(b.x, b.y, b.width, b.height, BPMN_COLLISION_PADDING)
        if (!rectsOverlap(ra, rb)) continue
        const pushTarget = b.columnIndex >= a.columnIndex && b.seq >= a.seq ? b : a
        pushTarget.columnIndex += 1
        moved = true
      }
    }
    if (!moved) break
  }
  return next
}

function rebuildColumnGeometry(
  steps: BpmnLayoutGlobalStep[],
  stepDimensionsCache: Map<string, ReturnType<typeof getBpmnStepLayoutDimensions>>,
): { columnStartXs: number[]; maxColumnWidths: number[]; positioned: BpmnLayoutGlobalStep[] } {
  const maxColIdx = Math.max(0, ...steps.map((s) => s.columnIndex))
  const maxColumnWidths = new Array(maxColIdx + 1).fill(0)
  for (const step of steps) {
    const dims = stepDimensionsCache.get(step.id) ?? {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
    const extra = step.type === 'decision' ? BPMN_GATEWAY_EXTRA_GAP : 0
    maxColumnWidths[step.columnIndex] = Math.max(
      maxColumnWidths[step.columnIndex] ?? 0,
      dims.width + extra,
    )
  }
  const columnStartXs: number[] = []
  let curX = BPMN_BASE_X
  for (let i = 0; i <= maxColIdx; i += 1) {
    columnStartXs[i] = curX
    curX += (maxColumnWidths[i] ?? BPMN_TASK_MIN_WIDTH) + BPMN_COLUMN_SPACING
  }
  const laneYPositions: number[] = []
  const numLanes = Math.max(1, ...steps.map((s) => s.lane + 1))
  const laneMaxHeights = new Array(numLanes).fill(BPMN_BASE_ROW_HEIGHT)
  for (const step of steps) {
    const dims = stepDimensionsCache.get(step.id) ?? {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
    const laneNeed = Math.max(dims.height, dims.decisionTextReserve) + BPMN_LANE_STEP_PADDING
    laneMaxHeights[step.lane] = Math.max(laneMaxHeights[step.lane] ?? BPMN_BASE_ROW_HEIGHT, laneNeed)
  }
  let cumulativeY = 0
  for (let i = 0; i < numLanes; i += 1) {
    laneYPositions[i] = cumulativeY + (laneMaxHeights[i] ?? BPMN_BASE_ROW_HEIGHT) / 2
    cumulativeY += (laneMaxHeights[i] ?? BPMN_BASE_ROW_HEIGHT) + BPMN_ROW_SPACING
  }
  const positioned = steps.map((step) => {
    const dims = stepDimensionsCache.get(step.id) ?? {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
    const colStart = columnStartXs[step.columnIndex] ?? BPMN_BASE_X
    const colWidth = maxColumnWidths[step.columnIndex] ?? dims.width
    const x = colStart + colWidth / 2
    const y = laneYPositions[step.lane] ?? 0
    const laneHeight = laneMaxHeights[step.lane] ?? BPMN_BASE_ROW_HEIGHT
    const decisionTextGlobalY =
      step.type === 'decision' ? y + BPMN_DECISION_TEXT_OFFSET_Y : undefined
    return {
      ...step,
      x,
      y,
      width: dims.width,
      height: dims.height,
      laneHeight,
      decisionTextGlobalY,
    }
  })
  return { columnStartXs, maxColumnWidths, positioned }
}

/** Pipeline layout BPMN: DAG columns → posisi → collision pass → lane/router metadata. */
export function computeBpmnLayout(input: ComputeBpmnLayoutInput): BpmnLayoutResult | null {
  const { steps, connections, implementerIds } = input
  if (steps.length === 0) return null
  const stepDimensionsCache = new Map<string, ReturnType<typeof getBpmnStepLayoutDimensions>>()
  for (const step of steps) {
    stepDimensionsCache.set(step.id_step, getBpmnStepLayoutDimensions(step.name, step.type))
  }
  const stepColumnMap = assignStepColumns(steps, connections, implementerIds)
  let globalSteps: BpmnLayoutGlobalStep[] = steps.map((step) => {
    const lane = laneIndexForStep(step, implementerIds)
    const columnIndex = stepColumnMap.get(step.id_step) ?? 0
    const dims = stepDimensionsCache.get(step.id_step) ?? {
      width: BPMN_TASK_MIN_WIDTH,
      height: BPMN_TASK_MIN_HEIGHT,
      decisionTextReserve: 0,
    }
    return {
      id: step.id_step,
      type: step.type,
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
      name: step.name ?? '',
      seq: step.seq_number,
      lane,
      columnIndex,
      laneHeight: BPMN_BASE_ROW_HEIGHT,
    }
  })
  let geometry = rebuildColumnGeometry(globalSteps, stepDimensionsCache)
  globalSteps = resolveColumnCollisions(geometry.positioned)
  geometry = rebuildColumnGeometry(globalSteps, stepDimensionsCache)
  globalSteps = geometry.positioned
  const { columnStartXs, maxColumnWidths } = geometry
  const laneLayouts: BpmnLaneLayoutEntry[] = implementerIds.map((impId, index) => {
    const stepsInLane = globalSteps.filter((s) => s.lane === index)
    const laneHeight = stepsInLane[0]?.laneHeight ?? BPMN_BASE_ROW_HEIGHT
    return {
      impId,
      height: laneHeight,
      steps: stepsInLane.map((s) => ({
        ...s,
        id: `bpmn-step-${s.seq}`,
        y: laneHeight / 2,
        decisionTextGlobalY: s.decisionTextGlobalY,
      })),
    }
  })
  if (implementerIds.length === 0) {
    const stepsInLane = globalSteps.filter((s) => s.lane === 0)
    const laneHeight = stepsInLane[0]?.laneHeight ?? BPMN_BASE_ROW_HEIGHT
    laneLayouts.push({
      impId: '',
      height: laneHeight,
      steps: stepsInLane.map((s) => ({
        ...s,
        id: `bpmn-step-${s.seq}`,
        y: laneHeight / 2,
        decisionTextGlobalY: s.decisionTextGlobalY,
      })),
    })
  }
  let bpmnLaneLayoutForRouter: BpmnLaneLayout | null = null
  if (laneLayouts.length > 0) {
    let laneTop = 0
    const lanes = laneLayouts.map((l, i) => {
      const info = { index: i, top: laneTop, height: l.height }
      laneTop += l.height + BPMN_ROW_SPACING
      return info
    })
    bpmnLaneLayoutForRouter = {
      lanes,
      columnStartXs,
      columnWidths: maxColumnWidths,
    }
  }
  return {
    globalSteps,
    columnStartXs,
    maxColumnWidths,
    laneLayouts: laneLayouts.length > 0 ? laneLayouts : [],
    bpmnLaneLayoutForRouter,
  }
}
