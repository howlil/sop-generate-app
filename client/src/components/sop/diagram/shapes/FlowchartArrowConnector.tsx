import { useLayoutEffect, useState, useRef, type MutableRefObject } from 'react'
import type { ArrowConnectionConfig, ArrowPathPoint } from '../sopDiagramTypes'
import { routeOrthogonal, scorePath, pathToSegments, type OccupiedSegment } from './orthogonalRouter'

/* ───────────────────────── Public types ─────────────────────────── */

export interface FlowchartConnection {
  id: string
  from: string
  to: string
  label?: string | null
  sourceType?: string
  targetType?: string
}

export interface ArrowObstacle { id: string }

export type UsedSides = Record<
  string,
  {
    in?: Partial<Record<Side, string[]>>
    out?: Partial<Record<Side, string[]>>
  }
>

type Side = 'top' | 'bottom' | 'left' | 'right'

/**
 * Konvensi arah panah:
 * - Tail (pangkal) selalu di start: dari connection.from, pakai sSide & startPoint.
 * - Head (mata panah ">") selalu di end: ke connection.to, pakai eSide & endPoint.
 */
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

type BoundsRect = { left: number; top: number; right: number; bottom: number }

/**
 * Shared mutable ref holding segments of all already-routed arrows.
 * Each connector reads others' segments as penalties and writes its own after routing.
 * Using a ref avoids re-render loops while allowing cross-connector coordination.
 */
export type RoutedPathsRef = MutableRefObject<Map<string, OccupiedSegment[]>>

/* ───────────────────────── Props ─────────────────────────── */

interface FlowchartArrowConnectorProps {
  connection: FlowchartConnection
  idcontainer: string
  idarrow: string | number
  obstacles?: ArrowObstacle[]
  usedSides?: UsedSides
  manualConfig?: ArrowConnectionConfig | null
  manualLabelPosition?: { x: number; y: number } | null
  onPathUpdated?: (payload: PathUpdatedPayload) => void
  constraintRect?: BoundsRect | null
  /** Shared ref for cross-arrow overlap avoidance */
  routedSegmentsRef?: RoutedPathsRef
  /** From scan phase: Map of `${targetShapeId}-${side}` → Set of connectionIds that may use it (e.g. all Tidak to that target). */
  reservedSidesRef?: MutableRefObject<Map<string, Set<string>>>
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

function pathToD(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`
  return d
}

/** Self-healing: hapus titik tengah yang koliner dan duplikat berurutan agar path terstruktur. */
function simplifyPathCollinear(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length <= 2) return points
  const out = [points[0]]
  for (let i = 1; i < points.length - 1; i++) {
    const prev = out[out.length - 1]
    const cur = points[i]
    const next = points[i + 1]
    const duplicate = prev.x === cur.x && prev.y === cur.y
    const collinear =
      (prev.x === cur.x && cur.x === next.x) || (prev.y === cur.y && cur.y === next.y)
    if (!duplicate && !collinear) out.push(cur)
  }
  const last = points[points.length - 1]
  if (out[out.length - 1].x !== last.x || out[out.length - 1].y !== last.y) out.push(last)
  return out.length >= 2 ? out : [points[0], points[points.length - 1]]
}

function isValidManualConfig(c: ArrowConnectionConfig | null | undefined): boolean {
  if (!c?.startPoint || !c?.endPoint) return false
  const { startPoint: s, endPoint: e } = c
  return [s.x, s.y, e.x, e.y].every(v => typeof v === 'number' && !isNaN(v))
}

/* ─────────────────────────────────────────────────────────────────
 *  Side-pair selection — implements the arrow connector algorithm:
 *
 *  Case 0: Start (terminator) → next task: head selalu top; tail
 *          menurut posisi: start kiri → right→top, sejajar → bottom→top,
 *          start kanan → left→top.
 *  Case 1: Same column → tail=bottom, head=top (straight vertical)
 *  Case 2: Different columns →
 *          dest RIGHT: P1 bottom→left,  P2 right→top
 *          dest LEFT:  P1 bottom→right, P2 left→top
 *  Case 3: Decision branching →
 *    3.1  Ya/Tidak "next-to" outputs: follow Case 1/2, but Tidak
 *         always uses horizontal exit to avoid overlap with Ya.
 *    3.2  Loop-back (dest above src): use horizontal U-turn
 *         (right→right or left→left), checking usedSides.
 *
 *  Overlap prevention: before choosing a route, check usedSides to
 *  see if the anchor is already occupied. If so, switch to the
 *  alternative pair.
 * ─────────────────────────────────────────────────────────────── */

function isYaLabel(lbl: string): boolean {
  return /^(ya|yes|y)$/.test((lbl ?? '').trim().toLowerCase())
}
function isTidakLabel(lbl: string): boolean {
  return /^(tidak|no|n)$/.test((lbl ?? '').trim().toLowerCase())
}

function selectSidePairs(
  conn: FlowchartConnection,
  from: ElemPos,
  to: ElemPos,
  usedSides: UsedSides,
  reservedSides: Map<string, Set<string>> | undefined,
  toId: string,
  connectionId: string,
): Array<[Side, Side]> {
  const dx = (to.left + to.width / 2) - (from.left + from.width / 2)
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2)

  const colThreshold = Math.max(from.width, to.width) * 0.5
  const sameCol   = Math.abs(dx) < colThreshold
  const destRight = !sameCol && dx > 0
  const destLeft  = !sameCol && dx < 0
  const destBelow = dy > 10
  const destAbove = dy < -10

  const isStartTerminator = conn.sourceType === 'flowchart-terminator'
  const isDecSrc = conn.sourceType === 'flowchart-decision'
  const isOpcSrc = conn.sourceType === 'flowchart-opc'
  const isOpcTarget = conn.targetType === 'flowchart-opc'
  const isYa    = isYaLabel(conn.label ?? '')
  const isTidak = isTidakLabel(conn.label ?? '')

  const srcOutBusy = (s: Side) =>
    (usedSides[conn.from]?.out?.[s] ?? []).some(id => id !== conn.id)
  const dstInBusy = (s: Side) =>
    (usedSides[conn.to]?.in?.[s] ?? []).some(id => id !== conn.id)

  const pairs: Array<[Side, Side]> = []

  /* ── Case OPC: Off-Page Connector — posisi mengikuti kolom sumber ─────
   *  Step → OPC-out: tail bottom, head top (lurus ke bawah, rute terdekat)
   *  OPC-in → Step: tail bottom OPC, head left/right step (OPC keluar bottom, step terima dari samping)
   */
  if (isOpcTarget && destBelow) {
    pairs.push(['bottom', 'top'])
  }
  if (isOpcSrc && destBelow) {
    if (destRight) pairs.push(['bottom', 'left'], ['right', 'top'])
    else if (destLeft) pairs.push(['bottom', 'right'], ['left', 'top'])
    else pairs.push(['bottom', 'top'])
  }

  /* ── Case 0: Start (terminator) → next task: head selalu top ─────
   *  - Start di kiri task berikutnya → tail right, head top
   *  - Posisi sejajar → tail bottom, head top
   *  - Start di kanan → tail left, head top
   *  Hanya berlaku untuk start (terminator), tidak untuk end. */
  if (isStartTerminator && destBelow) {
    if (destRight) {
      if (!srcOutBusy('right')) pairs.push(['right', 'top'])
      pairs.push(['bottom', 'top'])
    } else if (destLeft) {
      if (!srcOutBusy('left')) pairs.push(['left', 'top'])
      pairs.push(['bottom', 'top'])
    } else {
      pairs.push(['bottom', 'top'])
    }
  }

  /* ── Case 3: Decision source with branching ──────────────── */
  if (isDecSrc && (isYa || isTidak)) {

    if (destAbove) {
      // Case 3.2  Loop-back to earlier shape — horizontal U-turn
      if (!srcOutBusy('right') && !dstInBusy('right')) pairs.push(['right', 'right'])
      if (!srcOutBusy('left')  && !dstInBusy('left'))  pairs.push(['left', 'left'])
      // Untuk decision loop-back, kita sangat memaksa anchor horizontal (right→right / left→left).
      // Alternatif vertikal akan tetap tersedia lewat fallback umum di bawah, tapi dengan prioritas rendah.
    }

    else if (isYa) {
      // Ya branch: always exits from bottom
      if (sameCol && destBelow) {
        pairs.push(['bottom', 'top'])
      } else if (destRight) {
        pairs.push(['bottom', 'left'], ['right', 'top'])
      } else if (destLeft) {
        pairs.push(['bottom', 'right'], ['left', 'top'])
      } else {
        pairs.push(['bottom', 'top'])
      }
    }

    else if (isTidak) {
      // Tidak branch: exits from left/right to avoid overlap with Ya
      // Case 3.3: Branch (Tidak) ke decision di bawah — head JANGAN di top target.
      // Target decision punya linear input (mis. 7→8) yang butuh top. Supaya tidak persilangan:
      // head masuk di right/left target, sehingga linear bisa pakai top.
      const isTargetDecision = conn.targetType === 'flowchart-decision'
      if (destBelow && isTargetDecision) {
        if (!srcOutBusy('right') && !dstInBusy('right')) pairs.push(['right', 'right'])
        if (!srcOutBusy('right') && !dstInBusy('left'))  pairs.push(['right', 'left'])
        if (!srcOutBusy('left')  && !dstInBusy('right')) pairs.push(['left', 'right'])
        if (!srcOutBusy('left')  && !dstInBusy('left'))  pairs.push(['left', 'left'])
      } else if (sameCol && destBelow) {
        // Same column & below → must use horizontal exit (Case 2)
        if (!srcOutBusy('right')) pairs.push(['right', 'top'])
        if (!srcOutBusy('left'))  pairs.push(['left', 'top'])
        pairs.push(['right', 'top'], ['left', 'top'])
      } else if (destRight) {
        if (srcOutBusy('bottom') || dstInBusy('left'))
          pairs.push(['right', 'top'], ['bottom', 'left'])
        else
          pairs.push(['right', 'top'], ['bottom', 'left'])
      } else if (destLeft) {
        if (srcOutBusy('bottom') || dstInBusy('right'))
          pairs.push(['left', 'top'], ['bottom', 'right'])
        else
          pairs.push(['left', 'top'], ['bottom', 'right'])
      } else {
        pairs.push(['right', 'top'], ['left', 'top'])
      }
    }
  }

  /* ── Non-decision loop-back (dest above src) ─────────────── */
  else if (destAbove) {
    if (sameCol) {
      if (!srcOutBusy('right') && !dstInBusy('right')) pairs.push(['right', 'right'])
      if (!srcOutBusy('left')  && !dstInBusy('left'))  pairs.push(['left', 'left'])
      pairs.push(['top', 'bottom'])
    } else if (destRight) {
      pairs.push(['right', 'bottom'], ['top', 'right'])
    } else {
      pairs.push(['left', 'bottom'], ['top', 'left'])
    }
  }

  /* ── Case 1: Same column (straight vertical) ────────────── */
  else if (sameCol) {
    if (destBelow) pairs.push(['bottom', 'top'])
    else           pairs.push(['top', 'bottom'])
  }

  /* ── Case 2: Different columns ──────────────────────────── */
  else if (destRight) {
    if (srcOutBusy('bottom') || dstInBusy('left'))
      pairs.push(['right', 'top'], ['bottom', 'left'])
    else
      pairs.push(['bottom', 'left'], ['right', 'top'])
  }
  else if (destLeft) {
    if (srcOutBusy('bottom') || dstInBusy('right'))
      pairs.push(['left', 'top'], ['bottom', 'right'])
    else
      pairs.push(['bottom', 'right'], ['left', 'top'])
  }

  /* ── General fallbacks ──────────────────────────────────── */
  pairs.push(
    ['bottom', 'top'], ['top', 'bottom'],
    ['right', 'left'], ['left', 'right'],
    ['bottom', 'left'], ['bottom', 'right'],
    ['right', 'top'], ['left', 'top'],
  )

  const seen = new Set<string>()
  const deduped = pairs.filter(([s, e]) => {
    const k = `${s}-${e}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  if (!reservedSides || reservedSides.size === 0) return deduped

  const baseId = connectionId.replace(/__in$/, '')
  const preferred: Array<[Side, Side]> = []
  const reservedForOthers: Array<[Side, Side]> = []
  for (const pair of deduped) {
    const [, endSide] = pair
    const ownerSet = reservedSides.get(`${toId}-${endSide}`)
    const isOwner = ownerSet && (ownerSet.has(connectionId) || ownerSet.has(baseId))
    if (ownerSet && !isOwner) reservedForOthers.push(pair)
    else preferred.push(pair)
  }
  return [...preferred, ...reservedForOthers]
}

/* ───────────────────────── Constants ─────────────────────────── */

const SHAPE_MARGIN = 16
const BOUNDS_MARGIN = 15
/** Inset from pelaksana column left/right so path never touches vertical cell borders. */
const PATH_COLUMN_INSET = 24
/** Extra inset on right to avoid path crossing into Mutu Baku (getBoundingClientRect can include border). */
const PATH_COLUMN_INSET_RIGHT_EXTRA = 12
/** Inset from container top/bottom so path does not sit on horizontal border. */
const PATH_VERTICAL_INSET = 12
/** Penalty per pixel of horizontal span to prefer less "ruwet" / shorter-sideways paths. */
const HORIZONTAL_SPAN_PENALTY_PER_PX = 0.55
/** Inset applied to globalBounds when passing to router so grid points stay away from border. */
const ROUTER_INTERNAL_INSET = 4
const MAX_TRIES = 5
const GOOD_SCORE_LIMIT = 480
const ROUTING_IDLE_TIMEOUT_MS = 120

/* ───────────────────────── Component ─────────────────────────── */

export function FlowchartArrowConnector({
  connection,
  idcontainer,
  idarrow,
  obstacles = [],
  usedSides = {},
  manualConfig,
  manualLabelPosition,
  onPathUpdated,
  constraintRect = null,
  routedSegmentsRef,
  reservedSidesRef,
}: FlowchartArrowConnectorProps) {
  const [pathData, setPathData] = useState('')
  const [labelPos, setLabelPos] = useState<{ x: number; y: number } | null>(null)
  const emittedRef = useRef(false)
  const lastAutoSigRef = useRef<string | null>(null)

  // Store usedSides in a ref so it's always fresh inside the effect
  // without being a dependency (prevents infinite setState loops).
  const usedSidesRef = useRef(usedSides)
  usedSidesRef.current = usedSides

  useLayoutEffect(() => {
    const container = document.getElementById(idcontainer)
    if (!container) { setPathData(''); setLabelPos(null); return }

    /* ── Manual path ─────────────────────────────────────────── */
    if (isValidManualConfig(manualConfig) && manualConfig!.startPoint && manualConfig!.endPoint) {
      const { startPoint, endPoint, bendPoints = [] } = manualConfig!
      setPathData(pathToD([startPoint, ...bendPoints, endPoint]))

      const lp = connection.label
        ? manualLabelPosition ?? getFixedDistancePoint(startPoint, bendPoints[0] ?? endPoint, 30, 19)
        : null
      setLabelPos(lp)

      if (onPathUpdated && !emittedRef.current) {
        onPathUpdated({
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

    /* ── Auto-routing (Grid + Dijkstra) ──────────────────────── */
    const fromPos = getElementPosition(connection.from, container)
    const toPos = getElementPosition(connection.to, container)
    if (!fromPos || !toPos) { setPathData(''); setLabelPos(null); return }

    const isOpcConnection =
      connection.sourceType === 'flowchart-opc' || connection.targetType === 'flowchart-opc'
    const HEADER_OBSTACLE_PREFIX = 'sop-page-'
    const HEADER_OBSTACLE_SUFFIX = '-table-header'
    const obsRects = obstacles
      .map(o => o.id)
      .filter(id => id !== connection.from && id !== connection.to)
      .map(id => {
        const r = getElementPosition(id, container)
        if (!r) return null
        const rect = { left: r.left, top: r.top, width: r.width, height: r.height }
        if (isOpcConnection && id.startsWith(HEADER_OBSTACLE_PREFIX) && id.endsWith(HEADER_OBSTACLE_SUFFIX)) {
          const pad = 18
          return {
            left: Math.max(0, rect.left - pad),
            top: Math.max(0, rect.top - pad),
            width: rect.width + 2 * pad,
            height: rect.height + 2 * pad,
          }
        }
        return rect
      })
      .filter((r): r is { left: number; top: number; width: number; height: number } => r != null)

    // Path must stay strictly inside pelaksana column (no Kegiatan/Mutu Baku/KET).
    // Use pelaksana horizontal bounds + full container height; inset so path does not touch vertical borders.
    const pathAllowedBounds = constraintRect
      ? (() => {
          const left = Math.round(constraintRect.left + PATH_COLUMN_INSET)
          const right = Math.round(constraintRect.right - PATH_COLUMN_INSET - PATH_COLUMN_INSET_RIGHT_EXTRA)
          const w = Math.max(20, right - left)
          const top = PATH_VERTICAL_INSET
          const height = Math.max(40, container.scrollHeight - 2 * PATH_VERTICAL_INSET)
          return {
            left,
            top,
            width: w,
            height,
          }
        })()
      : null
    const globalBounds = pathAllowedBounds
      ? {
          left: pathAllowedBounds.left + ROUTER_INTERNAL_INSET,
          top: pathAllowedBounds.top + ROUTER_INTERNAL_INSET,
          width: Math.max(12, pathAllowedBounds.width - 2 * ROUTER_INTERNAL_INSET),
          height: Math.max(40, pathAllowedBounds.height - 2 * ROUTER_INTERNAL_INSET),
        }
      : {
          left: 0,
          top: 0,
          width: container.scrollWidth,
          height: container.scrollHeight,
        }

    const fromShape = { left: fromPos.left, top: fromPos.top, width: fromPos.width, height: fromPos.height }
    const toShape = { left: toPos.left, top: toPos.top, width: toPos.width, height: toPos.height }

    const dy = (toPos.top + toPos.height / 2) - (fromPos.top + fromPos.height / 2)
    const destAbove = dy < -10
    const destBelow = dy > 10
    const isLoopBack = destAbove && connection.sourceType === 'flowchart-decision'
    const canvasW = pathAllowedBounds ? pathAllowedBounds.width : (constraintRect ? constraintRect.right - constraintRect.left : 0)
    const boundsMargin = isLoopBack
      ? (canvasW > 0 ? Math.min(60, Math.max(32, Math.round(canvasW * 0.05))) : 36)
      : (canvasW > 0 ? Math.min(28, Math.max(18, Math.round(canvasW * 0.022))) : BOUNDS_MARGIN)

    const reservedSides = reservedSidesRef?.current
    const sidePairs = selectSidePairs(
      connection,
      fromPos,
      toPos,
      usedSidesRef.current,
      reservedSides,
      connection.to,
      connection.id,
    )

    // Collect occupied segments from other already-routed arrows
    const occupied: OccupiedSegment[] = []
    if (routedSegmentsRef) {
      for (const [id, segs] of routedSegmentsRef.current) {
        if (id !== connection.id) occupied.push(...segs)
      }
    }

    const used = usedSidesRef.current
    const anchorDistance = (count: number) => (count + 1) / (count + 2)

    const runRouting = () => {
    let bestPath: { x: number; y: number }[] | null = null
    let bestSides: [Side, Side] | null = null
    let bestScore = Infinity

    const preferHorizontalLoopback =
      isLoopBack && isTidakLabel(connection.label ?? '')
    const preferYaBottomTail =
      destBelow && connection.sourceType === 'flowchart-decision' && isYaLabel(connection.label ?? '')
    const preferOpcStraight =
      destBelow && (connection.targetType === 'flowchart-opc' || connection.sourceType === 'flowchart-opc')

    for (const [sSide, eSide] of sidePairs.slice(0, MAX_TRIES)) {
      const outCount = (used[connection.from]?.out?.[sSide] ?? []).filter((id) => id !== connection.id).length
      const inCount = (used[connection.to]?.in?.[eSide] ?? []).filter((id) => id !== connection.id).length
      const distA = anchorDistance(outCount)
      const distB = anchorDistance(inCount)

      const path = routeOrthogonal({
        pointA: { shape: fromShape, side: sSide, distance: distA },
        pointB: { shape: toShape, side: eSide, distance: distB },
        obstacles: obsRects,
        shapeMargin: SHAPE_MARGIN,
        globalBounds,
        globalBoundsMargin: boundsMargin,
        occupiedSegments: occupied,
      })

      if (path.length < 2) continue
      let score = scorePath(path, occupied)

      // Kurangi path "ruwet": penalisasi rentang horizontal lebar agar path tidak memanjang ke samping tidak perlu
      const pathMinX = Math.min(...path.map((p) => p.x))
      const pathMaxX = Math.max(...path.map((p) => p.x))
      score += (pathMaxX - pathMinX) * HORIZONTAL_SPAN_PENALTY_PER_PX

      // Untuk decision Tidak loop-back, paksa prioritas tinggi ke anchor horizontal (right→right / left→left)
      // dibanding kombinasi lain (mis. right→top) meskipun path-nya sedikit lebih panjang.
      if (preferHorizontalLoopback) {
        const isHorizontal = (sSide === eSide) && (sSide === 'left' || sSide === 'right')
        if (!isHorizontal) score += 10_000
      }

      // Untuk decision Ya ke bawah: tail harus dari bottom agar tidak bersilangan dengan
      // linear atau branch lain. Contoh: 8 Ya → 9, tail dari bottom 8.
      if (preferYaBottomTail && sSide !== 'bottom') score += 8_000

      // OPC: Step → OPC-out lurus ke bawah (tail bottom, head top); OPC-in → Step keluar bottom.
      if (preferOpcStraight) {
        if (connection.targetType === 'flowchart-opc' && eSide !== 'top') score += 6_000
        if (connection.sourceType === 'flowchart-opc' && sSide !== 'bottom') score += 6_000
      }

      if (score < bestScore) {
        bestPath = path; bestSides = [sSide, eSide]; bestScore = score
        if (score <= GOOD_SCORE_LIMIT) break
      }
    }

    if (!bestPath || !bestSides) {
      const [sSide, eSide] = sidePairs[0] ?? ['bottom', 'top']
      const fallbackPath = routeOrthogonal({
        pointA: { shape: fromShape, side: sSide, distance: 0.5 },
        pointB: { shape: toShape, side: eSide, distance: 0.5 },
        obstacles: [],
        shapeMargin: SHAPE_MARGIN,
        globalBounds,
        globalBoundsMargin: boundsMargin,
        occupiedSegments: [],
      })
      if (fallbackPath.length >= 2) {
        bestPath = fallbackPath
        bestSides = [sSide, eSide]
      } else {
        // Ultimate fallback: orthogonal path inside globalBounds (no diagonal, stay in pelaksana column)
        const xLeft = globalBounds.left
        const xRight = globalBounds.left + globalBounds.width
        const clampX = (x: number) => Math.round(Math.max(xLeft, Math.min(xRight, x)))
        const fromCenterX = fromPos.left + fromPos.width / 2
        const toCenterX = toPos.left + toPos.width / 2
        const x1 = clampX(fromCenterX)
        const x2 = clampX(toCenterX)
        const xCor = Math.round((x1 + x2) / 2)
        bestPath = [
          { x: x1, y: fromPos.bottom },
          { x: xCor, y: fromPos.bottom },
          { x: xCor, y: toPos.top },
          { x: x2, y: toPos.top },
        ]
        bestSides = ['bottom', 'top']
      }
    }

    // Self-healing: clamp SEMUA waypoint ke koridor agar path tidak pernah keluar (border/horizontal/vertikal)
    if (pathAllowedBounds && bestPath.length >= 2) {
      const xL = pathAllowedBounds.left
      const xR = pathAllowedBounds.left + pathAllowedBounds.width
      const yT = pathAllowedBounds.top
      const yB = pathAllowedBounds.top + pathAllowedBounds.height
      bestPath = bestPath.map((p) => ({
        x: Math.round(Math.max(xL, Math.min(xR, p.x))),
        y: Math.round(Math.max(yT, Math.min(yB, p.y))),
      }))
    }

    // Path terstruktur: buang titik koliner (redundan) agar path lebih rapi dan kurang ruwet
    bestPath = simplifyPathCollinear(bestPath)

    // Register this arrow's segments for other arrows to avoid
    if (routedSegmentsRef) {
      routedSegmentsRef.current.set(connection.id, pathToSegments(bestPath))
    }

    setPathData(pathToD(bestPath))

    let lp: { x: number; y: number } | null = null
    if (connection.label && bestPath.length >= 2) {
      lp = manualLabelPosition ?? getFixedDistancePoint(bestPath[0], bestPath[1], 30, 19)
    }
    setLabelPos(lp)

    const [sSide, eSide] = bestSides
    const payload: PathUpdatedPayload = {
      connectionId: connection.id, from: connection.from, to: connection.to,
      sSide, eSide,
      startPoint: { ...bestPath[0] },
      endPoint: { ...bestPath[bestPath.length - 1] },
      bendPoints: bestPath.slice(1, -1).map(p => ({ ...p })),
      label: connection.label ?? undefined,
      labelPosition: lp ?? undefined,
    }
    const sig = `${connection.id}:${sSide}:${eSide}:${JSON.stringify(bestPath)}`
    if (onPathUpdated && lastAutoSigRef.current !== sig) {
      lastAutoSigRef.current = sig
      onPathUpdated(payload)
    }
    }

    const useIdle = typeof requestIdleCallback !== 'undefined'
    const scheduleId = useIdle
      ? requestIdleCallback(runRouting, { timeout: ROUTING_IDLE_TIMEOUT_MS })
      : requestAnimationFrame(runRouting)
    return () => {
      if (useIdle) cancelIdleCallback(scheduleId)
      else cancelAnimationFrame(scheduleId)
      routedSegmentsRef?.current.delete(connection.id)
    }
  }, [
    idcontainer, connection.id, connection.from, connection.to,
    connection.label, connection.sourceType, connection.targetType,
    manualConfig, manualLabelPosition, obstacles, onPathUpdated, constraintRect,
    usedSides, routedSegmentsRef, reservedSidesRef,
  ])

  if (!pathData) return null
  const effectiveLabelPos = manualLabelPosition ?? labelPos

  return (
    <g>
      <defs>
        <marker
          id={`arrowhead-flow-${idarrow}`}
          markerWidth="10" markerHeight="8" refX="7" refY="4" orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
        </marker>
      </defs>
      <path
        d={pathData} fill="none" stroke="black" strokeWidth="2"
        markerEnd={`url(#arrowhead-flow-${idarrow})`}
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
