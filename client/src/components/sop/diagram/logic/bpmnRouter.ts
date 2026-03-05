/**
 * BPMN Router — Lane-aware pipe-and-track routing for BPMN swim-lane diagrams.
 *
 * Key design: routes arrows through column-pipe (vertical gaps between columns)
 * and lane-pipe (horizontal gaps between swim lanes) corridors, ensuring
 * segments never cross through shape interiors.
 *
 * Aturan: path tidak boleh berada di dalam shape (task/diamond/lane). Semua path
 * yang memotong obstacle (shape lain) ditolak oleh pathHitsObstacle; caller
 * wajib mengirim daftar obstacle rect (shape selain from/to) agar rule ini berlaku.
 */

import {
  type OccupiedSegment,
  segmentsOverlap,
  segmentsNearby,
  scorePath,
} from './orthogonalRouter'

export type Side = 'top' | 'right' | 'bottom' | 'left'

interface Point { x: number; y: number }
interface Rect { left: number; top: number; width: number; height: number }

/* ── Lane layout descriptor ───────────────────────────────────── */

export interface LaneInfo {
  index: number
  top: number
  height: number
}

export interface BpmnLaneLayout {
  lanes: LaneInfo[]
  columnStartXs: number[]
  columnWidths: number[]
}

/* ── Connection metadata ──────────────────────────────────────── */

export interface BpmnConnectionMeta {
  id: string
  from: string
  to: string
  label?: string | null
  sourceType?: string
  targetType?: string
  fromLane: number
  toLane: number
  fromCol: number
  toCol: number
}

/* ── Used-sides bookkeeping (same as FlowchartArrowConnector) ── */

export type UsedSides = Record<
  string,
  {
    in?: Partial<Record<Side, string[]>>
    out?: Partial<Record<Side, string[]>>
  }
>

/* ═══════════════════════════════════════════════════════════════════
 *  selectBpmnSidePairs
 *
 *  BPMN flow is horizontal (left → right) with vertical swim lanes.
 * ═══════════════════════════════════════════════════════════════════ */

function isYaLabel(label: string | null | undefined): boolean {
  return /^(ya|yes|y)$/.test((label ?? '').trim().toLowerCase())
}

function isTidakLabel(label: string | null | undefined): boolean {
  return /^(tidak|no|n)$/.test((label ?? '').trim().toLowerCase())
}

export function selectBpmnSidePairs(
  conn: BpmnConnectionMeta,
  _fromRect: Rect,
  _toRect: Rect,
  usedSides: UsedSides,
): Array<[Side, Side]> {
  const sameLane = conn.fromLane === conn.toLane
  const targetRight = conn.toCol > conn.fromCol
  const targetLeft = conn.toCol < conn.fromCol
  const sameCol = conn.toCol === conn.fromCol
  const targetBelow = conn.toLane > conn.fromLane
  const targetAbove = conn.toLane < conn.fromLane

  const isDecSrc = conn.sourceType === 'flowchart-decision'
  const isYa = isYaLabel(conn.label)
  const isTidak = isTidakLabel(conn.label)
  const isStartTerm = conn.sourceType === 'flowchart-terminator'

  const srcOutBusy = (s: Side) =>
    (usedSides[conn.from]?.out?.[s] ?? []).some(id => id !== conn.id)
  const dstInBusy = (s: Side) =>
    (usedSides[conn.to]?.in?.[s] ?? []).some(id => id !== conn.id)

  const pairs: Array<[Side, Side]> = []

  if (isStartTerm) {
    if (sameLane) {
      pairs.push(['right', 'left'])
    } else if (targetBelow) {
      if (targetRight) pairs.push(['right', 'left'])
      pairs.push(['bottom', 'top'])
    } else if (targetAbove) {
      if (targetRight) pairs.push(['right', 'left'])
      pairs.push(['top', 'bottom'])
    } else {
      pairs.push(['right', 'left'])
    }
  }

  if (isDecSrc && (isYa || isTidak)) {
    if (isYa) {
      if (sameLane && targetRight) {
        pairs.push(['right', 'left'])
        pairs.push(['bottom', 'left'])
      } else if (sameLane && targetLeft) {
        if (!srcOutBusy('bottom') && !dstInBusy('bottom')) pairs.push(['bottom', 'bottom'])
        pairs.push(['bottom', 'right'], ['left', 'right'])
      } else if (targetBelow && targetLeft) {
        pairs.push(['bottom', 'right'], ['bottom', 'top'])
        pairs.push(['left', 'top'])
      } else if (targetBelow) {
        pairs.push(['bottom', 'top'])
        if (targetRight) pairs.push(['bottom', 'left'])
      } else if (targetAbove && targetLeft) {
        pairs.push(['top', 'right'], ['top', 'bottom'])
      } else if (targetAbove) {
        pairs.push(['top', 'bottom'])
        if (targetRight) pairs.push(['right', 'left'])
      } else {
        pairs.push(['bottom', 'top'], ['right', 'left'])
      }
    }

    if (isTidak) {
      if (sameLane && targetRight) {
        pairs.push(['top', 'left'])
        pairs.push(['right', 'left'])
      } else if (sameLane && targetLeft) {
        if (!srcOutBusy('top') && !dstInBusy('top')) pairs.push(['top', 'top'])
        pairs.push(['top', 'right'], ['left', 'right'])
      } else if (targetBelow) {
        pairs.push(['bottom', 'top'])
        if (targetRight) pairs.push(['right', 'top'])
      } else if (targetAbove && targetLeft) {
        pairs.push(['top', 'left'])
        pairs.push(['top', 'right'], ['top', 'bottom'])
        pairs.push(['left', 'right'])
      } else if (targetAbove && sameCol) {
        // Loop-back ke step di atas tapi sejajar kolom:
        // arahkan keluar dari atas gateway lalu masuk ke sisi kiri target
        // supaya panah "Tidak" tidak menembus langsung ke bawah.
        pairs.push(['top', 'left'])
        pairs.push(['top', 'bottom'])
      } else if (targetAbove) {
        pairs.push(['top', 'bottom'])
        if (targetRight) pairs.push(['right', 'bottom'])
      } else {
        pairs.push(['top', 'bottom'], ['top', 'left'])
      }
    }
  }

  else if (!isStartTerm) {
    if (sameLane && targetRight) {
      pairs.push(['right', 'left'])
      if (srcOutBusy('right') || dstInBusy('left')) {
        pairs.push(['bottom', 'left'], ['top', 'left'])
      }
    } else if (sameLane && targetLeft) {
      if (!srcOutBusy('top') && !dstInBusy('top')) pairs.push(['top', 'top'])
      if (!srcOutBusy('bottom') && !dstInBusy('bottom')) pairs.push(['bottom', 'bottom'])
      pairs.push(['left', 'right'])
    } else if (sameLane && sameCol) {
      pairs.push(['right', 'left'], ['bottom', 'top'])
    } else if (targetBelow && (targetRight || sameCol)) {
      pairs.push(['bottom', 'top'])
      if (targetRight) pairs.push(['right', 'left'], ['bottom', 'left'])
    } else if (targetAbove && (targetRight || sameCol)) {
      pairs.push(['top', 'bottom'])
      if (targetRight) pairs.push(['right', 'left'])
    } else if (targetBelow && targetLeft) {
      pairs.push(['bottom', 'right'], ['bottom', 'top'], ['left', 'top'])
    } else if (targetAbove && targetLeft) {
      pairs.push(['top', 'right'], ['top', 'bottom'], ['left', 'bottom'])
    }
  }

  pairs.push(
    ['right', 'left'], ['left', 'right'],
    ['bottom', 'top'], ['top', 'bottom'],
    ['right', 'top'], ['right', 'bottom'],
    ['left', 'top'], ['left', 'bottom'],
    ['bottom', 'left'], ['bottom', 'right'],
    ['top', 'left'], ['top', 'right'],
  )

  const seen = new Set<string>()
  const filtered = pairs.filter(([s, e]) => {
    // Untuk gateway sebagai sumber: hindari kombinasi top↔bottom
    // supaya tidak ada path yang menembus diamond secara vertikal.
    if (isDecSrc && (
      (s === 'top' && e === 'bottom') ||
      (s === 'bottom' && e === 'top')
    )) {
      return false
    }

    // Untuk gateway sebagai target: semua koneksi harus masuk dari sisi kiri/kanan,
    // bukan dari atas/bawah, supaya tidak ada entry-point di puncak/bawah diamond
    // yang menabrak path lain.
    const isDecDst = conn.targetType === 'flowchart-decision'
    if (isDecDst && (e === 'top' || e === 'bottom')) {
      return false
    }

    const k = `${s}-${e}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  return filtered
}

/* ═══════════════════════════════════════════════════════════════════
 *  Routing engine
 * ═══════════════════════════════════════════════════════════════════ */

const SHAPE_MARGIN = 24

export interface BpmnRouteOptions {
  fromShape: Rect
  toShape: Rect
  fromSide: Side
  toSide: Side
  fromDistance: number
  toDistance: number
  /** True jika shape sumber decision (diamond); titik sambung harus di vertex agar tidak melayang. */
  fromIsDiamond?: boolean
  /** True jika shape target decision (diamond); titik sambung harus di vertex. */
  toIsDiamond?: boolean
  layout: BpmnLaneLayout
  fromLane: number
  toLane: number
  fromCol: number
  toCol: number
  obstacles: Rect[]
  occupiedSegments: OccupiedSegment[]
  globalBounds?: Rect
}

/** Diamond hanya punya 4 vertex; pakai 0.5 agar titik selalu di vertex, bukan di tepi rect. */
function connPoint(shape: Rect, side: Side, distance: number, isDiamond?: boolean): Point {
  const t = isDiamond ? 0.5 : distance
  switch (side) {
    case 'top': return { x: shape.left + shape.width * t, y: shape.top }
    case 'bottom': return { x: shape.left + shape.width * t, y: shape.top + shape.height }
    case 'left': return { x: shape.left, y: shape.top + shape.height * t }
    case 'right': return { x: shape.left + shape.width, y: shape.top + shape.height * t }
  }
}

function extrudePoint(shape: Rect, side: Side, distance: number, margin: number, isDiamond?: boolean): Point {
  const p = connPoint(shape, side, distance, isDiamond)
  switch (side) {
    case 'top': return { x: p.x, y: p.y - margin }
    case 'bottom': return { x: p.x, y: p.y + margin }
    case 'left': return { x: p.x - margin, y: p.y }
    case 'right': return { x: p.x + margin, y: p.y }
  }
}

function rectContainsSegment(obs: Rect, x1: number, y1: number, x2: number, y2: number): boolean {
  const margin = 4
  const oL = obs.left - margin, oR = obs.left + obs.width + margin
  const oT = obs.top - margin, oB = obs.top + obs.height + margin

  // Treat near-horizontal as horizontal
  if (Math.abs(y1 - y2) < 3) {
    const y = (y1 + y2) / 2
    if (y <= oT || y >= oB) return false
    const segL = Math.min(x1, x2), segR = Math.max(x1, x2)
    return segL < oR && segR > oL
  }
  // Treat near-vertical as vertical
  if (Math.abs(x1 - x2) < 3) {
    const x = (x1 + x2) / 2
    if (x <= oL || x >= oR) return false
    const segT = Math.min(y1, y2), segB = Math.max(y1, y2)
    return segT < oB && segB > oT
  }
  // Diagonal: check if either endpoint is inside the obstacle
  const inRect = (px: number, py: number) => px >= oL && px <= oR && py >= oT && py <= oB
  return inRect(x1, y1) || inRect(x2, y2)
}

/** Overlap between two rects (with small tolerance). */
function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.left < b.left + b.width + 5 && a.left + a.width + 5 > b.left &&
    a.top < b.top + b.height + 5 && a.top + a.height + 5 > b.top
  )
}

/**
 * Return all obstacles (no filter). Path hit test will skip segment 0 vs fromShape
 * and last segment vs toShape so path may attach to source/target only at endpoints.
 */
function filterObstacles(obstacles: Rect[], _fromShape: Rect, _toShape: Rect): Rect[] {
  return obstacles
}

/** Inset (shrink) rect so we can detect segment going through shape interior. */
const SEGMENT_BOUNDARY_INSET = 10

function pathHitsObstacle(
  path: Point[],
  filteredObs: Rect[],
  fromShape: Rect,
  toShape: Rect,
): boolean {
  const fromInset: Rect = {
    left: fromShape.left + SEGMENT_BOUNDARY_INSET,
    top: fromShape.top + SEGMENT_BOUNDARY_INSET,
    width: Math.max(0, fromShape.width - 2 * SEGMENT_BOUNDARY_INSET),
    height: Math.max(0, fromShape.height - 2 * SEGMENT_BOUNDARY_INSET),
  }
  const toInset: Rect = {
    left: toShape.left + SEGMENT_BOUNDARY_INSET,
    top: toShape.top + SEGMENT_BOUNDARY_INSET,
    width: Math.max(0, toShape.width - 2 * SEGMENT_BOUNDARY_INSET),
    height: Math.max(0, toShape.height - 2 * SEGMENT_BOUNDARY_INSET),
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1]
    const isFirstSeg = i === 0
    const isLastSeg = i === path.length - 2
    for (let j = 0; j < filteredObs.length; j++) {
      const obs = filteredObs[j]
      if (isFirstSeg && rectsOverlap(obs, fromShape)) {
        // Segmen pertama tidak boleh menembus interior shape sumber (mis. diamond).
        if (fromInset.width > 0 && fromInset.height > 0 && rectContainsSegment(fromInset, a.x, a.y, b.x, b.y)) return true
        continue
      }
      if (isLastSeg && rectsOverlap(obs, toShape)) {
        if (toInset.width > 0 && toInset.height > 0 && rectContainsSegment(toInset, a.x, a.y, b.x, b.y)) return true
        continue
      }
      if (rectContainsSegment(obs, a.x, a.y, b.x, b.y)) return true
    }
  }
  return false
}

/* ── Find a clear vertical X in a column-pipe gap ────────────── */

function findColumnPipeX(
  layout: BpmnLaneLayout,
  preferredColGap: number,
  extStartY: number,
  extEndY: number,
  obstacles: Rect[],
  occupied: OccupiedSegment[],
): number {
  const { columnStartXs: cs, columnWidths: cw } = layout
  const candidates: Array<{ x: number; penalty: number }> = []

  for (let i = 0; i < cs.length - 1; i++) {
    const gapLeft = cs[i] + cw[i]
    const gapRight = cs[i + 1]
    if (gapRight <= gapLeft) continue
    const mid = Math.round((gapLeft + gapRight) / 2)
    const distFromPreferred = Math.abs(i - preferredColGap)
    let penalty = distFromPreferred * 50

    const seg: OccupiedSegment = {
      x1: mid, y1: Math.min(extStartY, extEndY),
      x2: mid, y2: Math.max(extStartY, extEndY),
    }
    for (const obs of obstacles) {
      if (rectContainsSegment(obs, seg.x1, seg.y1, seg.x2, seg.y2)) penalty += 8000
    }
    for (const occ of occupied) {
      if (segmentsOverlap(seg, occ)) penalty += 5000
      else if (segmentsNearby(seg, occ, 8)) penalty += 300
    }
    candidates.push({ x: mid, penalty })
  }

  // Also add a channel to the left of column 0 and right of last column
  if (cs.length > 0) {
    const leftEdge = cs[0] - 30
    if (leftEdge > 0) candidates.push({ x: Math.round(leftEdge), penalty: cs.length * 50 + 100 })

    const rightEdge = cs[cs.length - 1] + cw[cs.length - 1] + 30
    candidates.push({ x: Math.round(rightEdge), penalty: cs.length * 50 + 100 })
  }

  if (candidates.length === 0) return 50

  let bestX = candidates[0].x
  let bestPen = candidates[0].penalty
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].penalty < bestPen) {
      bestPen = candidates[i].penalty
      bestX = candidates[i].x
    }
  }
  return bestX
}

/* ── Find the lane-pipe Y between two lanes ──────────────────── */

/** Inset dari garis border lane agar path tidak menimpa garis box tabel. */
const LANE_BORDER_INSET = 12

function findLanePipeY(
  layout: BpmnLaneLayout,
  aboveLane: number,
  belowLane: number,
): number {
  if (aboveLane < 0 || belowLane >= layout.lanes.length) {
    if (aboveLane < 0 && layout.lanes.length > 0) return layout.lanes[0].top - 24
    if (belowLane >= layout.lanes.length && layout.lanes.length > 0) {
      const last = layout.lanes[layout.lanes.length - 1]
      return last.top + last.height + 24
    }
    return 0
  }
  const above = layout.lanes[aboveLane]
  const below = layout.lanes[belowLane]
  const aboveBottom = above.top + above.height
  const gap = below.top - aboveBottom
  const mid = (aboveBottom + below.top) / 2
  const inset = Math.min(LANE_BORDER_INSET, Math.max(4, Math.floor(gap / 3)))
  const pipeY = Math.max(aboveBottom + inset, Math.min(below.top - inset, mid))
  return Math.round(pipeY)
}

/* ═══════════════════════════════════════════════════════════════════
 *  buildBpmnWaypoints — the main routing logic
 * ═══════════════════════════════════════════════════════════════════ */

function buildBpmnWaypoints(opts: BpmnRouteOptions): Point[] {
  const {
    fromShape, toShape, fromSide, toSide,
    fromDistance, toDistance, fromIsDiamond, toIsDiamond,
    layout, fromLane, toLane,
    obstacles, occupiedSegments,
  } = opts

  const start = connPoint(fromShape, fromSide, fromDistance, fromIsDiamond)
  const end = connPoint(toShape, toSide, toDistance, toIsDiamond)
  const extStart = extrudePoint(fromShape, fromSide, fromDistance, SHAPE_MARGIN, fromIsDiamond)
  const extEnd = extrudePoint(toShape, toSide, toDistance, SHAPE_MARGIN, toIsDiamond)

  // Pre-filter obstacles once — O(N) instead of O(P*N) per pathHitsObstacle call
  const fObs = filterObstacles(obstacles, fromShape, toShape)

  const sameLane = fromLane === toLane
  const isHorizExit = fromSide === 'left' || fromSide === 'right'
  const isHorizEntry = toSide === 'left' || toSide === 'right'
  const isVertExit = fromSide === 'top' || fromSide === 'bottom'
  const isVertEntry = toSide === 'top' || toSide === 'bottom'

  /* ── Case 1: Same lane, right→left (orthogonal: horizontal lalu vertikal, bukan diagonal) ── */
  if (sameLane && fromSide === 'right' && toSide === 'left' && extStart.x < extEnd.x) {
    const orthogonalL = [start, extStart, { x: extEnd.x, y: extStart.y }, extEnd, end]
    if (!pathHitsObstacle(orthogonalL, fObs, fromShape, toShape)) {
      return orthogonalL
    }
    const lane = layout.lanes[fromLane]
    if (lane) {
      const aboveY = lane.top - SHAPE_MARGIN * 2
      const belowY = lane.top + lane.height + SHAPE_MARGIN * 2
      const abovePipe = fromLane > 0 ? findLanePipeY(layout, fromLane - 1, fromLane) : aboveY
      const belowPipe = fromLane < layout.lanes.length - 1 ? findLanePipeY(layout, fromLane, fromLane + 1) : belowY
      for (const uY of [abovePipe, belowPipe, aboveY, belowY]) {
        const path = [start, extStart, { x: extStart.x, y: uY }, { x: extEnd.x, y: uY }, extEnd, end]
        if (!pathHitsObstacle(path, fObs, fromShape, toShape)) return path
      }
    }
  }

  /* ── Case 2: Same lane, same-side U-turn (loop-back) ───── */
  if (sameLane && fromSide === toSide && (fromSide === 'top' || fromSide === 'bottom')) {
    const lane = layout.lanes[fromLane]
    if (lane) {
      const goUp = fromSide === 'top'
      // Route outside the lane via the lane-pipe
      const baseY = goUp
        ? (fromLane > 0 ? findLanePipeY(layout, fromLane - 1, fromLane) : lane.top - SHAPE_MARGIN * 3)
        : (fromLane < layout.lanes.length - 1 ? findLanePipeY(layout, fromLane, fromLane + 1) : lane.top + lane.height + SHAPE_MARGIN * 3)

      const trackOffset = getTrackOffset(
        { x1: Math.min(extStart.x, extEnd.x), y1: baseY, x2: Math.max(extStart.x, extEnd.x), y2: baseY },
        occupiedSegments,
      )

      const path = [
        start, extStart,
        { x: extStart.x, y: baseY + trackOffset },
        { x: extEnd.x, y: baseY + trackOffset },
        extEnd, end,
      ]
      if (!pathHitsObstacle(path, fObs, fromShape, toShape)) return path
    }
  }

  /* ── Case 3: Cross-lane, vert exit + vert entry ─────────── */
  if (!sameLane && isVertExit && isVertEntry) {
    const goingDown = toLane > fromLane
    const lanesCrossed = Math.abs(toLane - fromLane)
    const fromCenterCol = opts.fromSide === 'bottom' || opts.fromSide === 'top'
      ? findColumnForX(extStart.x, layout)
      : -1
    const toCenterCol = opts.toSide === 'bottom' || opts.toSide === 'top'
      ? findColumnForX(extEnd.x, layout)
      : -1

    // Jika melintasi 2+ lane, selalu pakai lane-pipe (Z) agar path tidak menembus lurus tengah lane.
    // Selain itu, hindari path lurus jika sudah ada segmen panah lain di jalur yang sama
    // supaya panah bolak-balik (contoh: step ↔ decision) tidak menumpuk.
    const roughlyAligned = Math.abs(extStart.x - extEnd.x) < 20
    const useStraight = lanesCrossed < 2 && roughlyAligned

    if (useStraight) {
      const straight = [start, extStart, extEnd, end]
      if (!pathHitsObstacle(straight, fObs, fromShape, toShape)) return straight

      const midY = (extStart.y + extEnd.y) / 2
      const zPath = [start, extStart, { x: extStart.x, y: midY }, { x: extEnd.x, y: midY }, extEnd, end]
      if (!pathHitsObstacle(zPath, fObs, fromShape, toShape)) return zPath
    }

    const laneGapIdx = goingDown ? fromLane : toLane
    const lanePipeY = findLanePipeY(layout, laneGapIdx, laneGapIdx + 1)
    const zPath = [
      start, extStart,
      { x: extStart.x, y: lanePipeY },
      { x: extEnd.x, y: lanePipeY },
      extEnd, end,
    ]
    if (!pathHitsObstacle(zPath, fObs, fromShape, toShape)) return zPath

    // If Z-shape hits obstacles, use a column-pipe for vertical travel
    const preferredGap = Math.min(fromCenterCol, toCenterCol)
    const vX = findColumnPipeX(layout, preferredGap, extStart.y, extEnd.y, fObs, occupiedSegments)
    const colPipePath = [
      start, extStart,
      { x: vX, y: extStart.y },
      { x: vX, y: extEnd.y },
      extEnd, end,
    ]
    if (!pathHitsObstacle(colPipePath, fObs, fromShape, toShape)) return colPipePath
  }

  /* ── Case 4: Cross-lane, horiz exit + vert entry ────────── */
  if (!sameLane && isHorizExit && isVertEntry) {
    const lPath = [start, extStart, { x: extEnd.x, y: extStart.y }, extEnd, end]
    if (!pathHitsObstacle(lPath, fObs, fromShape, toShape)) return lPath

    const preferredGap = Math.max(0, Math.min(opts.fromCol, opts.toCol))
    const vX = findColumnPipeX(layout, preferredGap, extStart.y, extEnd.y, fObs, occupiedSegments)
    const colPath = [
      start, extStart,
      { x: vX, y: extStart.y },
      { x: vX, y: extEnd.y },
      extEnd, end,
    ]
    if (!pathHitsObstacle(colPath, fObs, fromShape, toShape)) return colPath
  }

  /* ── Case 5: Cross-lane, vert exit + horiz entry ────────── */
  if (!sameLane && isVertExit && isHorizEntry) {
    const lPath = [start, extStart, { x: extStart.x, y: extEnd.y }, extEnd, end]
    if (!pathHitsObstacle(lPath, fObs, fromShape, toShape)) return lPath

    const goingDown = toLane > fromLane
    const laneGapIdx = goingDown ? fromLane : toLane
    const lanePipeY = findLanePipeY(layout, laneGapIdx, laneGapIdx + 1)

    if (opts.toCol < opts.fromCol) {
      const preferredGap = Math.max(0, opts.toCol)
      const vX = findColumnPipeX(layout, preferredGap, extStart.y, lanePipeY, fObs, occupiedSegments)
      const path = [
        start, extStart,
        { x: extStart.x, y: lanePipeY },
        { x: vX, y: lanePipeY },
        { x: vX, y: extEnd.y },
        extEnd, end,
      ]
      if (!pathHitsObstacle(path, fObs, fromShape, toShape)) return path
    }

    const fallback = [
      start, extStart,
      { x: extStart.x, y: lanePipeY },
      { x: extEnd.x, y: lanePipeY },
      extEnd, end,
    ]
    if (!pathHitsObstacle(fallback, fObs, fromShape, toShape)) return fallback
    // lPath mungkin menembus shape; jangan return tanpa cek. Fall through ke fallback umum.
  }

  /* ── Case 6: Same lane, horiz exit + horiz entry, loop-back */
  if (sameLane && isHorizExit && isHorizEntry && extStart.x > extEnd.x) {
    const lane = layout.lanes[fromLane]
    if (lane) {
      // U-turn above or below the lane
      for (const goUp of [true, false]) {
        const uY = goUp
          ? (fromLane > 0 ? findLanePipeY(layout, fromLane - 1, fromLane) : lane.top - SHAPE_MARGIN * 3)
          : (fromLane < layout.lanes.length - 1 ? findLanePipeY(layout, fromLane, fromLane + 1) : lane.top + lane.height + SHAPE_MARGIN * 3)

        const path = [
          start, extStart,
          { x: extStart.x, y: uY },
          { x: extEnd.x, y: uY },
          extEnd, end,
        ]
        if (!pathHitsObstacle(path, fObs, fromShape, toShape)) return path
      }
    }
  }

  /* ── Case 7: Same lane, horiz→horiz forward but with obstacle */
  if (sameLane && isHorizExit && isHorizEntry && extStart.x <= extEnd.x) {
    const direct = [start, extStart, { x: extEnd.x, y: extStart.y }, extEnd, end]
    if (Math.abs(extStart.y - extEnd.y) < 3) {
      const simpleDirect = [start, extStart, extEnd, end]
      if (!pathHitsObstacle(simpleDirect, fObs, fromShape, toShape)) return simpleDirect
    }
    if (!pathHitsObstacle(direct, fObs, fromShape, toShape)) return direct
  }

  /* ── Case 8: Horiz exit + horiz entry, cross-lane ──────── */
  if (!sameLane && isHorizExit && isHorizEntry) {
    const preferredGap = Math.max(0, Math.min(opts.fromCol, opts.toCol))
    const vX = findColumnPipeX(layout, preferredGap, extStart.y, extEnd.y, fObs, occupiedSegments)
    const path = [
      start, extStart,
      { x: vX, y: extStart.y },
      { x: vX, y: extEnd.y },
      extEnd, end,
    ]
    if (!pathHitsObstacle(path, fObs, fromShape, toShape)) return path
  }

  /* ── Fallback: L-shape or Z-shape — hanya return jika tidak menembus shape ── */
  if (isVertExit && isVertEntry) {
    const midY = (extStart.y + extEnd.y) / 2
    const p = [start, extStart, { x: extStart.x, y: midY }, { x: extEnd.x, y: midY }, extEnd, end]
    if (!pathHitsObstacle(p, fObs, fromShape, toShape)) return p
  }
  if (isVertExit) {
    const p = [start, extStart, { x: extStart.x, y: extEnd.y }, extEnd, end]
    if (!pathHitsObstacle(p, fObs, fromShape, toShape)) return p
  }
  if (isVertEntry) {
    const p = [start, extStart, { x: extEnd.x, y: extStart.y }, extEnd, end]
    if (!pathHitsObstacle(p, fObs, fromShape, toShape)) return p
  }
  // Both horizontal
  const midX = (extStart.x + extEnd.x) / 2
  const p = [start, extStart, { x: midX, y: extStart.y }, { x: midX, y: extEnd.y }, extEnd, end]
  if (!pathHitsObstacle(p, fObs, fromShape, toShape)) return p

  // Semua kandidat menembus shape; kembalikan kosong agar connector coba side pair lain.
  return []
}

/* ── Helpers ──────────────────────────────────────────────────── */

function findColumnForX(x: number, layout: BpmnLaneLayout): number {
  for (let i = 0; i < layout.columnStartXs.length; i++) {
    const cs = layout.columnStartXs[i]
    const cw = layout.columnWidths[i]
    if (x >= cs && x <= cs + cw) return i
  }
  return 0
}

function getTrackOffset(
  proposedSeg: OccupiedSegment,
  occupied: OccupiedSegment[],
): number {
  const TRACK_SPACING = 10
  let offset = 0
  for (let attempt = 0; attempt < 5; attempt++) {
    const shifted = {
      x1: proposedSeg.x1, y1: proposedSeg.y1 + offset,
      x2: proposedSeg.x2, y2: proposedSeg.y2 + offset,
    }
    const hasOverlap = occupied.some(occ => segmentsOverlap(shifted, occ))
    const hasNearby = occupied.some(occ => segmentsNearby(shifted, occ, 6))
    if (!hasOverlap && !hasNearby) return offset
    offset += (attempt % 2 === 0 ? 1 : -1) * TRACK_SPACING * Math.ceil((attempt + 1) / 2)
  }
  return offset
}

/* ── Simplify collinear and zero-length points ──────────────────
 * Jangan hapus titik ke-2 (extStart) dan kedua-dari-akhir (extEnd), agar segmen
 * dari/tujuan shape tetap pendek dan path tidak terlihat menembus/membelah shape.
 */

function simplifyPath(pts: Point[]): Point[] {
  if (pts.length <= 2) return pts
  const KEEP_FIRST_ATTACH = 1
  const KEEP_LAST_ATTACH = pts.length - 2

  const out = [pts[0]]
  for (let i = 1; i < pts.length - 1; i++) {
    const cur = pts[i]
    const keepAsAttachment = i === KEEP_FIRST_ATTACH || i === KEEP_LAST_ATTACH
    if (keepAsAttachment) {
      out.push(cur)
      continue
    }
    const prev = out[out.length - 1]
    const next = pts[i + 1]
    const sameX = prev.x === cur.x && cur.x === next.x
    const sameY = prev.y === cur.y && cur.y === next.y
    if (!sameX && !sameY) out.push(cur)
  }
  out.push(pts[pts.length - 1])

  const filtered = [out[0]]
  for (let i = 1; i < out.length; i++) {
    const prev = filtered[filtered.length - 1]
    if (Math.abs(out[i].x - prev.x) > 1 || Math.abs(out[i].y - prev.y) > 1) {
      filtered.push(out[i])
    }
  }
  return filtered.length >= 2 ? filtered : out
}

/* ── Clamp path to global bounds (path hanya dalam area diagram, tidak menimpa border) ── */

function clampPathToBounds(path: Point[], bounds: Rect): Point[] {
  const left = bounds.left
  const right = bounds.left + bounds.width
  const top = bounds.top
  const bottom = bounds.top + bounds.height
  return path.map((p) => ({
    x: Math.max(left, Math.min(right, p.x)),
    y: Math.max(top, Math.min(bottom, p.y)),
  }))
}

/* ═══════════════════════════════════════════════════════════════════
 *  Main export
 * ═══════════════════════════════════════════════════════════════════ */

export function routeBpmn(opts: BpmnRouteOptions): Point[] {
  let path = buildBpmnWaypoints(opts)
  if (opts.globalBounds && path.length > 0) {
    path = clampPathToBounds(path, opts.globalBounds)
  }
  return simplifyPath(path)
}

export { scorePath, type OccupiedSegment }

/** Untuk connector: pastikan path tidak menembus shape. Prioritas di atas rute terpendek. */
export function bpmnPathHitsObstacle(
  path: Point[],
  obstacles: Rect[],
  fromShape: Rect,
  toShape: Rect,
): boolean {
  return pathHitsObstacle(path, obstacles, fromShape, toShape)
}

export function bpmnPathToSegments(path: Point[]): OccupiedSegment[] {
  const segs: OccupiedSegment[] = []
  for (let i = 0; i < path.length - 1; i++) {
    segs.push({ x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y })
  }
  return segs
}
