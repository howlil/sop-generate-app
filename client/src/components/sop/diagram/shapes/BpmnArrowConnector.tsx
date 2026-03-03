import { useLayoutEffect, useState, useRef, type MutableRefObject } from 'react'
import type { ArrowConnectionConfig, ArrowPathPoint } from '../sopDiagramTypes'
import {
  routeBpmn,
  selectBpmnSidePairs,
  scorePath,
  bpmnPathToSegments,
  bpmnPathHitsObstacle,
  type BpmnConnectionMeta,
  type BpmnLaneLayout,
  type UsedSides,
  type Side,
  type OccupiedSegment,
} from './bpmnRouter'

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

function getElementPosition(elementId: string, container: HTMLElement): ElemPos | null {
  const el = document.getElementById(elementId)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const c = container.getBoundingClientRect()
  return {
    left: Math.round(r.left - c.left),
    top: Math.round(r.top - c.top),
    width: Math.round(r.width),
    height: Math.round(r.height),
    right: Math.round(r.right - c.left),
    bottom: Math.round(r.bottom - c.top),
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
    let p = { x: Math.round(raw.x), y: Math.round(raw.y) }

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

  return out
}

function isValidManualConfig(c: ArrowConnectionConfig | null | undefined): boolean {
  if (!c?.startPoint || !c?.endPoint) return false
  const { startPoint: s, endPoint: e } = c
  return [s.x, s.y, e.x, e.y].every(v => typeof v === 'number' && !isNaN(v))
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
  constraintRect = null,
  routedSegmentsRef,
  rerouteVersion = 0,
  obstacleRectsRef,
}: BpmnArrowConnectorProps) {
  const [pathData, setPathData] = useState('')
  const [labelPos, setLabelPos] = useState<{ x: number; y: number } | null>(null)
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
  const laneLayoutRef = useRef(laneLayout)
  laneLayoutRef.current = laneLayout
  const constraintRectRef = useRef(constraintRect)
  constraintRectRef.current = constraintRect
  const routedSegmentsRefRef = useRef(routedSegmentsRef)
  routedSegmentsRefRef.current = routedSegmentsRef

  useLayoutEffect(() => {
    const container = document.getElementById(idcontainer)
    if (!container) { setPathData(''); setLabelPos(null); return }

    /* ── Manual path ─────────────────────────────────────── */
    if (isValidManualConfig(manualConfig) && manualConfig!.startPoint && manualConfig!.endPoint) {
      const { startPoint, endPoint, bendPoints = [] } = manualConfig!
      const snapped = snapToOrthogonal([startPoint, ...bendPoints, endPoint])
      setPathData(pathToD(snapped))

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

    /* ── Auto-routing (BPMN lane-aware) ──────────────────── */
    const fromPos = getElementPosition(connection.from, container)
    const toPos = getElementPosition(connection.to, container)
    if (!fromPos || !toPos) {
      setPathData('')
      setLabelPos(null)
      return
    }

    // Aturan BPMN: path tidak boleh berada di dalam shape (termasuk shape sumber/target).
    // Semua shape dipakai sebagai obstacle; segmen pertama diabaikan vs from, segmen terakhir vs to.
    const OBSTACLE_MARGIN = 10
    const curObstacles = obstaclesRef.current
    let obsRects: Array<{ left: number; top: number; width: number; height: number }>
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

    const sidePairs = selectBpmnSidePairs(
      connection,
      fromShape,
      toShape,
      usedSidesRef.current,
    )

    const curRoutedSegs = routedSegmentsRefRef.current
    const occupied: OccupiedSegment[] = []
    if (curRoutedSegs) {
      for (const [id, segs] of curRoutedSegs.current) {
        if (id !== connection.id) occupied.push(...segs)
      }
    }

    const curLayout = laneLayoutRef.current
    const allMeta = allConnectionsMeta

    // Slot anchor deterministik berdasarkan urutan koneksi, agar tidak ada 2 head di anchor yang sama.
    // fromSlotIndex = berapa banyak koneksi sebelumnya yang keluar dari node yang sama.
    const anchorSlots = [0.5, 0.25, 0.75]
    const anchorDistance = (count: number): number => {
      if (count <= 0) return anchorSlots[0]
      if (count === 1) return anchorSlots[1]
      if (count === 2) return anchorSlots[2]
      return anchorSlots[0]
    }
    const fromSlotIndex = allMeta.filter((m, j) => j < connectionIndex && m.from === connection.from).length
    const toSlotIndex = allMeta.filter((m, j) => j < connectionIndex && m.to === connection.to).length
    const distA = anchorDistance(fromSlotIndex)
    const distB = anchorDistance(toSlotIndex)

    const hasValidLayout = curLayout?.lanes != null && curLayout.lanes.length > 0

    let bestPath: { x: number; y: number }[] | null = null
    let bestSides: [Side, Side] | null = null
    let bestScore = Infinity

    for (const [sSide, eSide] of sidePairs.slice(0, MAX_SIDE_PAIRS)) {
      const path = hasValidLayout
        ? routeBpmn({
        fromShape, toShape,
        fromSide: sSide, toSide: eSide,
        fromDistance: distA, toDistance: distB,
        fromIsDiamond: connection.sourceType === 'flowchart-decision',
        toIsDiamond: connection.targetType === 'flowchart-decision',
        layout: curLayout,
        fromLane: connection.fromLane,
        toLane: connection.toLane,
        fromCol: connection.fromCol,
        toCol: connection.toCol,
        obstacles: obsRects,
        occupiedSegments: occupied,
        globalBounds,
      })
        : (() => {
            const start = { x: fromPos.left + fromPos.width / 2, y: fromPos.top + fromPos.height / 2 }
            const end = { x: toPos.left + toPos.width / 2, y: toPos.top + toPos.height / 2 }
            return [start, end]
          })()

      if (path.length < 2) continue
      // Prioritas: path tidak boleh menembus shape. Abaikan path yang masih hit obstacle.
      if (obsRects.length > 0 && bpmnPathHitsObstacle(path, obsRects, fromShape, toShape)) continue
      const score = scorePath(path, occupied)
      if (score < bestScore) {
        bestPath = path
        bestSides = [sSide, eSide]
        bestScore = score
      }
    }

    // Jangan pakai garis lurus center-to-center jika ada obstacle: path akan menembus shape.
    if (!bestPath || !bestSides) {
      if (obsRects.length > 0) {
        setPathData('')
        setLabelPos(null)
        return
      }
      const [sSide, eSide] = sidePairs[0] ?? ['right', 'left']
      bestPath = [
        { x: fromPos.left + fromPos.width / 2, y: fromPos.top + fromPos.height / 2 },
        { x: toPos.left + toPos.width / 2, y: toPos.top + toPos.height / 2 },
      ]
      bestSides = [sSide, eSide]
    }

    const finalPath = snapToOrthogonal(bestPath)

    if (curRoutedSegs) {
      curRoutedSegs.current.set(connection.id, bpmnPathToSegments(finalPath))
    }

    setPathData(pathToD(finalPath))

    let lp: { x: number; y: number } | null = null
    if (connection.label && finalPath.length >= 2) {
      lp = manualLabelPosition ?? getFixedDistancePoint(finalPath[0], finalPath[1], 30, 19)
    }
    setLabelPos(lp)

    const [sSide, eSide] = bestSides
    const payload: PathUpdatedPayload = {
      connectionId: connection.id, from: connection.from, to: connection.to,
      sSide, eSide,
      startPoint: { ...finalPath[0] },
      endPoint: { ...finalPath[finalPath.length - 1] },
      bendPoints: finalPath.slice(1, -1).map(p => ({ ...p })),
      label: connection.label ?? undefined,
      labelPosition: lp ?? undefined,
    }
    const pathSig = finalPath.map(p => `${p.x|0},${p.y|0}`).join(';')
    const sig = `${connection.id}:${sSide}:${eSide}:${pathSig}`
    if (onPathUpdatedRef.current && lastAutoSigRef.current !== sig) {
      lastAutoSigRef.current = sig
      onPathUpdatedRef.current(payload)
    }

    return () => {
      routedSegmentsRefRef.current?.current.delete(connection.id)
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
    manualConfig, manualLabelPosition, rerouteVersion,
  ])

  if (!pathData) return null
  const effectiveLabelPos = manualLabelPosition ?? labelPos

  return (
    <g>
      <defs>
        <marker
          id={`arrowhead-bpmn-${idarrow}`}
          markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
        </marker>
      </defs>
      <path
        d={pathData} fill="none" stroke="black" strokeWidth="1.5"
        markerEnd={`url(#arrowhead-bpmn-${idarrow})`}
      />
      {connection.label && effectiveLabelPos && (
        <text
          x={effectiveLabelPos.x} y={effectiveLabelPos.y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontFamily="Arial" fill="black"
        >
          {connection.label}
        </text>
      )}
    </g>
  )
}
