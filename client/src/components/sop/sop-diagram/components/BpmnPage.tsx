import {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  startTransition,
} from 'react'
import { Event, Gateway } from '../shapes/bpmn/BpmnBasicShapes'
import { Activity } from '../shapes/bpmn/Activity'
import type {
  FlowchartConnection,
  UsedSides,
  PathUpdatedPayload,
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
import { useSopDiagramPrintReadyDispatch } from '../hooks/use-sop-diagram-print-ready-dispatch'
import {
  findConnectionIdsWithCrossings,
  sortConnectionsForRouting,
} from '../core/route/connection-route-order.util'
import { applyUsedSidePayload } from '../core/route/used-side-usage.util'

const MAX_BPMN_ROUTING_RECONCILE_PASSES = 4
import { SOP_DOCUMENT_CONTENT_WRAPPER_CLASS } from '../layout/sopDocumentLayout'
import {
  BPMN_BASE_ROW_HEIGHT,
  BPMN_RIGHT_MARGIN,
  BPMN_ROW_SPACING,
  BPMN_SOP_CONTENT_MAX_WIDTH_PX,
  BPMN_TASK_MIN_WIDTH,
} from '../layout/bpmnDiagramMetrics'
import { computeBpmnLayout } from '../layout/bpmn-layout.engine'

const LAYOUT_ORIGIN_EPS = 2
const RESIZE_OBSERVER_DEBOUNCE_MS = 120

function originsNearlyEqual(
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean {
  return Math.abs(a.x - b.x) <= LAYOUT_ORIGIN_EPS && Math.abs(a.y - b.y) <= LAYOUT_ORIGIN_EPS
}

function obstacleRectsSignature(
  rects: Array<{ left: number; top: number; width: number; height: number }> | null,
): string {
  if (!rects?.length) return ''
  return rects.map((r) => `${r.left}|${r.top}|${r.width}|${r.height}`).join(';')
}

function laneLayoutsGeometrySignature(
  layouts: Array<{
    steps: Array<{ id: string; x: number; y: number; width: number; height: number; columnIndex: number }>
  }>,
): string {
  return layouts
    .flatMap((lane) => lane.steps)
    .map((s) => `${s.id}:${s.x}:${s.y}:${s.width}:${s.height}:${s.columnIndex}`)
    .join(';')
}

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
  processedSteps: ProcessedBpmnStep[]
  pageConnections: FlowchartConnection[]
  name?: string
  implementers: Implementer[]
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
    onManualChange?: (payload: PathUpdatedPayload) => void
    onSelectConnection?: (connectionId: string | null) => void
  }
}

export function BpmnPage({
  pageIndex,
  isLastPage,
  processedSteps,
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
  const selectedConnectionId = config?.selectedConnectionId ?? null
  const onManualChangeProp = events?.onManualChange
  const onSelectConnectionProp = events?.onSelectConnection
  const [arrowConfigs, setArrowConfigs] = useState<Record<string, ArrowConnectionConfig>>({})
  const [usedSides, setUsedSides] = useState<UsedSides>({})
  const routedSegmentsRef = useRef<Map<string, OccupiedSegment[]>>(new Map())
  const obstacleRectsRef = useRef<Array<{ left: number; top: number; width: number; height: number }> | null>(null)
  const routingPriorityIdsRef = useRef<Set<string>>(new Set())
  const lastRoutingViolatorSigRef = useRef<string | null>(null)
  const [routingReconcilePass, setRoutingReconcilePass] = useState(0)
  useLayoutEffect(() => {
    routedSegmentsRef.current = new Map()
    layoutMeasureLockedForGeomRef.current = ''
    setLayoutMeasureVersion(0)
    routingPriorityIdsRef.current = new Set()
    lastRoutingViolatorSigRef.current = null
    setRoutingReconcilePass(0)
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
        decisionTextGlobalY?: number
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
    processedSteps.forEach((step) => {
      if (step.id_implementer && map.has(step.id_implementer) && !seen.has(step.id_implementer)) {
        seen.add(step.id_implementer)
        order.push(map.get(step.id_implementer)!)
      }
    })
    implementers.forEach((impl) => {
      if (!seen.has(impl.id)) order.push(impl)
    })
    return order
  }, [implementers, processedSteps])

  const bpmnConnections = useMemo(
    () =>
      sortConnectionsForRouting(pageConnections, pathLayoutSeed, {
        priorityIds: routingPriorityIdsRef.current,
        reconcilePass: routingReconcilePass,
        priorityRoutesLast: true,
      }),
    [pageConnections, pathLayoutSeed, routingReconcilePass],
  )
  const connectionIdsSig = useMemo(
    () => [...new Set(bpmnConnections.map((conn) => conn.id))].sort().join('|'),
    [bpmnConnections],
  )
  const routableConnectionCount = bpmnConnections.length
  useLayoutEffect(() => {
    routedSegmentsRef.current = new Map()
  }, [connectionIdsSig, routingReconcilePass])

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
    startTransition(() => {
      if (!onManualChangeProp) {
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
      }
      setUsedSides((prev) => applyUsedSidePayload(prev, payload))
    })
  }, [onManualChangeProp])

  const [layoutDiagramWidth, setLayoutDiagramWidth] = useState(0)

  const applyBpmnLayout = useCallback(() => {
    const titleReserve = name ? 48 : 0
    const result = computeBpmnLayout({
      steps: processedSteps,
      connections: pageConnections,
      implementerIds: orderedImplementer.map((impl) => impl.id),
      contentMaxWidthPx: BPMN_SOP_CONTENT_MAX_WIDTH_PX - titleReserve,
    })
    if (!result) return
    layoutRef.current = {
      steps: result.globalSteps,
      columnStartXs: result.columnStartXs,
      maxColumnWidths: result.maxColumnWidths,
    }
    setLayoutDiagramWidth(result.diagramContentWidth)
    setLaneLayouts(result.laneLayouts)
    setBpmnLaneLayoutForRouter(result.bpmnLaneLayoutForRouter)
  }, [processedSteps, orderedImplementer, pageConnections, name])

  useEffect(() => {
    applyBpmnLayout()
  }, [applyBpmnLayout])

  const bpmnBoundsRef = useRef<{ left: number; top: number; right: number; bottom: number } | null>(null)

  const diagramWidth = useMemo(() => {
    if (layoutDiagramWidth > 0) return layoutDiagramWidth
    if (!laneLayouts.length) return BPMN_RIGHT_MARGIN + BPMN_TASK_MIN_WIDTH + BPMN_RIGHT_MARGIN
    const allSteps = laneLayouts.flatMap((l) => l.steps)
    if (!allSteps.length) return BPMN_RIGHT_MARGIN + BPMN_TASK_MIN_WIDTH + BPMN_RIGHT_MARGIN
    const maxX = Math.max(...allSteps.map((s) => s.x + (s.width ?? 0) / 2))
    return maxX + BPMN_RIGHT_MARGIN
  }, [laneLayouts, layoutDiagramWidth])

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

  const charWidth = 9
  const dynamicTitleWidth = name
    ? (() => {
        const maxW = Math.max(120, swimlaneTableBodyHeight * 0.85)
        const textW = name.length * charWidth
        const lineCount = textW <= maxW ? 1 : Math.ceil(textW / maxW)
        return lineCount * 30 + 20
      })()
    : 0

  /** Lebar minimum scroll = judul SOP + kolom aktor + area diagram (selaras dengan layout engine). */
  const swimlaneTableMinWidth = dynamicTitleWidth + 32 + diagramWidth

  const measureBpmnContainerSize = useCallback(() => {
    const container = document.getElementById(containerId)
    if (!container) return { width: 0, height: 0 }
    const containerRect = container.getBoundingClientRect()
    const w = Math.round(containerRect.width)
    const h = Math.round(Math.max(containerRect.height, totalDiagramHeight))
    const contentWidth = dynamicTitleWidth + 32 + diagramWidth
    bpmnBoundsRef.current = {
      left: 0,
      top: 0,
      right: Math.max(w, contentWidth),
      bottom: h,
    }
    setContainerSize((prev) => {
      if (prev.width === w && prev.height === h) return prev
      return { width: w, height: h }
    })
    return { width: w, height: h }
  }, [containerId, totalDiagramHeight, diagramWidth, dynamicTitleWidth])

  const laneLayoutGeomSig = useMemo(
    () => laneLayoutsGeometrySignature(laneLayouts),
    [laneLayouts],
  )
  const prevLaneGeomSigRef = useRef('')
  const prevLayoutOriginRef = useRef({ x: 0, y: 0 })
  const prevObstacleSigRef = useRef('')
  const layoutMeasureLockedForGeomRef = useRef('')

  useEffect(() => {
    if (processedSteps.length === 0) {
      setArrowsReady(false)
      prevLaneGeomSigRef.current = ''
      return
    }
    const geomUnchanged = laneLayoutGeomSig === prevLaneGeomSigRef.current
    prevLaneGeomSigRef.current = laneLayoutGeomSig
    if (geomUnchanged) return
    layoutMeasureLockedForGeomRef.current = ''
    setLayoutMeasureVersion(0)
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
  }, [
    processedSteps.length,
    laneLayoutGeomSig,
    measureBpmnContainerSize,
  ])

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
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const ro = new ResizeObserver(() => {
      if (debounceTimer !== null) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        measureBpmnContainerSize()
      }, RESIZE_OBSERVER_DEBOUNCE_MS)
    })
    ro.observe(container)
    return () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer)
      ro.disconnect()
    }
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
  }, [containerId, laneLayouts])

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
    const nextObstacleSig = obstacleRectsSignature(filtered.length > 0 ? filtered : null)
    obstacleRectsRef.current = filtered.length > 0 ? filtered : null
    const origin = measureLayoutContentOrigin()
    setLayoutContentOrigin((prev) => (originsNearlyEqual(prev, origin) ? prev : origin))
    const originChanged = !originsNearlyEqual(prevLayoutOriginRef.current, origin)
    prevLayoutOriginRef.current = origin
    prevObstacleSigRef.current = nextObstacleSig
    if (layoutMeasureLockedForGeomRef.current === laneLayoutGeomSig) {
      if (originChanged) {
        setLayoutMeasureVersion((v) => v + 1)
      }
      return
    }
    layoutMeasureLockedForGeomRef.current = laneLayoutGeomSig
    setLayoutMeasureVersion((v) => (v === 0 ? 1 : v))
  }, [
    pathLayoutSeed,
    obstacles,
    laneLayoutGeomSig,
    arrowsReady,
    measureLayoutContentOrigin,
    containerId,
  ])

  const layoutMeasured = layoutMeasureVersion > 0

  useEffect(() => {
    if (!arrowsReady || !layoutMeasured || bpmnConnections.length === 0) return
    const timer = window.setTimeout(() => {
      if (routedSegmentsRef.current.size < bpmnConnections.length) return
      const violators = findConnectionIdsWithCrossings(routedSegmentsRef.current)
      if (violators.length === 0) {
        lastRoutingViolatorSigRef.current = null
        return
      }
      const sig = [...violators].sort().join('|')
      if (lastRoutingViolatorSigRef.current === sig) return
      if (routingReconcilePass >= MAX_BPMN_ROUTING_RECONCILE_PASSES) return
      lastRoutingViolatorSigRef.current = sig
      routingPriorityIdsRef.current = new Set(violators)
      startTransition(() => {
        setRoutingReconcilePass((pass) => pass + 1)
      })
    }, 160)
    return () => window.clearTimeout(timer)
  }, [
    arrowsReady,
    layoutMeasured,
    bpmnConnections.length,
    connectionIdsSig,
    routingReconcilePass,
    layoutMeasureVersion,
    layoutContentOrigin.x,
    layoutContentOrigin.y,
  ])

  const layoutOriginSig = `${Math.round(layoutContentOrigin.x)}|${Math.round(layoutContentOrigin.y)}`
  const arrowRerouteVersion =
    pathLayoutSeed +
    layoutMeasureVersion * 1000 +
    routingReconcilePass * 10_000 +
    Math.round(layoutContentOrigin.x) * 17 +
    Math.round(layoutContentOrigin.y)
  const arrowOverlayWidth = swimlaneTableMinWidth
  const arrowOverlayHeight = Math.max(containerSize.height, totalDiagramHeight, 1)
  const showArrowLayer =
    arrowsReady &&
    layoutMeasured &&
    routerLaneLayout != null &&
    bpmnConnections.length > 0 &&
    (arrowOverlayWidth > 0 || arrowOverlayHeight > 0)

  useSopDiagramPrintReadyDispatch(
    containerId,
    arrowsReady && layoutMeasured,
    routableConnectionCount,
    arrowRerouteVersion,
  )

  const effectiveArrowConfig = useMemo(() => ({ ...(arrowConfig ?? {}), ...arrowConfigs }), [arrowConfig, arrowConfigs])

  const A4_LANDSCAPE_PX = 1123 /* 297mm at 96dpi */
  const printScale = Math.min(1, A4_LANDSCAPE_PX / swimlaneTableMinWidth)

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
        data-sop-diagram-root
        data-sop-connection-count={routableConnectionCount}
        className="diagram-container relative w-full min-w-0 max-w-full overflow-x-auto overflow-y-visible print:origin-top-left"
        style={{
          minHeight: totalDiagramHeight,
          height: totalDiagramHeight > 0 ? totalDiagramHeight : undefined,
          printColorAdjust: 'exact',
        }}
      >
        <div
          className="relative shrink-0"
          style={{ width: swimlaneTableMinWidth, minWidth: swimlaneTableMinWidth }}
        >
        <table
          className="border-2 border-black relative z-10 table-fixed my-5"
          style={{ width: swimlaneTableMinWidth, minWidth: swimlaneTableMinWidth }}
        >
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
                    <p className="origin-center font-bold text-lg -rotate-90 text-center whitespace-nowrap">
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
                  <td className="border-2 border-black p-0 align-top">
                    <div
                      className="relative overflow-visible"
                      style={{
                        width: diagramWidth,
                        minWidth: diagramWidth,
                        height: laneLayouts[0]?.height ?? BPMN_BASE_ROW_HEIGHT,
                      }}
                    >
                      <svg
                        className="block shrink-0"
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
                                variant={step.seq === 0 ? 'start' : 'end'}
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
                <td className="border-2 border-black p-0 align-top">
                  <div
                    className="relative overflow-visible"
                    style={{ width: diagramWidth, minWidth: diagramWidth, height: lane.height }}
                  >
                    <svg className="block shrink-0" width={diagramWidth} height={lane.height}>
                      {lane.steps.map((step) => (
                        <g key={step.id}>
                          {step.type === 'terminator' && (
                            <Event
                              id={step.id}
                              x={step.x}
                              y={step.y}
                              text={step.seq === 0 ? 'Mulai' : 'Selesai'}
                              variant={step.seq === 0 ? 'start' : 'end'}
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
        </div>

        {showArrowLayer && (
          <svg
            className={`absolute left-0 top-0 z-40 shrink-0 overflow-visible ${editMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
            width={arrowOverlayWidth}
            height={arrowOverlayHeight}
            style={{ minWidth: swimlaneTableMinWidth }}
            onClick={() => onSelectConnectionProp?.(null)}
          >
            {bpmnConnections.map((conn, idx) => {
              const meta = bpmnConnectionsMeta[idx]
              if (!meta || !routerLaneLayout) return null
              const connectorKey = `${conn.id}-${arrowRerouteVersion}-${layoutOriginSig}-r${routingReconcilePass}`
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
                  onManualChange={onManualChangeProp}
                  editMode={editMode}
                  isSelected={selectedConnectionId === conn.id}
                  onSelect={(id) => onSelectConnectionProp?.(id)}
                  constraintRect={bpmnBoundsRef.current}
                  routedSegmentsRef={routedSegmentsRef}
                  rerouteVersion={arrowRerouteVersion}
                  obstacleRectsRef={obstacleRectsRef}
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
