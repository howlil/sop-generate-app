import { useLayoutEffect, useState, useRef, type MutableRefObject } from 'react'
import type { ArrowConnectionConfig, ArrowPathPoint } from '../core/sopDiagramTypes'
import {
  routeBpmn,
  selectBpmnSidePairs,
  scorePath,
  scoreBpmnRouteCandidate,
  bpmnPathToSegments,
  translateBpmnLaneLayoutToDom,
  type BpmnConnectionMeta,
  type BpmnLaneLayout,
  type BpmnRouteCandidate,
  type BpmnRouteOptions,
  type UsedSides,
  type Side,
  type OccupiedSegment,
} from '../core/route/bpmnRouter'
import { EditableOrthogonalPath } from '../edit/EditableOrthogonalPath'
import { pathToD as pathToDUtil, simplifyOrthogonalPath } from '../edit/orthogonal-path-edit.util'
import type { DiagramPathAnchor } from '../edit/anchor-snap.util'
import type { PathShapeGuardConfig } from '../edit/path-shape-guard.util'
import type { Rect } from '../core/route/orthogonalRouter'

/* ───────────────────────── Public types ─────────────────────────── */

export interface PathUpdatedPayload {
  connectionId: string
  from: string
  to: string
  sSide: Side
  eSide: Side
  startPoint: ArrowPathPoint
  endPoint: ArrowPathPoint
  bendPoints: ArrowPathPoint[]
  label?: string | null
  labelPosition?: { x: number; y: number }
}

export type RoutedPathsRef = MutableRefObject<Map<string, OccupiedSegment[]>>

/* ───────────────────────── Props ─────────────────────────── */

interface BpmnArrowConnectorProps {
  connection: BpmnConnectionMeta
  idcontainer: string
  idarrow: string | number
  obstacles: Array<{ id: string }>
  usedSides: UsedSides
  laneLayout: BpmnLaneLayout
  /** Index of this connection in the full list; used for deterministic anchor slots (no 2 heads at same point). */
  connectionIndex: number
  /** Full list of connection metas; used with connectionIndex to assign slot by order. */
  allConnectionsMeta: BpmnConnectionMeta[]
  manualConfig?: ArrowConnectionConfig | null
  manualLabelPosition?: { x: number; y: number } | null
  onPathUpdated?: (payload: PathUpdatedPayload) => void
  onManualChange?: (payload: PathUpdatedPayload) => void
  editMode?: boolean
  isSelected?: boolean
  onSelect?: (connectionId: string) => void
  constraintRect?: { left: number; top: number; right: number; bottom: number } | null
  routedSegmentsRef?: RoutedPathsRef
  rerouteVersion?: number
  /** Precomputed obstacle rects from parent (saves DOM reads when set). */
  obstacleRectsRef?: MutableRefObject<Array<{ left: number; top: number; width: number; height: number }> | null>
}

/* ───────────────────────── Helpers ─────────────────────────── */

type ElemPos = {
  left: number; top: number; width: number; height: number
  right: number; bottom: number
}

function sidePointOfRect(pos: ElemPos, side: Side): { x: number; y: number } {
  switch (side) {
    case 'top':
      return { x: Math.round(pos.left + pos.width / 2), y: pos.top }
    case 'bottom':
      return { x: Math.round(pos.left + pos.width / 2), y: pos.bottom }
    case 'left':
      return { x: pos.left, y: Math.round(pos.top + pos.height / 2) }
    case 'right':
      return { x: pos.right, y: Math.round(pos.top + pos.height / 2) }
  }
}

function buildConnectorAnchors(
  connectionId: string,
  fromPos: ElemPos,
  toPos: ElemPos,
): DiagramPathAnchor[] {
  const sides: Side[] = ['top', 'right', 'bottom', 'left']
  const startAnchors = sides.map((side) => {
    const point = sidePointOfRect(fromPos, side)
    return {
      id: `${connectionId}-start-${side}`,
      x: point.x,
      y: point.y,
      side,
      kind: 'start' as const,
    }
  })
  const endAnchors = sides.map((side) => {
    const point = sidePointOfRect(toPos, side)
    return {
      id: `${connectionId}-end-${side}`,
      x: point.x,
      y: point.y,
      side,
      kind: 'end' as const,
    }
  })
  return [...startAnchors, ...endAnchors]
}

function getElementPosition(elementId: string, container: HTMLElement): ElemPos | null {
  const el =
    container.querySelector<SVGElement>(`#${CSS.escape(elementId)}`) ??
    document.getElementById(elementId)
  if (!el) return null
  const containerRect = container.getBoundingClientRect()
  if (el instanceof SVGGraphicsElement) {
    try {
      const bbox = el.getBBox()
      const ctm = el.getScreenCTM()
      if (ctm && bbox.width > 0 && bbox.height > 0) {
        const topLeft = new DOMPoint(bbox.x, bbox.y).matrixTransform(ctm)
        const bottomRight = new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height).matrixTransform(ctm)
        const left = Math.round(topLeft.x - containerRect.left)
        const top = Math.round(topLeft.y - containerRect.top)
        const right = Math.round(bottomRight.x - containerRect.left)
        const bottom = Math.round(bottomRight.y - containerRect.top)
        const width = Math.max(1, right - left)
        const height = Math.max(1, bottom - top)
        if (width > 0 && height > 0) {
          return { left, top, width, height, right, bottom }
        }
      }
    } catch {
      /* getBBox/CTM gagal — fallback ke getBoundingClientRect */
    }
  }
  const shapeRect = el.getBoundingClientRect()
  return {
    left: Math.round(shapeRect.left - containerRect.left),
    top: Math.round(shapeRect.top - containerRect.top),
    width: Math.round(shapeRect.width),
    height: Math.round(shapeRect.height),
    right: Math.round(shapeRect.right - containerRect.left),
    bottom: Math.round(shapeRect.bottom - containerRect.top),
  }
}

function getFixedDistancePoint(
  start: { x: number; y: number },
  end: { x: number; y: number },
  distance: number,
  offset = 19,
): { x: number; y: number } {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return { x: start.x, y: start.y }
  const px = start.x + (dx / len) * distance
  const py = start.y + (dy / len) * distance
  if (Math.abs(dx) > Math.abs(dy)) return { x: px, y: py - offset }
  return { x: px + offset, y: py }
}

/**
 * Versi garis lurus (tanpa sudut melengkung) untuk path SVG.
 * Dipakai supaya konektor BPMN tampil sebagai polyline biasa.
 */
function pathToD(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`
  }
  return d
}

/**
 * Paksa setiap segmen path menjadi ortogonal (hanya 0°, 90°, 180°, 270°).
 * Jika ada segmen miring kecil, disnap ke horizontal/vertikal terdekat.
 */
function snapToOrthogonal(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length < 2) return points

  const out: { x: number; y: number }[] = []
  out.push({ x: Math.round(points[0].x), y: Math.round(points[0].y) })

  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1]
    const raw = points[i]
    const p = { x: Math.round(raw.x), y: Math.round(raw.y) }

    const dx = p.x - prev.x
    const dy = p.y - prev.y

    if (dx !== 0 && dy !== 0) {
      if (Math.abs(dx) <= Math.abs(dy)) {
        p.x = prev.x
      } else {
        p.y = prev.y
      }
    }

    if (p.x !== prev.x || p.y !== prev.y) {
      out.push(p)
    }
  }

  return simplifyOrthogonalPath(out)
}

function isValidManualConfig(c: ArrowConnectionConfig | null | undefined): boolean {
  if (!c?.startPoint || !c?.endPoint) return false
  const { startPoint: s, endPoint: e } = c
  return [s.x, s.y, e.x, e.y].every(v => typeof v === 'number' && !isNaN(v))
}

function rectsOverlap(a: ElemPos | { left: number; top: number; width: number; height: number }, b: ElemPos | { left: number; top: number; width: number; height: number }): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  )
}

/** Hindari shape sumber/target di daftar obstacle routing — sudah di-handle di endpoint. */
function filterRoutingObstacles(
  obsRects: Array<{ left: number; top: number; width: number; height: number }>,
  fromShape: { left: number; top: number; width: number; height: number },
  toShape: { left: number; top: number; width: number; height: number },
): Array<{ left: number; top: number; width: number; height: number }> {
  return obsRects.filter((obs) => !rectsOverlap(obs, fromShape) && !rectsOverlap(obs, toShape))
}

type ShapeRect = { left: number; top: number; width: number; height: number }

function bpmnEdgePoint(
  shape: ShapeRect,
  side: Side,
  distance: number,
  isDiamond?: boolean,
): { x: number; y: number } {
  const t = isDiamond ? 0.5 : distance
  switch (side) {
    case 'top':
      return { x: shape.left + shape.width * t, y: shape.top }
    case 'bottom':
      return { x: shape.left + shape.width * t, y: shape.top + shape.height }
    case 'left':
      return { x: shape.left, y: shape.top + shape.height * t }
    case 'right':
      return { x: shape.left + shape.width, y: shape.top + shape.height * t }
  }
}

export function buildSideAnchoredFallbackPath(
  fromShape: ShapeRect,
  toShape: ShapeRect,
  sSide: Side,
  eSide: Side,
  fromIsDiamond: boolean,
  toIsDiamond: boolean,
): { x: number; y: number }[] {
  const start = bpmnEdgePoint(fromShape, sSide, 0.5, fromIsDiamond)
  const end = bpmnEdgePoint(toShape, eSide, 0.5, toIsDiamond)
  if (Math.abs(start.x - end.x) > 8) {
    return [start, { x: end.x, y: start.y }, end]
  }
  return [start, { x: start.x, y: end.y }, end]
}

function ensureRenderableFallbackPath(
  fromShape: ShapeRect,
  toShape: ShapeRect,
  candidate: BpmnRouteCandidate,
  connection: BpmnConnectionMeta,
): { x: number; y: number }[] {
  const orthogonal = snapToOrthogonal(
    buildSideAnchoredFallbackPath(
      fromShape,
      toShape,
      candidate.sSide,
      candidate.eSide,
      connection.sourceType === 'flowchart-decision',
      connection.targetType === 'flowchart-decision',
    ),
  )
  if (orthogonal.length >= 2) return orthogonal
  const start = bpmnEdgePoint(
    fromShape,
    candidate.sSide,
    0.5,
    connection.sourceType === 'flowchart-decision',
  )
  const end = bpmnEdgePoint(
    toShape,
    candidate.eSide,
    0.5,
    connection.targetType === 'flowchart-decision',
  )
  if (start.x === end.x && start.y === end.y) {
    return [
      start,
      { x: end.x, y: end.y + 1 },
    ]
  }
  return [start, end]
}

/* ───────────────────────── Constants ─────────────────────────── */

// Coba semua side pair yang masuk akal; prioritas path tidak menembus shape, bukan rute terpendek.
const MAX_SIDE_PAIRS = 12

/* ───────────────────────── Component ─────────────────────────── */

export function BpmnArrowConnector({
  connection,
  idcontainer,
  idarrow,
  obstacles,
  usedSides,
  laneLayout,
  connectionIndex,
  allConnectionsMeta,
  manualConfig,
  manualLabelPosition,
  onPathUpdated,
  onManualChange,
  editMode = false,
  isSelected = false,
  onSelect,
  constraintRect = null,
  routedSegmentsRef,
  rerouteVersion = 0,
  obstacleRectsRef,
}: BpmnArrowConnectorProps) {
  const [pathData, setPathData] = useState('')
  const [labelPos, setLabelPos] = useState<{ x: number; y: number } | null>(null)
  const [resolvedSides, setResolvedSides] = useState<[Side, Side]>(['bottom', 'top'])
  const [resolvedPath, setResolvedPath] = useState<ArrowPathPoint[]>([])
  const [editableAnchors, setEditableAnchors] = useState<DiagramPathAnchor[]>([])
  const routingGuardRef = useRef<{
    obsRects: Rect[]
    routingObstacles: Rect[]
    fromShape: Rect
    toShape: Rect
    globalBounds: Rect
    hasDomLayout: boolean
    bpmnRepairBase: BpmnRouteOptions | null
  } | null>(null)
  const emittedRef = useRef(false)
  const lastAutoSigRef = useRef<string | null>(null)

  // Store mutable props in refs so the effect always reads fresh values
  // without needing them as dependencies (prevents infinite setState loops).
  const usedSidesRef = useRef(usedSides)
  usedSidesRef.current = usedSides
  const obstaclesRef = useRef(obstacles)
  obstaclesRef.current = obstacles
  const onPathUpdatedRef = useRef(onPathUpdated)
  onPathUpdatedRef.current = onPathUpdated
  const onManualChangeRef = useRef(onManualChange)
  onManualChangeRef.current = onManualChange
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const laneLayoutRef = useRef(laneLayout)
  laneLayoutRef.current = laneLayout
  const constraintRectRef = useRef(constraintRect)
  constraintRectRef.current = constraintRect
  const routedSegmentsRefRef = useRef(routedSegmentsRef)
  routedSegmentsRefRef.current = routedSegmentsRef

  useLayoutEffect(() => {
    // Capture ref value at effect start so cleanup always uses the right instance
    // even if the routedSegmentsRef prop changes before cleanup is called.
    const capturedRoutedSegs = routedSegmentsRefRef.current

    const container = document.getElementById(idcontainer)
    if (!container) {
      setPathData('')
      setLabelPos(null)
      setEditableAnchors([])
      routingGuardRef.current = null
      return
    }
    const fromPos = getElementPosition(connection.from, container)
    const toPos = getElementPosition(connection.to, container)
    if (!fromPos || !toPos) {
      setPathData('')
      setLabelPos(null)
      setEditableAnchors([])
      routingGuardRef.current = null
      return
    }
    setEditableAnchors(buildConnectorAnchors(connection.id, fromPos, toPos))

    const OBSTACLE_MARGIN = 10
    const curObstacles = obstaclesRef.current
    let obsRects: Rect[]
    const precomputed = obstacleRectsRef?.current
    if (precomputed != null && precomputed.length > 0) {
      obsRects = precomputed
    } else {
      obsRects = curObstacles
        .map(o => o.id)
        .map(id => getElementPosition(id, container))
        .filter((r): r is ElemPos => r != null)
        .map(r => ({
          left: r.left - OBSTACLE_MARGIN,
          top: r.top - OBSTACLE_MARGIN,
          width: r.width + OBSTACLE_MARGIN * 2,
          height: r.height + OBSTACLE_MARGIN * 2,
        }))
    }
    const curConstraint = constraintRectRef.current
    const globalBounds = curConstraint
      ? {
          left: Math.round(curConstraint.left),
          top: Math.round(curConstraint.top),
          width: Math.round(curConstraint.right - curConstraint.left),
          height: Math.round(curConstraint.bottom - curConstraint.top),
        }
      : { left: 0, top: 0, width: container.scrollWidth, height: container.scrollHeight }
    const fromShape = { left: fromPos.left, top: fromPos.top, width: fromPos.width, height: fromPos.height }
    const toShape = { left: toPos.left, top: toPos.top, width: toPos.width, height: toPos.height }
    const routingObstacles = filterRoutingObstacles(obsRects, fromShape, toShape)
    const curLayout = laneLayoutRef.current
    const domLayout =
      curLayout?.lanes != null && curLayout.lanes.length > 0
        ? translateBpmnLaneLayoutToDom(curLayout)
        : null
    routingGuardRef.current = {
      obsRects,
      routingObstacles,
      fromShape,
      toShape,
      globalBounds,
      hasDomLayout: domLayout != null,
      bpmnRepairBase: domLayout
        ? {
            fromShape,
            toShape,
            fromSide: 'bottom',
            toSide: 'top',
            fromDistance: 0.5,
            toDistance: 0.5,
            fromIsDiamond: connection.sourceType === 'flowchart-decision',
            toIsDiamond: connection.targetType === 'flowchart-decision',
            layout: domLayout,
            fromLane: connection.fromLane,
            toLane: connection.toLane,
            fromCol: connection.fromCol,
            toCol: connection.toCol,
            obstacles: routingObstacles,
            occupiedSegments: [],
            globalBounds,
          }
        : null,
    }

    /* ── Manual path ─────────────────────────────────────── */
    if (isValidManualConfig(manualConfig) && manualConfig!.startPoint && manualConfig!.endPoint) {
      const { startPoint, endPoint, bendPoints = [] } = manualConfig!
      const snapped = snapToOrthogonal([startPoint, ...bendPoints, endPoint])
      setPathData(pathToD(snapped))
      setResolvedPath(snapped.map((p) => ({ ...p })))
      setResolvedSides([manualConfig!.sSide, manualConfig!.eSide])

      const lp = connection.label
        ? manualLabelPosition ?? getFixedDistancePoint(startPoint, bendPoints[0] ?? endPoint, 30, 19)
        : null
      setLabelPos(lp)

      if (onPathUpdatedRef.current && !emittedRef.current) {
        onPathUpdatedRef.current({
          connectionId: connection.id, from: connection.from, to: connection.to,
          sSide: manualConfig!.sSide, eSide: manualConfig!.eSide,
          startPoint: { ...startPoint }, endPoint: { ...endPoint },
          bendPoints: bendPoints.map(p => ({ ...p })),
          label: connection.label ?? undefined,
          labelPosition: lp ?? undefined,
        })
        emittedRef.current = true
      }
      return
    }

    emittedRef.current = false

    if (editMode && isValidManualConfig(manualConfig)) {
      return () => {
        capturedRoutedSegs?.current.delete(connection.id)
      }
    }

    /* ── Auto-routing (BPMN lane-aware) ──────────────────── */
    const sidePairs = selectBpmnSidePairs(
      connection,
      fromShape,
      toShape,
      usedSidesRef.current,
    )

    const curRoutedSegs = capturedRoutedSegs
    const occupied: OccupiedSegment[] = []
    if (curRoutedSegs) {
      for (const [id, segs] of curRoutedSegs.current) {
        if (id !== connection.id) occupied.push(...segs)
      }
    }

    const allMeta = allConnectionsMeta

    const anchorSlots = [0.5, 0.28, 0.72, 0.18, 0.82, 0.4, 0.6]
    const anchorDistance = (count: number): number => anchorSlots[count % anchorSlots.length]
    const usedAnchorCount = (shapeId: string, side: Side) => {
      const sideUsage = usedSidesRef.current[shapeId]
      const incoming = (sideUsage?.in?.[side] ?? []).filter((id) => id !== connection.id).length
      const outgoing = (sideUsage?.out?.[side] ?? []).filter((id) => id !== connection.id).length
      return incoming + outgoing
    }
    const priorShapeUseCount = (shapeId: string) =>
      allMeta.filter((m, j) =>
        j < connectionIndex &&
        m.id !== connection.id &&
        (m.from === shapeId || m.to === shapeId)
      ).length

    let bestPath: { x: number; y: number }[] | null = null
    let bestCandidate: BpmnRouteCandidate | null = null
    let bestScore = Infinity
    let routedByEngine = false

    const tryRouteCandidates = (obstacleSet: typeof routingObstacles): void => {
      if (!domLayout) return
      for (const candidate of sidePairs.slice(0, MAX_SIDE_PAIRS)) {
        const { sSide, eSide } = candidate
        const distA = anchorDistance(Math.max(
          usedAnchorCount(connection.from, sSide),
          priorShapeUseCount(connection.from),
        ))
        const distB = anchorDistance(Math.max(
          usedAnchorCount(connection.to, eSide),
          priorShapeUseCount(connection.to),
        ))
        const path = routeBpmn({
          fromShape,
          toShape,
          fromSide: sSide,
          toSide: eSide,
          fromDistance: distA,
          toDistance: distB,
          fromIsDiamond: connection.sourceType === 'flowchart-decision',
          toIsDiamond: connection.targetType === 'flowchart-decision',
          layout: domLayout,
          fromLane: connection.fromLane,
          toLane: connection.toLane,
          fromCol: connection.fromCol,
          toCol: connection.toCol,
          obstacles: obstacleSet,
          occupiedSegments: occupied,
          globalBounds,
          sourceJettySize: candidate.sourceJettySize,
          targetJettySize: candidate.targetJettySize,
        })
        if (path.length < 2) continue
        const score = scoreBpmnRouteCandidate(candidate) + scorePath(path, occupied)
        if (score < bestScore) {
          bestPath = path
          bestCandidate = candidate
          bestScore = score
          routedByEngine = true
        }
      }
    }

    tryRouteCandidates(routingObstacles)
    if (!routedByEngine && routingObstacles.length > 0) {
      tryRouteCandidates([])
    }

    const pickFallbackCandidate = (): BpmnRouteCandidate =>
      bestCandidate ?? sidePairs[0] ?? { sSide: 'right', eSide: 'left' }

    if (!domLayout) {
      const fc = pickFallbackCandidate()
      bestPath = ensureRenderableFallbackPath(fromShape, toShape, fc, connection)
      bestCandidate = fc
    }

    if (!bestPath || !bestCandidate) {
      const fc = pickFallbackCandidate()
      bestPath = ensureRenderableFallbackPath(fromShape, toShape, fc, connection)
      bestCandidate = fc
    }

    const finalPath = snapToOrthogonal(bestPath)
    if (finalPath.length < 2) {
      const emergencyPath = ensureRenderableFallbackPath(fromShape, toShape, pickFallbackCandidate(), connection)
      bestPath = emergencyPath
      bestCandidate = pickFallbackCandidate()
    }
    const resolvedPathFinal = snapToOrthogonal(bestPath)
    if (resolvedPathFinal.length < 2) return

    if (capturedRoutedSegs) {
      capturedRoutedSegs.current.set(connection.id, bpmnPathToSegments(resolvedPathFinal))
    }

    setPathData(pathToD(resolvedPathFinal))
    setResolvedPath(resolvedPathFinal.map((p) => ({ ...p })))
    setResolvedSides([bestCandidate.sSide, bestCandidate.eSide])

    let lp: { x: number; y: number } | null = null
    if (connection.label && resolvedPathFinal.length >= 2) {
      lp = manualLabelPosition ?? getFixedDistancePoint(resolvedPathFinal[0], resolvedPathFinal[1], 30, 19)
    }
    setLabelPos(lp)

    const { sSide, eSide } = bestCandidate
    const payload: PathUpdatedPayload = {
      connectionId: connection.id, from: connection.from, to: connection.to,
      sSide, eSide,
      startPoint: { ...resolvedPathFinal[0] },
      endPoint: { ...resolvedPathFinal[resolvedPathFinal.length - 1] },
      bendPoints: resolvedPathFinal.slice(1, -1).map(p => ({ ...p })),
      label: connection.label ?? undefined,
      labelPosition: lp ?? undefined,
    }
    const pathSig = resolvedPathFinal.map(p => `${p.x|0},${p.y|0}`).join(';')
    const sig = `${connection.id}:${sSide}:${eSide}:${pathSig}`
    if (onPathUpdatedRef.current && lastAutoSigRef.current !== sig) {
      lastAutoSigRef.current = sig
      onPathUpdatedRef.current(payload)
    }

    return () => {
      capturedRoutedSegs?.current.delete(connection.id)
    }
  // Only re-run when the connection identity or manual config changes.
  // Mutable props (usedSides, obstacles, laneLayout, etc.) are read via
  // refs to avoid cascading re-renders when onPathUpdated updates parent state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    idcontainer, connection.id, connection.from, connection.to,
    connection.label, connection.sourceType, connection.targetType,
    connection.fromLane, connection.toLane, connection.fromCol, connection.toCol,
    connectionIndex, allConnectionsMeta,
    manualConfig, manualLabelPosition, rerouteVersion, editMode,
  ])

  if (!pathData) return null
  const effectiveLabelPos = manualLabelPosition ?? labelPos
  const markerId = `arrowhead-bpmn-${idarrow}`

  if (editMode && isSelected && resolvedPath.length >= 2) {
    const guardCtx = routingGuardRef.current
    const shapeGuard: PathShapeGuardConfig | null =
      guardCtx && guardCtx.bpmnRepairBase
        ? {
            check: {
              kind: 'bpmn',
              path: resolvedPath,
              obstacles: guardCtx.obsRects,
              fromShape: guardCtx.fromShape,
              toShape: guardCtx.toShape,
            },
            repair: {
              kind: 'bpmn',
              startPoint: { ...resolvedPath[0]! },
              endPoint: { ...resolvedPath[resolvedPath.length - 1]! },
              sSide: resolvedSides[0],
              eSide: resolvedSides[1],
              fromShape: guardCtx.fromShape,
              toShape: guardCtx.toShape,
              obstacles: guardCtx.obsRects,
              bpmn: {
                ...guardCtx.bpmnRepairBase,
                fromSide: resolvedSides[0],
                toSide: resolvedSides[1],
              },
            },
          }
        : null
    return (
      <g>
        <defs>
          <marker id={markerId} markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
          </marker>
        </defs>
        <EditableOrthogonalPath
          path={resolvedPath}
          sSide={resolvedSides[0]}
          eSide={resolvedSides[1]}
          anchors={editableAnchors}
          shapeGuard={shapeGuard}
          connectionId={connection.id}
          isSelected={isSelected}
          markerEndId={markerId}
          strokeWidth={1.5}
          onSelect={onSelectRef.current ?? (() => {})}
          onChange={(payload) => {
            const nextPath = [payload.startPoint, ...payload.bendPoints, payload.endPoint]
            setResolvedPath(nextPath)
            setResolvedSides([payload.sSide, payload.eSide])
            setPathData(pathToDUtil(nextPath))
            onManualChangeRef.current?.({
              connectionId: connection.id,
              from: connection.from,
              to: connection.to,
              ...payload,
              label: connection.label ?? undefined,
              labelPosition: effectiveLabelPos ?? undefined,
            })
          }}
          onDeleteSelected={() => onManualChangeRef.current?.({
            connectionId: connection.id,
            from: connection.from,
            to: connection.to,
            sSide: resolvedSides[0],
            eSide: resolvedSides[1],
            startPoint: resolvedPath[0]!,
            endPoint: resolvedPath[resolvedPath.length - 1]!,
            bendPoints: [],
            label: connection.label ?? undefined,
          })}
        />
        {connection.label && effectiveLabelPos && (
          <text
            x={effectiveLabelPos.x} y={effectiveLabelPos.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontFamily="Arial" fill="black"
            style={{ pointerEvents: 'none' }}
          >
            {connection.label}
          </text>
        )}
      </g>
    )
  }

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
        </marker>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={editMode ? 14 : 1.5}
        style={editMode ? { pointerEvents: 'stroke', cursor: 'pointer' } : { pointerEvents: 'none' }}
        onClick={
          editMode
            ? (e) => {
                e.stopPropagation()
                onSelectRef.current?.(connection.id)
              }
            : undefined
        }
      />
      <path
        d={pathData} fill="none" stroke="black" strokeWidth={1.5}
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: 'none' }}
      />
      {connection.label && effectiveLabelPos && (
        <text
          x={effectiveLabelPos.x} y={effectiveLabelPos.y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontFamily="Arial" fill="black"
          style={{ pointerEvents: 'none' }}
        >
          {connection.label}
        </text>
      )}
    </g>
  )
}
