import {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react'
import { Event, Gateway } from '../shapes/bpmn/BpmnBasicShapes'
import { Activity } from '../shapes/bpmn/Activity'
import { BpmnDecisionText } from '../shapes/bpmn/DecisionText'
import {
  FlowchartArrowConnector,
  type FlowchartConnection,
  type UsedSides,
  type PathUpdatedPayload,
} from '../shapes/FlowchartArrowConnector'
import { BpmnArrowConnector } from '../shapes/BpmnArrowConnector'
import type { BpmnConnectionMeta, BpmnLaneLayout } from '../core/route/bpmnRouter'
import type { OccupiedSegment } from '../core/route/orthogonalRouter'
import type {
  Implementer,
  SOPStep,
  ArrowConfig,
  ArrowConnectionConfig,
  LabelConfig,
} from '../core/sopDiagramTypes'
import { SOP_BEFORE_PRINT_EVENT } from '@/lib/print/sop-print-events'
import { SOP_DOCUMENT_CONTENT_WRAPPER_CLASS } from '../layout/sopDocumentLayout'
import {
  BPMN_BASE_ROW_HEIGHT,
  BPMN_BASE_X,
  BPMN_COLUMN_SPACING,
  BPMN_LANE_STEP_PADDING,
  BPMN_RIGHT_MARGIN,
  BPMN_ROW_SPACING,
  BPMN_TASK_MIN_HEIGHT,
  BPMN_TASK_MIN_WIDTH,
  getBpmnStepLayoutDimensions,
} from '../layout/bpmnDiagramMetrics'

export interface ProcessedBpmnStep extends SOPStep {
  id_step: string
  seq_number: number
}

function capitalizeWords(s: string): string {
  return (s ?? '').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Satu struktur markup + rotasi eksplisit untuk semua baris swimlane (hindari teks aktor row 2+ terasa terbalik). */
function SwimlaneActorNameCell(props: { laneHeightPx: number; label: string | undefined }) {
  const { laneHeightPx, label } = props
  return (
    <td className="border-2 border-black w-8 align-middle p-0">
      {/* translate + rotate bersama menjaga pusat geometris di tengah sel w-8 (grid saja bisa terlihat miring kanan/kanan). */}
      <div className="relative w-8 shrink-0 overflow-visible" style={{ height: laneHeightPx }}>
        <span
          className="absolute left-1/2 top-1/2 whitespace-nowrap text-center font-medium text-xs leading-none"
          style={{
            direction: 'ltr',
            transform: 'translate(-50%, -50%) rotate(-90deg)',
            unicodeBidi: 'isolate',
          }}
        >
          {label ?? ''}
        </span>
      </div>
    </td>
  )
}

export interface BpmnPageProps {
  pageIndex: number
  isLastPage: boolean
  maxTaskSeq: number
  pageSteps: SOPStep[]
  pageConnections: FlowchartConnection[]
  name?: string
  implementers: Implementer[]
  config?: {
    pathLayoutSeed?: number
    arrowConfig?: ArrowConfig
    labelConfig?: LabelConfig
    editMode?: boolean
  }
  events?: {
    onManualEdit?: (config: unknown) => void
    onLabelEdit?: (config: unknown) => void
  }
}

export function BpmnPage({
  pageIndex,
  isLastPage,
  maxTaskSeq,
  pageSteps,
  pageConnections,
  name = '',
  implementers,
  config,
  events,
}: BpmnPageProps) {
  const containerId = `bpmn-container-${pageIndex}`
  const pathLayoutSeed = config?.pathLayoutSeed ?? 0
  const arrowConfig = config?.arrowConfig
  const labelConfig = config?.labelConfig
  const editMode = config?.editMode ?? false
  const onManualEdit = events?.onManualEdit
  const [arrowConfigs, setArrowConfigs] = useState<Record<string, ArrowConnectionConfig>>({})
  const [usedSides, setUsedSides] = useState<UsedSides>({})
  const routedSegmentsRef = useRef<Map<string, OccupiedSegment[]>>(new Map())
  const obstacleRectsRef = useRef<Array<{ left: number; top: number; width: number; height: number }> | null>(null)
  useLayoutEffect(() => {
    routedSegmentsRef.current = new Map()
  }, [pathLayoutSeed])
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
  const [bpmnLaneLayoutForRouter, setBpmnLaneLayoutForRouter] = useState<BpmnLaneLayout | null>(null)
  const [layoutContentOrigin, setLayoutContentOrigin] = useState({ x: 0, y: 0 })
  const [layoutMeasureVersion, setLayoutMeasureVersion] = useState(0)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const orderedImplementer = useMemo(() => {
    if (!implementers?.length) return []
    const map = new Map(implementers.map((i) => [i.id, i]))
    const seen = new Set<string>()
    const order: Implementer[] = []
    pageSteps.forEach((step) => {
      if (step.id_implementer && map.has(step.id_implementer) && !seen.has(step.id_implementer)) {
        seen.add(step.id_implementer)
        order.push(map.get(step.id_implementer)!)
      }
    })
    implementers.forEach((impl) => {
      if (!seen.has(impl.id)) order.push(impl)
    })
    return order
  }, [implementers, pageSteps])

  const processedSteps = useMemo((): ProcessedBpmnStep[] => {
    if (!pageSteps.length) return []
    const sorted = [...pageSteps].sort((a, b) => a.seq_number - b.seq_number)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const result: ProcessedBpmnStep[] = []
    if (pageIndex === 0) {
      result.push({
        id_step: 'start-terminator',
        seq_number: 0,
        name: 'Mulai',
        type: 'terminator',
        id_implementer: first?.id_implementer,
      })
    }
    sorted.forEach((s) => {
      result.push({
        ...s,
        type: s.type === 'terminator' ? 'task' : s.type,
        seq_number: s.seq_number,
        id_step: s.id_step ?? `step-${s.seq_number}`,
      })
    })
    if (isLastPage) {
      result.push({
        id_step: 'end-terminator',
        seq_number: maxTaskSeq + 1,
        name: 'Selesai',
        type: 'terminator',
        id_implementer: last?.id_implementer,
      })
    }
    return result
  }, [pageSteps, pageIndex, isLastPage, maxTaskSeq])

  const bpmnConnections = pageConnections

  const obstacles = useMemo(
    () => processedSteps.map((s) => ({ id: `bpmn-step-${s.seq_number}` })),
    [processedSteps]
  )

  const bpmnConnectionsMeta = useMemo((): BpmnConnectionMeta[] => {
    if (!laneLayouts.length) return []
    const stepMap = new Map<string, { lane: number; columnIndex: number }>()
    laneLayouts.flatMap((l) => l.steps).forEach((s) => {
      stepMap.set(s.id, { lane: s.lane, columnIndex: s.columnIndex })
    })
    return bpmnConnections.map((conn) => {
      const fromStep = stepMap.get(conn.from)
      const toStep = stepMap.get(conn.to)
      return {
        id: conn.id,
        from: conn.from,
        to: conn.to,
        label: conn.label ?? null,
        sourceType: conn.sourceType,
        targetType: conn.targetType,
        fromLane: fromStep?.lane ?? 0,
        toLane: toStep?.lane ?? 0,
        fromCol: fromStep?.columnIndex ?? 0,
        toCol: toStep?.columnIndex ?? 0,
      }
    })
  }, [bpmnConnections, laneLayouts])

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
      stepDimensionsCache.set(step.id_step, getBpmnStepLayoutDimensions(step.name, step.type))
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
    let curX = BPMN_BASE_X
    for (let i = 0; i <= maxColIdx; i++) {
      columnStartXs[i] = curX
      curX += maxColumnWidths[i] + BPMN_COLUMN_SPACING
    }

    const laneMaxHeights = new Array(numLanes).fill(BPMN_BASE_ROW_HEIGHT)
    processedSteps.forEach((step) => {
      let laneIdx = orderedImplementer.findIndex((i) => i.id === step.id_implementer)
      if (laneIdx === -1) laneIdx = 0
      const dims = stepDimensionsCache.get(step.id_step) ?? {
        width: BPMN_TASK_MIN_WIDTH,
        height: BPMN_TASK_MIN_HEIGHT,
      }
      laneMaxHeights[laneIdx] = Math.max(laneMaxHeights[laneIdx], dims.height + BPMN_LANE_STEP_PADDING)
    })

    const laneYPositions: number[] = []
    let cumulativeY = 0
    for (let i = 0; i < numLanes; i++) {
      laneYPositions[i] = cumulativeY + laneMaxHeights[i] / 2
      cumulativeY += laneMaxHeights[i] + BPMN_ROW_SPACING
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
      const dims = stepDimensionsCache.get(step.id_step) ?? {
        width: BPMN_TASK_MIN_WIDTH,
        height: BPMN_TASK_MIN_HEIGHT,
      }
      const colStart = columnStartXs[columnIndex] ?? BPMN_BASE_X
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
      const laneHeight = stepsInLane[0]?.laneHeight ?? BPMN_BASE_ROW_HEIGHT
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

    if (layouts.length > 0) {
      let laneTop = 0
      const lanes = layouts.map((l, i) => {
        const info = { index: i, top: laneTop, height: l.height }
        laneTop += l.height + BPMN_ROW_SPACING
        return info
      })
      setBpmnLaneLayoutForRouter({
        lanes,
        columnStartXs,
        columnWidths: maxColumnWidths,
      })
    } else {
      setBpmnLaneLayoutForRouter(null)
    }
  }, [processedSteps, orderedImplementer, bpmnConnections])

  useEffect(() => {
    calculateGlobalLayout()
  }, [calculateGlobalLayout])

  const bpmnBoundsRef = useRef<{ left: number; top: number; right: number; bottom: number } | null>(null)

  const diagramWidth = useMemo(() => {
    if (!laneLayouts.length) return BPMN_RIGHT_MARGIN + BPMN_TASK_MIN_WIDTH + BPMN_RIGHT_MARGIN
    const allSteps = laneLayouts.flatMap((l) => l.steps)
    if (!allSteps.length) return BPMN_RIGHT_MARGIN + BPMN_TASK_MIN_WIDTH + BPMN_RIGHT_MARGIN
    const maxX = Math.max(...allSteps.map((s) => s.x + (s.width ?? 0) / 2))
    return maxX + BPMN_RIGHT_MARGIN
  }, [laneLayouts])

  const totalDiagramHeight = useMemo(() => {
    if (!laneLayouts.length) return BPMN_BASE_ROW_HEIGHT
    return laneLayouts.reduce(
      (acc, l, i) => acc + l.height + (i < laneLayouts.length - 1 ? BPMN_ROW_SPACING : 0),
      0
    )
  }, [laneLayouts])

  /** Tinggi badan tabel swimlane (tanpa ROW_SPACING antar-baris) — dipakai agar sel judul rowSpan ikut membangun tinggi baris */
  const swimlaneTableBodyHeight = useMemo(() => {
    if (!laneLayouts.length) return BPMN_BASE_ROW_HEIGHT
    return laneLayouts.reduce((sum, l) => sum + l.height, 0)
  }, [laneLayouts])

  const measureBpmnContainerSize = useCallback(() => {
    const container = document.getElementById(containerId)
    if (!container) return { width: 0, height: 0 }
    const containerRect = container.getBoundingClientRect()
    const w = Math.round(containerRect.width)
    const h = Math.round(Math.max(containerRect.height, totalDiagramHeight))
    bpmnBoundsRef.current = {
      left: 0,
      top: 0,
      right: w,
      bottom: h,
    }
    setContainerSize({ width: w, height: h })
    return { width: w, height: h }
  }, [containerId, totalDiagramHeight])

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

  useEffect(() => {
    if (processedSteps.length === 0) {
      setArrowsReady(false)
      return
    }
    setArrowsReady(false)
    let cancelled = false
    const run = () => {
      requestAnimationFrame(() => {
        if (cancelled) return
        requestAnimationFrame(() => {
          if (cancelled) return
          measureBpmnContainerSize()
          setArrowsReady(true)
        })
      })
    }
    run()
    return () => { cancelled = true }
  }, [processedSteps.length, laneLayouts.length, diagramWidth, dynamicTitleWidth, measureBpmnContainerSize, bpmnConnections.length, bpmnConnectionsMeta.length])

  useEffect(() => {
    const onBeforePrint = () => {
      measureBpmnContainerSize()
    }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener(SOP_BEFORE_PRINT_EVENT, onBeforePrint)
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener(SOP_BEFORE_PRINT_EVENT, onBeforePrint)
    }
  }, [measureBpmnContainerSize])

  useEffect(() => {
    if (processedSteps.length === 0 || laneLayouts.length === 0) return
    const container = document.getElementById(containerId)
    if (!container || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      measureBpmnContainerSize()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [processedSteps.length, laneLayouts.length, measureBpmnContainerSize, containerId])

  const measureLayoutContentOrigin = useCallback((): { x: number; y: number } => {
    const container = document.getElementById(containerId)
    const firstStep = laneLayouts[0]?.steps[0]
    if (!container || !firstStep) return { x: 0, y: 0 }
    const el =
      container.querySelector<SVGElement>(`#${CSS.escape(firstStep.id)}`) ??
      document.getElementById(firstStep.id)
    if (!el) return { x: 0, y: 0 }
    const shapeRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const layoutLeft = firstStep.x - (firstStep.width ?? 0) / 2
    const layoutTop = firstStep.y - (firstStep.height ?? 0) / 2
    return {
      x: Math.round(shapeRect.left - containerRect.left - layoutLeft),
      y: Math.round(shapeRect.top - containerRect.top - layoutTop),
    }
  }, [laneLayouts])

  const routerLaneLayout = useMemo((): BpmnLaneLayout | null => {
    if (!bpmnLaneLayoutForRouter) return null
    return {
      ...bpmnLaneLayoutForRouter,
      originX: layoutContentOrigin.x,
      originY: layoutContentOrigin.y,
    }
  }, [bpmnLaneLayoutForRouter, layoutContentOrigin])

  useLayoutEffect(() => {
    if (!arrowsReady) return
    const container = document.getElementById(containerId)
    if (!container) {
      obstacleRectsRef.current = null
      return
    }
    const OBSTACLE_MARGIN = 10
    const rects = obstacles.map((o) => {
      const el =
        container.querySelector<SVGElement>(`#${CSS.escape(o.id)}`) ??
        document.getElementById(o.id)
      if (!el) return null
      const r = el.getBoundingClientRect()
      const c = container.getBoundingClientRect()
      return {
        left: Math.round(r.left - c.left) - OBSTACLE_MARGIN,
        top: Math.round(r.top - c.top) - OBSTACLE_MARGIN,
        width: Math.round(r.width) + OBSTACLE_MARGIN * 2,
        height: Math.round(r.height) + OBSTACLE_MARGIN * 2,
      }
    })
    const filtered = rects.filter((r): r is NonNullable<typeof r> => r != null)
    obstacleRectsRef.current = filtered.length > 0 ? filtered : null
    measureBpmnContainerSize()
    const origin = measureLayoutContentOrigin()
    setLayoutContentOrigin(origin)
    setLayoutMeasureVersion((v) => v + 1)
  }, [
    pathLayoutSeed,
    obstacles,
    laneLayouts.length,
    arrowsReady,
    diagramWidth,
    measureLayoutContentOrigin,
    measureBpmnContainerSize,
    bpmnConnections.length,
  ])

  const arrowRerouteVersion = pathLayoutSeed + layoutMeasureVersion
  const arrowOverlayWidth = Math.max(containerSize.width, diagramWidth, 1)
  const arrowOverlayHeight = Math.max(containerSize.height, totalDiagramHeight, 1)
  const layoutMeasured = layoutMeasureVersion > 0
  const showArrowLayer =
    arrowsReady &&
    layoutMeasured &&
    bpmnConnections.length > 0 &&
    (arrowOverlayWidth > 0 || arrowOverlayHeight > 0)

  const decisionTextPositions = labelConfig?.positions ?? {}
  const handleDecisionTextDrag = useCallback(
    (stepId: string, position: { x: number; y: number }) => {
      onManualEdit?.({ stepId, textPosition: position, type: 'decision-text' })
    },
    [onManualEdit]
  )

  const effectiveArrowConfig = useMemo(() => ({ ...(arrowConfig ?? {}), ...arrowConfigs }), [arrowConfig, arrowConfigs])

  const A4_LANDSCAPE_PX = 1123 /* 297mm at 96dpi */
  const printScale = Math.min(1, A4_LANDSCAPE_PX / diagramWidth)

  return (
    <div
      className={`print-page mx-auto ${SOP_DOCUMENT_CONTENT_WRAPPER_CLASS} print:my-0 print:mx-auto [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${isLastPage ? 'print-last-page' : ''}`}
    >
      <div
        className="diagram-wrapper box-border w-full min-w-0 overflow-visible [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
        style={{ '--bpmn-print-scale': printScale } as React.CSSProperties}
      >
      <div
        id={containerId}
        className="diagram-container relative w-full min-w-0 print:origin-top-left"
        style={{
          minHeight: totalDiagramHeight,
          height: totalDiagramHeight > 0 ? totalDiagramHeight : undefined,
          printColorAdjust: 'exact',
        }}
      >
        <table className="border-2 border-black relative z-10 w-full table-fixed my-5">
          <tbody>
            <tr>
              {name && (
                <td
                  className="border-2 border-black w-0 align-middle p-0"
                  rowSpan={orderedImplementer.length}
                  style={{ width: dynamicTitleWidth }}
                >
                  <div
                    className="flex items-center justify-center overflow-visible"
                    style={{
                      width: dynamicTitleWidth,
                      height: swimlaneTableBodyHeight,
                    }}
                  >
                    <p
                      className="origin-center font-bold text-lg -rotate-90 text-center whitespace-nowrap"
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
                  <SwimlaneActorNameCell
                    laneHeightPx={laneLayouts[0]?.height ?? BPMN_BASE_ROW_HEIGHT}
                    label={orderedImplementer[0]?.name}
                  />
                  <td className="border-2 border-black p-0 align-top w-full">
                    <div
                      className="relative w-full overflow-x-auto"
                      style={{ height: laneLayouts[0]?.height ?? BPMN_BASE_ROW_HEIGHT }}
                    >
                      <svg
                        className="block"
                        width={diagramWidth}
                        height={laneLayouts[0]?.height ?? BPMN_BASE_ROW_HEIGHT}
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
                <SwimlaneActorNameCell laneHeightPx={lane.height} label={orderedImplementer[index + 1]?.name} />
                <td className="border-2 border-black p-0 align-top w-full">
                  <div className="relative w-full overflow-x-auto" style={{ height: lane.height }}>
                    <svg
                      className="block"
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
            className={`absolute inset-0 z-30 h-full w-full ${editMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {laneLayouts.flatMap((lane, laneIndex) => {
              const yOffset = laneLayouts
                .slice(0, laneIndex)
                .reduce((a, l) => a + l.height + BPMN_ROW_SPACING, 0)
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

        {showArrowLayer && (
          <svg
            className="pointer-events-none absolute left-0 top-0 z-40 overflow-visible"
            width={arrowOverlayWidth}
            height={arrowOverlayHeight}
          >
            {bpmnConnections.map((conn, idx) => {
              const meta = bpmnConnectionsMeta[idx]
              const hasValidLayout =
                routerLaneLayout?.lanes?.length != null && routerLaneLayout.lanes.length > 0
              const useBpmnConnector =
                hasValidLayout && routerLaneLayout && meta && bpmnConnectionsMeta.length === bpmnConnections.length
              const connectorKey = `${conn.id}-${arrowRerouteVersion}`
              if (useBpmnConnector) {
                return (
                  <BpmnArrowConnector
                    key={connectorKey}
                    connection={meta}
                    idcontainer={containerId}
                    idarrow={`bpmn-${idx}-${conn.id}`}
                    obstacles={obstacles}
                    usedSides={usedSides}
                    laneLayout={routerLaneLayout}
                    connectionIndex={idx}
                    allConnectionsMeta={bpmnConnectionsMeta}
                    manualConfig={effectiveArrowConfig[conn.id]}
                    manualLabelPosition={labelConfig?.positions?.[conn.id]}
                    onPathUpdated={onPathUpdated}
                    constraintRect={bpmnBoundsRef.current}
                    routedSegmentsRef={routedSegmentsRef}
                    rerouteVersion={arrowRerouteVersion}
                    obstacleRectsRef={obstacleRectsRef}
                  />
                )
              }
              return (
                <FlowchartArrowConnector
                  key={connectorKey}
                  connection={conn}
                  idcontainer={containerId}
                  idarrow={`bpmn-${idx}-${conn.id}`}
                  obstacles={obstacles}
                  usedSides={usedSides}
                  connectionIndex={idx}
                  allConnections={bpmnConnections}
                  manualConfig={effectiveArrowConfig[conn.id]}
                  manualLabelPosition={labelConfig?.positions?.[conn.id]}
                  onPathUpdated={onPathUpdated}
                  constraintRect={bpmnBoundsRef.current}
                  routedSegmentsRef={routedSegmentsRef}
                />
              )
            })}
          </svg>
        )}
      </div>
      </div>
    </div>
  )
}
