import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { Event } from './shapes/bpmn/Event'
import { Activity } from './shapes/bpmn/Activity'
import { Gateway } from './shapes/bpmn/Gateway'
import { BpmnDecisionText } from './shapes/bpmn/DecisionText'
import {
  FlowchartArrowConnector,
  type FlowchartConnection,
  type UsedSides,
  type PathUpdatedPayload,
} from './shapes/FlowchartArrowConnector'
import type {
  Implementer,
  SOPStep,
  ArrowConfig,
  ArrowConnectionConfig,
  LabelConfig,
} from './sopDiagramTypes'

const TASK_MIN_WIDTH = 90
const TASK_MIN_HEIGHT = 50
const TASK_CHAR_WIDTH_APPROX = 8
const TASK_LINE_HEIGHT_FOR_SIZING = 15
const TASK_HORIZONTAL_PADDING = 20
const TASK_VERTICAL_PADDING = 20
const TASK_MAX_LINE_LENGTH_TARGET = 15
const BASE_ROW_HEIGHT = 160
const ROW_SPACING = 20
const COLUMN_SPACING = 50
const BASE_X = 10
const RIGHT_MARGIN = 100

export interface ProcessedBpmnStep extends SOPStep {
  id_step: string
  seq_number: number
}

function getStepDimensions(
  stepName: string | undefined,
  stepType: string
): { width: number; height: number } {
  if (stepType !== 'task') {
    if (stepType === 'terminator') return { width: 120, height: 60 }
    if (stepType === 'decision') return { width: 120, height: 80 }
    return { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT }
  }
  if (!stepName) return { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT }

  const lines: string[] = []
  const words = stepName.split(' ')
  let currentLine = ''
  for (const word of words) {
    if (currentLine === '') {
      currentLine = word
    } else if (currentLine.length + 1 + word.length <= TASK_MAX_LINE_LENGTH_TARGET) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine !== '') lines.push(currentLine)
  const actualLines = lines.length > 0 ? lines : [stepName]

  const longestLength = actualLines.reduce((max, line) => Math.max(max, line.length), 0)
  const requiredWidth = longestLength * TASK_CHAR_WIDTH_APPROX
  const calculatedWidth = Math.max(TASK_MIN_WIDTH, requiredWidth + TASK_HORIZONTAL_PADDING)
  const requiredHeight = actualLines.length * TASK_LINE_HEIGHT_FOR_SIZING
  const calculatedHeight = Math.max(TASK_MIN_HEIGHT, requiredHeight + TASK_VERTICAL_PADDING)
  return { width: calculatedWidth, height: calculatedHeight }
}

function capitalizeWords(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface SOPDiagramBpmnProps {
  name?: string
  steps: SOPStep[]
  implementers: Implementer[]
  arrowConfig?: ArrowConfig
  labelConfig?: LabelConfig
  editMode?: boolean
  onManualEdit?: (config: unknown) => void
  onLabelEdit?: (config: unknown) => void
}

export function SOPDiagramBpmn({
  name = '',
  steps,
  implementers,
  arrowConfig,
  labelConfig,
  editMode = false,
  onManualEdit,
  onLabelEdit: _onLabelEdit,
}: SOPDiagramBpmnProps) {
  const [arrowConfigs, setArrowConfigs] = useState<Record<string, ArrowConnectionConfig>>({})
  const [usedSides, setUsedSides] = useState<UsedSides>({})
  const [arrowsReady, setArrowsReady] = useState(false)
  const layoutRef = useRef<{
    steps: Array<{
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
    }>
    columnStartXs: number[]
    maxColumnWidths: number[]
  } | null>(null)
  const [laneLayouts, setLaneLayouts] = useState<
    Array<{
      impId: string
      height: number
      steps: Array<{
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
      }>
    }>
  >([])

  const orderedImplementer = useMemo(() => {
    if (!implementers?.length) return []
    const map = new Map(implementers.map((i) => [i.id, i]))
    const seen = new Set<string>()
    const order: Implementer[] = []
    steps.forEach((step) => {
      if (step.id_implementer && map.has(step.id_implementer) && !seen.has(step.id_implementer)) {
        seen.add(step.id_implementer)
        order.push(map.get(step.id_implementer)!)
      }
    })
    implementers.forEach((impl) => {
      if (!seen.has(impl.id)) order.push(impl)
    })
    return order
  }, [implementers, steps])

  const processedSteps = useMemo((): ProcessedBpmnStep[] => {
    if (!steps?.length) return []
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
    const modified = sorted.map((s, i) => ({
      ...s,
      type: s.type === 'terminator' ? 'task' : s.type,
      seq_number: i + 1,
      id_step: s.id_step ?? `step-${s.seq_number}`,
    }))
    return [start, ...modified, end]
  }, [steps])

  const bpmnConnections = useMemo((): FlowchartConnection[] => {
    const list: FlowchartConnection[] = []
    const customLabels = labelConfig?.custom_labels ?? {}
    const targetType = (s: ProcessedBpmnStep | undefined) =>
      s?.type === 'terminator' ? 'flowchart-terminator' : s?.type === 'decision' ? 'flowchart-decision' : 'flowchart-process'

    processedSteps.forEach((step) => {
      if (step.type === 'decision') {
        if (step.id_next_step_if_yes) {
          const target = processedSteps.find((s) => s.id_step === step.id_next_step_if_yes)
          if (target) {
            const yesKey = `step-${step.seq_number}-yes`
            list.push({
              id: `conn-${step.seq_number}-to-${target.seq_number}-yes`,
              from: `bpmn-step-${step.seq_number}`,
              to: `bpmn-step-${target.seq_number}`,
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
              from: `bpmn-step-${step.seq_number}`,
              to: `bpmn-step-${target.seq_number}`,
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
            from: `bpmn-step-${step.seq_number}`,
            to: `bpmn-step-${next.seq_number}`,
            sourceType: step.type === 'terminator' ? 'flowchart-terminator' : 'flowchart-process',
            targetType: targetType(next),
          })
        }
      }
    })
    return list
  }, [processedSteps, labelConfig?.custom_labels])

  const obstacles = useMemo(
    () => processedSteps.map((s) => ({ id: `bpmn-step-${s.seq_number}` })),
    [processedSteps]
  )

  const onPathUpdated = useCallback((payload: PathUpdatedPayload) => {
    setArrowConfigs((prev) => ({
      ...prev,
      [payload.connectionId]: {
        sSide: payload.sSide,
        eSide: payload.eSide,
        startPoint: payload.startPoint,
        endPoint: payload.endPoint,
        bendPoints: payload.bendPoints,
      },
    }))
    setUsedSides((prev) => {
      const fromId = payload.from
      const toId = payload.to
      const alreadyFrom = fromId && (prev[fromId]?.out?.[payload.sSide] ?? []).includes(payload.connectionId)
      const alreadyTo = toId && (prev[toId]?.in?.[payload.eSide] ?? []).includes(payload.connectionId)
      if (alreadyFrom && alreadyTo) return prev
      const next = { ...prev }
      if (fromId) {
        next[fromId] = { ...next[fromId], out: { ...next[fromId]?.out } }
        const out = next[fromId].out!
        const arr = out[payload.sSide] ?? []
        if (!arr.includes(payload.connectionId)) out[payload.sSide] = [...arr, payload.connectionId]
      }
      if (toId) {
        next[toId] = { ...next[toId], in: { ...next[toId]?.in } }
        const in_ = next[toId].in!
        const arr = in_[payload.eSide] ?? []
        if (!arr.includes(payload.connectionId)) in_[payload.eSide] = [...arr, payload.connectionId]
      }
      return next
    })
  }, [])

  const calculateGlobalLayout = useCallback(() => {
    if (processedSteps.length === 0) return
    const numLanes = Math.max(1, orderedImplementer.length)
    const stepDimensionsCache = new Map<string, { width: number; height: number }>()
    processedSteps.forEach((step) => {
      stepDimensionsCache.set(step.id_step, getStepDimensions(step.name, step.type))
    })

    const stepColumnMap = new Map<string, number>()
    const laneMaxColumn = new Array(numLanes).fill(-1)

    processedSteps.forEach((step) => {
      let laneIndex = orderedImplementer.findIndex((i) => i.id === step.id_implementer)
      if (laneIndex === -1) laneIndex = 0

      const predecessors = processedSteps.filter((pred) =>
        bpmnConnections.some(
          (c) => c.to === `bpmn-step-${step.seq_number}` && c.from === `bpmn-step-${pred.seq_number}`
        )
      )

      let columnIndex = 0
      if (predecessors.length > 0) {
        predecessors.forEach((pred) => {
          const predCol = stepColumnMap.get(pred.id_step) ?? 0
          const predLane = orderedImplementer.findIndex((i) => i.id === pred.id_implementer)
          const predLaneIdx = predLane === -1 ? 0 : predLane
          if (predLaneIdx === laneIndex) {
            columnIndex = Math.max(columnIndex, predCol + 1)
          } else {
            columnIndex = Math.max(columnIndex, predCol)
          }
        })
      }
      columnIndex = Math.max(columnIndex, laneMaxColumn[laneIndex] + 1)
      stepColumnMap.set(step.id_step, columnIndex)
      laneMaxColumn[laneIndex] = Math.max(laneMaxColumn[laneIndex], columnIndex)
    })

    const maxColIdx = Math.max(0, ...Array.from(stepColumnMap.values()))
    const maxColumnWidths = new Array(maxColIdx + 1).fill(0)
    processedSteps.forEach((step) => {
      const col = stepColumnMap.get(step.id_step)
      if (col !== undefined) {
        const dims = stepDimensionsCache.get(step.id_step)
        if (dims) maxColumnWidths[col] = Math.max(maxColumnWidths[col], dims.width)
      }
    })

    const columnStartXs: number[] = []
    let curX = BASE_X
    for (let i = 0; i <= maxColIdx; i++) {
      columnStartXs[i] = curX
      curX += maxColumnWidths[i] + COLUMN_SPACING
    }

    const laneMaxHeights = new Array(numLanes).fill(BASE_ROW_HEIGHT)
    processedSteps.forEach((step) => {
      let laneIdx = orderedImplementer.findIndex((i) => i.id === step.id_implementer)
      if (laneIdx === -1) laneIdx = 0
      const dims = stepDimensionsCache.get(step.id_step) ?? { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT }
      laneMaxHeights[laneIdx] = Math.max(laneMaxHeights[laneIdx], dims.height + 60)
    })

    const laneYPositions: number[] = []
    let cumulativeY = 0
    for (let i = 0; i < numLanes; i++) {
      laneYPositions[i] = cumulativeY + laneMaxHeights[i] / 2
      cumulativeY += laneMaxHeights[i] + ROW_SPACING
    }

    const globalSteps: Array<{
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
    }> = []

    processedSteps.forEach((step) => {
      let laneIdx = orderedImplementer.findIndex((i) => i.id === step.id_implementer)
      if (laneIdx === -1) laneIdx = 0
      const columnIndex = stepColumnMap.get(step.id_step) ?? 0
      const dims = stepDimensionsCache.get(step.id_step) ?? { width: TASK_MIN_WIDTH, height: TASK_MIN_HEIGHT }
      const colStart = columnStartXs[columnIndex] ?? BASE_X
      const colWidth = maxColumnWidths[columnIndex] ?? dims.width
      const x = colStart + colWidth / 2
      const y = laneYPositions[laneIdx]
      globalSteps.push({
        id: step.id_step,
        type: step.type,
        x,
        y,
        width: dims.width,
        height: dims.height,
        name: step.name,
        seq: step.seq_number,
        lane: laneIdx,
        columnIndex,
        laneHeight: laneMaxHeights[laneIdx],
      })
    })

    layoutRef.current = { steps: globalSteps, columnStartXs, maxColumnWidths }
    const layouts = orderedImplementer.map((imp, index) => {
      const stepsInLane = globalSteps.filter((s) => s.lane === index)
      const laneHeight = stepsInLane[0]?.laneHeight ?? BASE_ROW_HEIGHT
      return {
        impId: imp.id,
        height: laneHeight,
        steps: stepsInLane.map((s) => ({
          ...s,
          id: `bpmn-step-${s.seq}`,
          y: laneHeight / 2,
        })),
      }
    })
    setLaneLayouts(layouts)
  }, [processedSteps, orderedImplementer, bpmnConnections])

  useEffect(() => {
    calculateGlobalLayout()
  }, [calculateGlobalLayout])

  useEffect(() => {
    if (processedSteps.length > 0) {
      setArrowsReady(false)
      const t = requestAnimationFrame(() => setArrowsReady(true))
      return () => cancelAnimationFrame(t)
    }
  }, [processedSteps.length])

  const diagramWidth = useMemo(() => {
    if (!laneLayouts.length) return RIGHT_MARGIN + TASK_MIN_WIDTH + RIGHT_MARGIN
    const allSteps = laneLayouts.flatMap((l) => l.steps)
    if (!allSteps.length) return RIGHT_MARGIN + TASK_MIN_WIDTH + RIGHT_MARGIN
    const maxX = Math.max(...allSteps.map((s) => s.x + (s.width ?? 0) / 2))
    return maxX + RIGHT_MARGIN
  }, [laneLayouts])

  const totalDiagramHeight = useMemo(() => {
    if (!laneLayouts.length) return BASE_ROW_HEIGHT
    return laneLayouts.reduce(
      (acc, l, i) => acc + l.height + (i < laneLayouts.length - 1 ? ROW_SPACING : 0),
      0
    )
  }, [laneLayouts])

  const charWidth = 9
  const rowHeight = 120
  const safetyFactor = 1
  const dynamicTitleWidth = name
    ? (() => {
        const maxW = orderedImplementer.length * rowHeight * safetyFactor
        const textW = name.length * charWidth
        const lineCount = textW <= maxW ? 1 : Math.ceil(textW / maxW)
        return lineCount * 30 + 20
      })()
    : 0

  const decisionTextPositions = labelConfig?.positions ?? {}
  const handleDecisionTextDrag = useCallback(
    (stepId: string, position: { x: number; y: number }) => {
      onManualEdit?.({ stepId, textPosition: position, type: 'decision-text' })
    },
    [onManualEdit]
  )

  const effectiveArrowConfig = useMemo(() => ({ ...(arrowConfig ?? {}), ...arrowConfigs }), [arrowConfig, arrowConfigs])

  return (
    <div className="diagram-wrapper w-full overflow-x-auto">
      <div
        id="bpmn-container"
        className="diagram-container relative mx-auto"
        style={{ width: diagramWidth, minHeight: totalDiagramHeight }}
      >
        <table className="border-2 border-black relative z-10 w-full my-5" style={{ width: diagramWidth }}>
          <tbody>
            <tr>
              {name && (
                <td
                  className="border-2 border-black w-0 relative align-top"
                  rowSpan={orderedImplementer.length}
                  style={{ width: dynamicTitleWidth }}
                >
                  <div
                    className="relative h-full flex items-center justify-center"
                    style={{ width: dynamicTitleWidth }}
                  >
                    <p
                      className="font-bold text-lg -rotate-90 text-center whitespace-nowrap"
                      style={{
                        maxWidth: orderedImplementer.length * rowHeight * safetyFactor,
                      }}
                    >
                      {capitalizeWords(name)}
                    </p>
                  </div>
                </td>
              )}
              {laneLayouts.length > 0 && (
                <>
                  <td className="border-2 border-black w-8 align-top">
                    <div
                      className="flex items-center justify-center w-8"
                      style={{ height: laneLayouts[0]?.height ?? BASE_ROW_HEIGHT }}
                    >
                      <p className="-rotate-90 origin-center whitespace-nowrap font-medium text-xs">
                        {orderedImplementer[0]?.name}
                      </p>
                    </div>
                  </td>
                  <td className="border-2 border-black p-0 align-top">
                    <div
                      className="relative overflow-x-auto"
                      style={{
                        height: laneLayouts[0]?.height ?? BASE_ROW_HEIGHT,
                        width: diagramWidth,
                      }}
                    >
                      <svg
                        className="w-full h-full block"
                        width={diagramWidth}
                        height={laneLayouts[0]?.height ?? BASE_ROW_HEIGHT}
                      >
                        {(laneLayouts[0]?.steps ?? []).map((step) => (
                          <g key={step.id}>
                            {step.type === 'terminator' && (
                              <Event
                                id={step.id}
                                x={step.x}
                                y={step.y}
                                text={step.seq === 0 ? 'Mulai' : 'Selesai'}
                              />
                            )}
                            {step.type === 'task' && (
                              <Activity
                                id={step.id}
                                x={step.x}
                                y={step.y}
                                width={step.width}
                                height={step.height}
                                name={step.name}
                              />
                            )}
                            {step.type === 'decision' && (
                              <Gateway id={step.id} x={step.x} y={step.y} />
                            )}
                          </g>
                        ))}
                      </svg>
                    </div>
                  </td>
                </>
              )}
            </tr>
            {laneLayouts.slice(1).map((lane, index) => (
              <tr key={lane.impId}>
                <td className="border-2 border-black w-8 align-top">
                  <div
                    className="flex items-center justify-center w-8"
                    style={{ height: lane.height }}
                  >
                    <p className="-rotate-90 origin-center whitespace-nowrap font-medium text-xs">
                      {orderedImplementer[index + 1]?.name}
                    </p>
                  </div>
                </td>
                <td className="border-2 border-black p-0 align-top">
                  <div
                    className="relative overflow-x-auto"
                    style={{ height: lane.height, width: diagramWidth }}
                  >
                    <svg
                      className="w-full h-full block"
                      width={diagramWidth}
                      height={lane.height}
                    >
                      {lane.steps.map((step) => (
                        <g key={step.id}>
                          {step.type === 'terminator' && (
                            <Event
                              id={step.id}
                              x={step.x}
                              y={step.y}
                              text={step.seq === 0 ? 'Mulai' : 'Selesai'}
                            />
                          )}
                          {step.type === 'task' && (
                            <Activity
                              id={step.id}
                              x={step.x}
                              y={step.y}
                              width={step.width}
                              height={step.height}
                              name={step.name}
                            />
                          )}
                          {step.type === 'decision' && (
                            <Gateway id={step.id} x={step.x} y={step.y} />
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Decision text overlay (per lane, positioned in global coords) */}
        {laneLayouts.length > 0 && (
          <svg
            className={`absolute left-0 top-0 z-30 ${editMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ width: diagramWidth, height: totalDiagramHeight }}
          >
            {laneLayouts.flatMap((lane, laneIndex) => {
              const yOffset = laneLayouts
                .slice(0, laneIndex)
                .reduce((a, l) => a + l.height + ROW_SPACING, 0)
              const globalY = yOffset + lane.height / 2
              return lane.steps
                .filter((s) => s.type === 'decision')
                .map((step) => (
                  <BpmnDecisionText
                    key={`dt-${step.seq}`}
                    stepId={`step-${step.seq}`}
                    stepName={step.name}
                    x={step.x}
                    y={globalY}
                    customPosition={decisionTextPositions[`step-${step.seq}`]}
                    editMode={editMode}
                    onPositionChanged={handleDecisionTextDrag}
                  />
                ))
            })}
          </svg>
        )}

        {arrowsReady && bpmnConnections.length > 0 && (
          <svg
            className="absolute inset-0 h-full z-20 pointer-events-none"
            style={{ width: diagramWidth }}
          >
            {bpmnConnections.map((conn, idx) => (
              <FlowchartArrowConnector
                key={conn.id}
                connection={conn}
                idcontainer="bpmn-container"
                idarrow={`bpmn-${idx}-${conn.id}`}
                obstacles={obstacles}
                usedSides={usedSides}
                manualConfig={effectiveArrowConfig[conn.id]}
                manualLabelPosition={labelConfig?.positions?.[conn.id]}
                onPathUpdated={onPathUpdated}
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
