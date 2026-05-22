import { simplifyOrthogonalPath } from '@/components/sop/sop-diagram/edit/orthogonal-path-edit.util'

/**
 * Orthogonal Router v3 — A* with binary-heap open list
 *
 * Performance targets (per arrow, ~10 obstacles):
 *   A* search  : O(G log G)  — binary heap extracts min in O(log G)
 *   Grid build : O(R^2)      — R = unique ruler lines (typically < 40)
 *   Adjacency  : O(G)        — Map-based O(1) spot lookup
 *   Edge check : O(N)        — N obstacles per edge
 *   Total      : O(G log G + G·N + G·S) where S = occupied segments
 */

export type Side = 'top' | 'right' | 'bottom' | 'left'

export interface Point { x: number; y: number }
export interface Rect { left: number; top: number; width: number; height: number }

export interface ConnectorPoint {
  shape: Rect
  side: Side
  distance: number
}

export interface OccupiedSegment {
  x1: number; y1: number
  x2: number; y2: number
}

export interface PortConstraint {
  exitX?: number
  exitY?: number
  entryX?: number
  entryY?: number
  exitDx?: number
  exitDy?: number
  entryDx?: number
  entryDy?: number
  portConstraint?: 'north' | 'south' | 'east' | 'west' | 'horizontal' | 'vertical'
}

export interface RouteOptions {
  pointA: ConnectorPoint
  pointB: ConnectorPoint
  obstacles?: Rect[]
  shapeMargin?: number
  globalBounds?: Rect
  globalBoundsMargin?: number
  occupiedSegments?: OccupiedSegment[]
  sourcePort?: PortConstraint
  targetPort?: PortConstraint
  jettySize?: number
  sourceJettySize?: number
  targetJettySize?: number
  preferSimple?: boolean
}

/* ── Penalties ────────────────────────────────────────────────── */

const OVERLAP_PENALTY = 8000
const CROSS_PENALTY = 2000
const NEAR_PENALTY = 600
const NEAR_THRESHOLD = 12
/**
 * Penalti tambahan untuk setiap belokan (pergantian arah).
 * Nilai lebih besar membuat pathfinder lebih memilih jalur
 * yang lurus dan mengurangi zig-zag yang tidak perlu.
 */
const BEND_FACTOR = 6

/* ── Compact rectangle ────────────────────────────────────────── */

class R {
  constructor(readonly l: number, readonly t: number, readonly w: number, readonly h: number) {}
  static of(r: Rect) { return new R(r.left, r.top, r.width, r.height) }
  static ltrb(l: number, t: number, r: number, b: number) { return new R(l, t, r - l, b - t) }
  get r() { return this.l + this.w }
  get b() { return this.t + this.h }
  get cx() { return this.l + this.w / 2 }
  get cy() { return this.t + this.h / 2 }
  contains(p: Point) { return p.x >= this.l && p.x <= this.r && p.y >= this.t && p.y <= this.b }
  inflate(h: number, v: number) { return R.ltrb(this.l - h, this.t - v, this.r + h, this.b + v) }
  intersects(o: R) { return o.l < this.r && this.l < o.r && o.t < this.b && this.t < o.b }
  union(o: R) {
    return R.ltrb(Math.min(this.l, o.l), Math.min(this.t, o.t), Math.max(this.r, o.r), Math.max(this.b, o.b))
  }
}

/* ── Segment analysis ─────────────────────────────────────────── */

function rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  const aMin = Math.min(a1, a2), aMax = Math.max(a1, a2)
  const bMin = Math.min(b1, b2), bMax = Math.max(b1, b2)
  return aMin < bMax && bMin < aMax
}

export function segmentsOverlap(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: OccupiedSegment,
): boolean {
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 === b.y1)
    return rangesOverlap(a.x1, a.x2, b.x1, b.x2)
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 === b.x1)
    return rangesOverlap(a.y1, a.y2, b.y1, b.y2)
  return false
}

export function segmentsNearby(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: OccupiedSegment,
  threshold: number,
): boolean {
  if (a.y1 === a.y2 && b.y1 === b.y2 && a.y1 !== b.y1 && Math.abs(a.y1 - b.y1) <= threshold)
    return rangesOverlap(a.x1, a.x2, b.x1, b.x2)
  if (a.x1 === a.x2 && b.x1 === b.x2 && a.x1 !== b.x1 && Math.abs(a.x1 - b.x1) <= threshold)
    return rangesOverlap(a.y1, a.y2, b.y1, b.y2)
  return false
}

function segmentsCross(
  a: { x1: number; y1: number; x2: number; y2: number },
  b: OccupiedSegment,
): boolean {
  if (a.y1 === a.y2 && b.x1 === b.x2) {
    const y = a.y1, x = b.x1
    const xMin = Math.min(a.x1, a.x2), xMax = Math.max(a.x1, a.x2)
    const yMin = Math.min(b.y1, b.y2), yMax = Math.max(b.y1, b.y2)
    return x > xMin && x < xMax && y > yMin && y < yMax
  }
  if (a.x1 === a.x2 && b.y1 === b.y2) {
    const x = a.x1, y = b.y1
    const yMin = Math.min(a.y1, a.y2), yMax = Math.max(a.y1, a.y2)
    const xMin = Math.min(b.x1, b.x2), xMax = Math.max(b.x1, b.x2)
    return y > yMin && y < yMax && x > xMin && x < xMax
  }
  return false
}

function edgePenalty(a: Point, b: Point, occupied: OccupiedSegment[]): number {
  if (occupied.length === 0) return 0
  const seg = { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  let penalty = 0
  for (let i = 0; i < occupied.length; i++) {
    const occ = occupied[i]
    if (segmentsOverlap(seg, occ)) penalty += OVERLAP_PENALTY
    else if (segmentsCross(seg, occ)) penalty += CROSS_PENALTY
    else if (segmentsNearby(seg, occ, NEAR_THRESHOLD)) penalty += NEAR_PENALTY
  }
  return penalty
}

/* ═══════════════════════════════════════════════════════════════════
 *  Binary min-heap for A* open list — O(log n) push/pop
 * ═══════════════════════════════════════════════════════════════════ */

interface ANode {
  p: Point
  g: number
  f: number
  prevDir: 0 | 1 | -1  // 0=none, 1=horizontal, -1=vertical
  parent: ANode | null
}

class MinHeap {
  private data: ANode[] = []

  get size() { return this.data.length }

  push(node: ANode) {
    this.data.push(node)
    this._bubbleUp(this.data.length - 1)
  }

  pop(): ANode | undefined {
    const top = this.data[0]
    const last = this.data.pop()
    if (this.data.length > 0 && last) {
      this.data[0] = last
      this._sinkDown(0)
    }
    return top
  }

  private _bubbleUp(i: number) {
    const d = this.data
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (d[parent].f <= d[i].f) break
      const tmp = d[parent]; d[parent] = d[i]; d[i] = tmp
      i = parent
    }
  }

  private _sinkDown(i: number) {
    const d = this.data
    const len = d.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1, r = 2 * i + 2
      if (l < len && d[l].f < d[smallest].f) smallest = l
      if (r < len && d[r].f < d[smallest].f) smallest = r
      if (smallest === i) break
      const tmp = d[smallest]; d[smallest] = d[i]; d[i] = tmp
      i = smallest
    }
  }
}

/* ── A* pathfinding with heap ─────────────────────────────────── */

function pk(x: number, y: number) { return (x << 16) | (y & 0xffff) }
function pkp(p: Point) { return pk(p.x, p.y) }

interface AdjEntry { to: Point; dist: number }

function astar(
  adj: Map<number, AdjEntry[]>,
  src: Point,
  dst: Point,
  occupied: OccupiedSegment[],
): Point[] {
  const sk = pkp(src), dk = pkp(dst)
  if (!adj.has(sk) || !adj.has(dk)) return []

  const gBest = new Map<number, number>()
  gBest.set(sk, 0)

  const open = new MinHeap()
  open.push({
    p: src, g: 0,
    f: Math.abs(dst.x - src.x) + Math.abs(dst.y - src.y),
    prevDir: 0, parent: null,
  })

  const closed = new Set<number>()

  while (open.size > 0) {
    const cur = open.pop()!
    const ck = pkp(cur.p)

    if (ck === dk) {
      const path: Point[] = []
      let n: ANode | null = cur
      while (n) { path.push(n.p); n = n.parent }
      path.reverse()
      return path
    }

    if (closed.has(ck)) continue
    closed.add(ck)

    const neighbors = adj.get(ck)
    if (!neighbors) continue

    for (let i = 0; i < neighbors.length; i++) {
      const { to, dist } = neighbors[i]
      const nk = pkp(to)
      if (closed.has(nk)) continue

      let cost = dist
      const nd: 0 | 1 | -1 = to.y === cur.p.y ? 1 : (to.x === cur.p.x ? -1 : 0)
      if (cur.prevDir !== 0 && nd !== 0 && cur.prevDir !== nd) cost += dist * BEND_FACTOR
      cost += edgePenalty(cur.p, to, occupied)

      const tentG = cur.g + cost
      const prevG = gBest.get(nk)
      if (prevG !== undefined && tentG >= prevG) continue

      gBest.set(nk, tentG)
      const h = Math.abs(dst.x - to.x) + Math.abs(dst.y - to.y)
      open.push({ p: to, g: tentG, f: tentG + h, prevDir: nd, parent: cur })
    }
  }

  return []
}

/* ── Grid: rulers → spots → adjacency ─────────────────────────── */

function buildSpots(
  vsRaw: number[], hsRaw: number[],
  bounds: R, obs: R[],
): Point[] {
  const vs = dedup(vsRaw.filter(v => v >= bounds.l && v <= bounds.r))
  const hs = dedup(hsRaw.filter(h => h >= bounds.t && h <= bounds.b))

  const blockedSet = new Set<number>()
  const spots: Point[] = []
  const seen = new Set<number>()

  for (let yi = 0; yi < hs.length; yi++) {
    const y = hs[yi]
    for (let xi = 0; xi < vs.length; xi++) {
      const x = vs[xi]
      const key = pk(x, y)
      if (seen.has(key)) continue
      seen.add(key)

      let blocked = false
      for (let oi = 0; oi < obs.length; oi++) {
        const o = obs[oi]
        if (x > o.l && x < o.r && y > o.t && y < o.b) { blocked = true; break }
      }
      if (blocked) { blockedSet.add(key); continue }
      spots.push({ x, y })
    }
  }

  return spots
}

function dedup(arr: number[]): number[] {
  const s = [...new Set(arr)]
  s.sort((a, b) => a - b)
  return s
}

function edgeClear(ax: number, ay: number, bx: number, by: number, obs: R[]): boolean {
  if (ax === bx) {
    const x = ax
    const y1 = Math.min(ay, by), y2 = Math.max(ay, by)
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i]
      if (x > o.l && x < o.r && o.t < y2 && o.b > y1) return false
    }
    return true
  }
  if (ay === by) {
    const y = ay
    const x1 = Math.min(ax, bx), x2 = Math.max(ax, bx)
    for (let i = 0; i < obs.length; i++) {
      const o = obs[i]
      if (y > o.t && y < o.b && o.l < x2 && o.r > x1) return false
    }
    return true
  }
  return true
}

function buildAdj(spots: Point[], obs: R[]): Map<number, AdjEntry[]> {
  const adj = new Map<number, AdjEntry[]>()
  const spotKeys = new Set<number>()
  for (const p of spots) {
    const k = pkp(p)
    spotKeys.add(k)
    adj.set(k, [])
  }

  // Group spots by X and Y for efficient neighbor finding
  const byX = new Map<number, Point[]>()
  const byY = new Map<number, Point[]>()
  for (const p of spots) {
    let xList = byX.get(p.x)
    if (!xList) { xList = []; byX.set(p.x, xList) }
    xList.push(p)

    let yList = byY.get(p.y)
    if (!yList) { yList = []; byY.set(p.y, yList) }
    yList.push(p)
  }

  // Sort each group so we can link only adjacent neighbors
  for (const list of byX.values()) list.sort((a, b) => a.y - b.y)
  for (const list of byY.values()) list.sort((a, b) => a.x - b.x)

  const link = (a: Point, b: Point) => {
    if (!edgeClear(a.x, a.y, b.x, b.y, obs)) return
    const d = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    adj.get(pkp(a))!.push({ to: b, dist: d })
    adj.get(pkp(b))!.push({ to: a, dist: d })
  }

  // Link vertical neighbors (same X, adjacent Y)
  for (const list of byX.values()) {
    for (let i = 0; i < list.length - 1; i++) {
      link(list[i], list[i + 1])
    }
  }
  // Link horizontal neighbors (same Y, adjacent X)
  for (const list of byY.values()) {
    for (let i = 0; i < list.length - 1; i++) {
      link(list[i], list[i + 1])
    }
  }

  return adj
}

/* ── Helpers ──────────────────────────────────────────────────── */

function axisValue(side: Side, port: PortConstraint | undefined, isSource: boolean, fallback: number): number {
  if (!port) return fallback
  const raw = side === 'top' || side === 'bottom'
    ? (isSource ? port.exitX : port.entryX)
    : (isSource ? port.exitY : port.entryY)
  return raw == null ? fallback : Math.max(0, Math.min(1, raw))
}

function axisOffset(side: Side, port: PortConstraint | undefined, isSource: boolean): Point {
  if (!port) return { x: 0, y: 0 }
  const dx = isSource ? (port.exitDx ?? 0) : (port.entryDx ?? 0)
  const dy = isSource ? (port.exitDy ?? 0) : (port.entryDy ?? 0)
  if (side === 'top' || side === 'bottom') return { x: dx, y: dy }
  return { x: dx, y: dy }
}

function connPt(cp: ConnectorPoint, port?: PortConstraint, isSource = true): Point {
  const s = R.of(cp.shape)
  const dist = axisValue(cp.side, port, isSource, cp.distance)
  const offset = axisOffset(cp.side, port, isSource)
  switch (cp.side) {
    case 'top':    return { x: s.l + s.w * dist + offset.x, y: s.t + offset.y }
    case 'bottom': return { x: s.l + s.w * dist + offset.x, y: s.b + offset.y }
    case 'left':   return { x: s.l + offset.x, y: s.t + s.h * dist + offset.y }
    case 'right':  return { x: s.r + offset.x, y: s.t + s.h * dist + offset.y }
  }
}

function extrudePt(cp: ConnectorPoint, margin: number, port?: PortConstraint, isSource = true): Point {
  const { x, y } = connPt(cp, port, isSource)
  switch (cp.side) {
    case 'top':    return { x, y: y - margin }
    case 'bottom': return { x, y: y + margin }
    case 'left':   return { x: x - margin, y }
    case 'right':  return { x: x + margin, y }
  }
}

function isVert(s: Side) { return s === 'top' || s === 'bottom' }

function simplify(pts: Point[]): Point[] {
  if (pts.length <= 2) return pts
  const out = [pts[0]]
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1]
    const isAnchorExtrusion = i === 1 || i === pts.length - 2
    if (isAnchorExtrusion || (!(a.x === b.x && b.x === c.x) && !(a.y === b.y && b.y === c.y))) out.push(b)
  }
  out.push(pts[pts.length - 1])
  return out
}

function clonePoint(p: Point): Point {
  return { x: Math.round(p.x), y: Math.round(p.y) }
}

function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function dedupeConsecutivePoints(points: Point[]): Point[] {
  if (points.length <= 1) return points.map(clonePoint)
  const out: Point[] = []
  for (const point of points) {
    const next = clonePoint(point)
    const prev = out[out.length - 1]
    if (!prev || prev.x !== next.x || prev.y !== next.y) out.push(next)
  }
  return out
}

function pointInRect(p: Point, rect: Rect): boolean {
  return p.x >= rect.left
    && p.x <= rect.left + rect.width
    && p.y >= rect.top
    && p.y <= rect.top + rect.height
}

export function isOrthogonalPath(path: Point[]): boolean {
  if (path.length < 2) return false
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    if (a.x !== b.x && a.y !== b.y) return false
  }
  return true
}

export function assertOrthogonalPath(path: Point[], context = 'path'): Point[] {
  if (!isOrthogonalPath(path)) {
    throw new Error(`${context} must be orthogonal`)
  }
  return path
}

interface NormalizeOrthogonalPathOptions {
  preserveTerminalJetty?: boolean
  bounds?: Rect | null
}

function chooseElbow(a: Point, b: Point, bounds: Rect | null | undefined): Point {
  const elbows = [
    { x: a.x, y: b.y },
    { x: b.x, y: a.y },
  ]
  if (!bounds) return elbows[0]
  const scored = elbows.map((elbow, index) => ({
    elbow,
    score: (pointInRect(elbow, bounds) ? 0 : 10_000) + index,
  }))
  scored.sort((left, right) => left.score - right.score)
  return scored[0].elbow
}

/**
 * Routing invariant for flowchart arrows:
 * every stored/rendered path must consist only of orthogonal segments.
 * This normalizer removes duplicates, converts any diagonal legacy/manual
 * segment into a deterministic elbow, and trims redundant collinear points
 * without stripping the terminal jetty points by default.
 */
export function normalizeOrthogonalPath(
  path: Point[],
  options: NormalizeOrthogonalPathOptions = {},
): Point[] {
  const { preserveTerminalJetty = true, bounds = null } = options
  if (path.length === 0) return []

  const deduped = dedupeConsecutivePoints(path)
  if (deduped.length <= 1) return deduped

  const expanded: Point[] = [deduped[0]]
  for (let i = 0; i < deduped.length - 1; i++) {
    const a = expanded[expanded.length - 1]
    const b = deduped[i + 1]
    if (a.x === b.x || a.y === b.y) {
      expanded.push(clonePoint(b))
      continue
    }
    const elbow = chooseElbow(a, b, bounds)
    if (a.x !== elbow.x || a.y !== elbow.y) expanded.push(elbow)
    expanded.push(clonePoint(b))
  }

  const clean = dedupeConsecutivePoints(expanded)
  if (clean.length <= 2) return clean

  const out: Point[] = [clean[0]]
  const TERMINAL_JETTY_KEEP_MAX = 32
  for (let i = 1; i < clean.length - 1; i++) {
    const prev = out[out.length - 1]
    const cur = clean[i]
    const next = clean[i + 1]
    const keepJetty = preserveTerminalJetty && (
      (i === 1 && manhattanDistance(clean[0], cur) <= TERMINAL_JETTY_KEEP_MAX) ||
      (i === clean.length - 2 && manhattanDistance(cur, clean[clean.length - 1]) <= TERMINAL_JETTY_KEEP_MAX)
    )
    const collinear =
      (prev.x === cur.x && cur.x === next.x) ||
      (prev.y === cur.y && cur.y === next.y)
    if (keepJetty || !collinear) out.push(cur)
  }
  out.push(clean[clean.length - 1])

  return dedupeConsecutivePoints(out)
}

function pointInsideBounds(p: Point, bounds: R): boolean {
  return p.x >= bounds.l && p.x <= bounds.r && p.y >= bounds.t && p.y <= bounds.b
}

function segmentHitsObstacle(
  a: Point,
  b: Point,
  obs: R[],
  skipA: R | null,
  skipB: R | null,
): boolean {
  if (a.x !== b.x && a.y !== b.y) return true
  for (const o of obs) {
    if ((skipA && o === skipA) || (skipB && o === skipB)) continue
    if (!edgeClear(a.x, a.y, b.x, b.y, [o])) return true
  }
  return false
}

function pathClear(path: Point[], obs: R[], sourceObs: R, targetObs: R, bounds: R): boolean {
  if (path.length < 2) return false
  for (const p of path) {
    if (!pointInsideBounds(p, bounds)) return false
  }
  for (let i = 0; i < path.length - 1; i++) {
    const skipA = i === 0 ? sourceObs : null
    const skipB = i === path.length - 2 ? targetObs : null
    if (segmentHitsObstacle(path[i], path[i + 1], obs, skipA, skipB)) return false
  }
  return true
}

const COLUMN_ALIGN_PX = 2
const ROUTE_GRID_SNAP = 4

function snapRouteGrid(value: number): number {
  return Math.round(value / ROUTE_GRID_SNAP) * ROUTE_GRID_SNAP
}

function buildSimplePathCandidates(
  start: Point,
  extA: Point,
  extB: Point,
  end: Point,
): Point[][] {
  const paths: Point[][] = []
  const dx = Math.abs(extA.x - extB.x)
  const dy = Math.abs(extA.y - extB.y)
  const sameColumn = dx <= COLUMN_ALIGN_PX
  const sameRow = dy <= COLUMN_ALIGN_PX
  const spineX = snapRouteGrid((extA.x + extB.x) / 2)
  const spineY = snapRouteGrid((extA.y + extB.y) / 2)
  const alignedA = sameColumn ? { x: spineX, y: extA.y } : extA
  const alignedB = sameColumn ? { x: spineX, y: extB.y } : extB
  if (sameColumn || sameRow) {
    paths.push([start, alignedA, alignedB, end])
  }
  if (sameColumn && !sameRow) {
    const midY = snapRouteGrid((extA.y + extB.y) / 2)
    paths.push([start, alignedA, { x: spineX, y: midY }, alignedB, end])
  } else if (sameRow && !sameColumn) {
    const midX = snapRouteGrid((extA.x + extB.x) / 2)
    paths.push([start, extA, { x: midX, y: spineY }, extB, end])
  }
  if (!sameColumn) {
    paths.push([start, extA, { x: extB.x, y: extA.y }, extB, end])
    paths.push([start, extA, { x: extA.x, y: extB.y }, extB, end])
  }
  return paths.map((path) => simplify(path))
}

/* ── Post-process nudging ─────────────────────────────────────── */

function nudgeSegments(pts: Point[], obs: R[], occupied: OccupiedSegment[]): Point[] {
  if (pts.length < 4) return pts
  const out = pts.map(p => ({ x: p.x, y: p.y }))

  for (let i = 1; i < out.length - 2; i++) {
    const a = out[i], b = out[i + 1]
    const isH = a.y === b.y && a.x !== b.x
    const isV = a.x === b.x && a.y !== b.y
    if (!isH && !isV) continue

    if (isH) {
      const segY = a.y, lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x)
      let above = -Infinity, below = Infinity
      for (const o of obs) {
        if (o.r <= lo || o.l >= hi) continue
        if (o.b <= segY + 1) above = Math.max(above, o.b)
        if (o.t >= segY - 1) below = Math.min(below, o.t)
      }
      if (above <= -Infinity || below >= Infinity || below - above <= 8) continue
      const mid = Math.round((above + below) / 2)
      if (Math.abs(mid - segY) <= 2 || mid <= above || mid >= below) continue
      if (obs.some(o => o.l < hi && o.r > lo && o.t <= mid && o.b >= mid)) continue
      const nudged = { x1: a.x, y1: mid, x2: b.x, y2: mid }
      if (!occupied.some(occ => segmentsOverlap(nudged, occ))) {
        out[i] = { x: a.x, y: mid }; out[i + 1] = { x: b.x, y: mid }
      }
    } else {
      const segX = a.x, lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y)
      let leftOf = -Infinity, rightOf = Infinity
      for (const o of obs) {
        if (o.b <= lo || o.t >= hi) continue
        if (o.r <= segX + 1) leftOf = Math.max(leftOf, o.r)
        if (o.l >= segX - 1) rightOf = Math.min(rightOf, o.l)
      }
      if (leftOf <= -Infinity || rightOf >= Infinity || rightOf - leftOf <= 8) continue
      const mid = Math.round((leftOf + rightOf) / 2)
      if (Math.abs(mid - segX) <= 2 || mid <= leftOf || mid >= rightOf) continue
      if (obs.some(o => o.t < hi && o.b > lo && o.l <= mid && o.r >= mid)) continue
      const nudged = { x1: mid, y1: a.y, x2: mid, y2: b.y }
      if (!occupied.some(occ => segmentsOverlap(nudged, occ))) {
        out[i] = { x: mid, y: a.y }; out[i + 1] = { x: mid, y: b.y }
      }
    }
  }
  return out
}

/* ── Score a path ─────────────────────────────────────────────── */

export function scorePath(path: Point[], occupied: OccupiedSegment[]): number {
  const normalized = normalizeOrthogonalPath(path)
  if (normalized.length < 2 || !isOrthogonalPath(normalized)) return Infinity
  let score = 0
  for (let i = 0; i < normalized.length - 1; i++) {
    const dx = normalized[i + 1].x - normalized[i].x
    const dy = normalized[i + 1].y - normalized[i].y
    score += Math.abs(dx) + Math.abs(dy) // Manhattan distance - avoids sqrt
    const seg = { x1: normalized[i].x, y1: normalized[i].y, x2: normalized[i + 1].x, y2: normalized[i + 1].y }
    for (let j = 0; j < occupied.length; j++) {
      const occ = occupied[j]
      if (segmentsOverlap(seg, occ)) score += OVERLAP_PENALTY
      else if (segmentsCross(seg, occ)) score += CROSS_PENALTY
      else if (segmentsNearby(seg, occ, NEAR_THRESHOLD)) score += NEAR_PENALTY
    }
  }
  score += Math.max(0, normalized.length - 2) * 140
  for (let i = 0; i < normalized.length - 1; i += 1) {
    const len =
      Math.abs(normalized[i + 1]!.x - normalized[i]!.x) +
      Math.abs(normalized[i + 1]!.y - normalized[i]!.y)
    if (len > 0 && len < 14) score += 35
  }
  return score
}

export function pathOverlapsSegments(
  path: Point[],
  occupied: OccupiedSegment[],
  options: { includeCross?: boolean; nearbyThreshold?: number } = {},
): boolean {
  if (occupied.length === 0) return false
  const { includeCross = false, nearbyThreshold = 0 } = options
  const normalized = normalizeOrthogonalPath(path)
  if (normalized.length < 2 || !isOrthogonalPath(normalized)) return true

  for (let i = 0; i < normalized.length - 1; i++) {
    const seg = {
      x1: normalized[i].x,
      y1: normalized[i].y,
      x2: normalized[i + 1].x,
      y2: normalized[i + 1].y,
    }
    for (const occ of occupied) {
      if (segmentsOverlap(seg, occ)) return true
      if (includeCross && segmentsCross(seg, occ)) return true
      if (nearbyThreshold > 0 && segmentsNearby(seg, occ, nearbyThreshold)) return true
    }
  }

  return false
}

export function pathIntersectsRectangles(
  path: Point[],
  rectangles: Rect[],
  clearance = 0,
): boolean {
  if (rectangles.length === 0) return false
  const obs = rectangles.map((rect) => R.of(rect).inflate(clearance, clearance))
  const normalized = normalizeOrthogonalPath(path)
  if (normalized.length < 2 || !isOrthogonalPath(normalized)) return true

  for (let i = 0; i < normalized.length - 1; i++) {
    const a = normalized[i]
    const b = normalized[i + 1]
    if (!edgeClear(a.x, a.y, b.x, b.y, obs)) return true
  }

  return false
}

export function pathToSegments(path: Point[]): OccupiedSegment[] {
  const normalized = assertOrthogonalPath(normalizeOrthogonalPath(path), 'pathToSegments input')
  const segs: OccupiedSegment[] = []
  for (let i = 0; i < normalized.length - 1; i++)
    segs.push({ x1: normalized[i].x, y1: normalized[i].y, x2: normalized[i + 1].x, y2: normalized[i + 1].y })
  return segs
}

/* ═══════════════════════════════════════════════════════════════════
 *  Corridor-based routing — shared graph built once per page
 * ═══════════════════════════════════════════════════════════════════ */

export interface CellInfo {
  row: number
  col: number
  rect: Rect
  center: Point
  occupied: boolean
  shapeRect?: Rect
}

export interface CorridorGraph {
  spots: Point[]
  adj: Map<number, AdjEntry[]>
  shapeObs: R[]
}

export interface CorridorRouteOptions {
  graph: CorridorGraph
  pointA: ConnectorPoint
  pointB: ConnectorPoint
  shapeMargin?: number
  occupiedSegments?: OccupiedSegment[]
  sourcePort?: PortConstraint
  targetPort?: PortConstraint
  jettySize?: number
  sourceJettySize?: number
  targetJettySize?: number
}

/** Lebar obstacle virtual di tepi cell agar path tidak menimpa garis border box tabel */
const BORDER_OBSTACLE_PX = 6
/** Lebar obstacle virtual di batas atas cell agar path tidak naik ke header */
const TOP_BORDER_OBSTACLE_PX = 8

/**
 * Build a shared corridor graph from the table cell grid.
 * Runs once per page — all arrows on the page share this graph.
 * Menambah obstacle virtual di border kiri/kanan tiap cell agar path tidak menimpa garis box.
 */
export function buildCorridorGraph(
  cells: CellInfo[][],
  margin = 10,
): CorridorGraph {
  const rawSpots: Point[] = []
  const shapeRectsRaw: R[] = []
  const rows = cells.length
  if (rows === 0) return { spots: [], adj: new Map(), shapeObs: [] }
  const cols = cells[0].length

  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const cell = cells[ri][ci]
      if (cell.occupied && cell.shapeRect) {
        shapeRectsRaw.push(R.of(cell.shapeRect))
      }
      // Virtual obstacle di tepi kiri/kanan cell agar path tidak menimpa garis border tabel
      const r = cell.rect
      if (r.width > BORDER_OBSTACLE_PX * 2) {
        shapeRectsRaw.push(R.ltrb(r.left, r.top, r.left + BORDER_OBSTACLE_PX, r.top + r.height))
        shapeRectsRaw.push(R.ltrb(r.left + r.width - BORDER_OBSTACLE_PX, r.top, r.left + r.width, r.top + r.height))
      }
      // Virtual obstacle di batas atas cell agar path tidak naik ke header / row sebelumnya
      if (r.height > TOP_BORDER_OBSTACLE_PX * 2) {
        shapeRectsRaw.push(R.ltrb(r.left, r.top, r.left + r.width, r.top + TOP_BORDER_OBSTACLE_PX))
      }
    }
  }

  const inflated = shapeRectsRaw.map(s => s.inflate(margin, margin))

  const isInsideObs = (pt: Point): boolean => {
    for (const s of inflated) {
      if (pt.x > s.l && pt.x < s.r && pt.y > s.t && pt.y < s.b) return true
    }
    return false
  }

  // 1) Cell centers of ALL cells (empty cells are corridor nodes;
  //    occupied cells get filtered by isInsideObs below)
  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      rawSpots.push(cells[ri][ci].center)
    }
  }

  // Offset dari garis border cell agar corridor tidak tepat di edge (path hanya di tengah area pelaksana)
  // Nilai lebih besar = path lebih jauh dari border cell
  const EDGE_INSET = 10

  // 2) Titik di tengah koridor antara dua cell horizontal (bukan tepat di border)
  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols - 1; ci++) {
      const left = cells[ri][ci], right = cells[ri][ci + 1]
      if (!left.occupied || !right.occupied) {
        const boundaryX = left.rect.left + left.rect.width
        const y = Math.round(left.rect.top + left.rect.height / 2)
        rawSpots.push({ x: Math.round(boundaryX - EDGE_INSET), y })
        rawSpots.push({ x: Math.round(boundaryX + EDGE_INSET), y })
      }
    }
  }

  // 3) Titik di tengah koridor antara dua cell vertikal (bukan tepat di border)
  for (let ri = 0; ri < rows - 1; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const top = cells[ri][ci], bot = cells[ri + 1][ci]
      if (!top.occupied || !bot.occupied) {
        const boundaryY = top.rect.top + top.rect.height
        const x = Math.round(top.rect.left + top.rect.width / 2)
        rawSpots.push({ x, y: Math.round(boundaryY - EDGE_INSET) })
        rawSpots.push({ x, y: Math.round(boundaryY + EDGE_INSET) })
      }
    }
  }

  // 4) Shape anchor extrusion points
  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const cell = cells[ri][ci]
      if (!cell.occupied || !cell.shapeRect) continue
      const s = R.of(cell.shapeRect)
      rawSpots.push(
        { x: Math.round(s.cx), y: Math.round(s.t - margin) },
        { x: Math.round(s.cx), y: Math.round(s.b + margin) },
        { x: Math.round(s.l - margin), y: Math.round(s.cy) },
        { x: Math.round(s.r + margin), y: Math.round(s.cy) },
      )
    }
  }

  // Deduplicate + filter blocked
  const seen = new Set<number>()
  const spots: Point[] = []
  for (const p of rawSpots) {
    const k = pk(p.x, p.y)
    if (seen.has(k)) continue
    seen.add(k)
    if (!isInsideObs(p)) spots.push(p)
  }

  const adj = buildAdj(spots, inflated)
  return { spots, adj, shapeObs: inflated }
}

/**
 * Route a single arrow on the shared corridor graph.
 * Injects start/end anchor nodes and connects them to the corridor.
 */
export function routeOnCorridor(opts: CorridorRouteOptions): Point[] {
  const {
    graph,
    pointA,
    pointB,
    shapeMargin: margin = 10,
    occupiedSegments = [],
    sourcePort,
    targetPort,
    jettySize,
    sourceJettySize,
    targetJettySize,
  } = opts

  const sourceJetty = sourceJettySize ?? jettySize ?? margin
  const targetJetty = targetJettySize ?? jettySize ?? margin
  const oA = connPt(pointA, sourcePort, true)
  const oB = connPt(pointB, targetPort, false)
  const extA = { x: Math.round(extrudePt(pointA, sourceJetty, sourcePort, true).x), y: Math.round(extrudePt(pointA, sourceJetty, sourcePort, true).y) }
  const extB = { x: Math.round(extrudePt(pointB, targetJetty, targetPort, false).x), y: Math.round(extrudePt(pointB, targetJetty, targetPort, false).y) }

  const kA = pkp(extA)
  const kB = pkp(extB)

  // Shallow-clone adj lists only for nodes we modify
  const adj = new Map<number, AdjEntry[]>()
  for (const [k, v] of graph.adj) adj.set(k, [...v])

  if (!adj.has(kA)) adj.set(kA, [])
  if (!adj.has(kB)) adj.set(kB, [])

  // Group corridor nodes by X and Y for fast axis-aligned lookup
  const byX = new Map<number, Point[]>()
  const byY = new Map<number, Point[]>()
  for (const p of graph.spots) {
    let xl = byX.get(p.x); if (!xl) { xl = []; byX.set(p.x, xl) }; xl.push(p)
    let yl = byY.get(p.y); if (!yl) { yl = []; byY.set(p.y, yl) }; yl.push(p)
  }

  const linkAnchor = (anchor: Point, ak: number) => {
    const anchorList = adj.get(ak)!
    const linked = new Set<number>()

    // Vertical neighbors: nodes with same X
    const sameX = byX.get(anchor.x)
    if (sameX) {
      for (const n of sameX) {
        const nk = pkp(n)
        if (nk === ak || linked.has(nk)) continue
        const d = Math.abs(n.y - anchor.y)
        if (d > 0 && edgeClear(anchor.x, anchor.y, n.x, n.y, graph.shapeObs)) {
          linked.add(nk)
          anchorList.push({ to: n, dist: d })
          const nl = adj.get(nk)
          if (nl) nl.push({ to: anchor, dist: d })
        }
      }
    }

    // Horizontal neighbors: nodes with same Y
    const sameY = byY.get(anchor.y)
    if (sameY) {
      for (const n of sameY) {
        const nk = pkp(n)
        if (nk === ak || linked.has(nk)) continue
        const d = Math.abs(n.x - anchor.x)
        if (d > 0 && edgeClear(anchor.x, anchor.y, n.x, n.y, graph.shapeObs)) {
          linked.add(nk)
          anchorList.push({ to: n, dist: d })
          const nl = adj.get(nk)
          if (nl) nl.push({ to: anchor, dist: d })
        }
      }
    }
  }

  linkAnchor(extA, kA)
  linkAnchor(extB, kB)

  const path = astar(adj, extA, extB, occupiedSegments)
  if (path.length === 0) return []

  const raw = simplify([oA, ...path, oB])
  const cleaned = simplifyOrthogonalPath(normalizeOrthogonalPath(raw))
  return assertOrthogonalPath(cleaned, 'routeOnCorridor result')
}

/* ═══════════════════════════════════════════════════════════════════
 *  Legacy ruler-based routing (fallback)
 * ═══════════════════════════════════════════════════════════════════ */

export function routeOrthogonal(opts: RouteOptions): Point[] {
  const {
    pointA, pointB,
    obstacles: extras = [],
    shapeMargin: rawMargin = 10,
    globalBounds: gb,
    globalBoundsMargin: gbm = 20,
    occupiedSegments = [],
    sourcePort,
    targetPort,
    jettySize,
    sourceJettySize,
    targetJettySize,
    preferSimple = true,
  } = opts

  const shA = R.of(pointA.shape)
  const shB = R.of(pointB.shape)

  let margin = rawMargin
  let infA = shA.inflate(margin, margin)
  let infB = shB.inflate(margin, margin)
  if (infA.intersects(infB)) { margin = 0; infA = shA; infB = shB }

  const infExtras = extras.map(o => R.of(o).inflate(margin, margin))
  const allObs = [infA, infB, ...infExtras]

  let bounds = infA.union(infB)
  for (const o of infExtras) bounds = bounds.union(o)
  bounds = bounds.inflate(gbm, gbm)
  if (gb) {
    const g = R.of(gb)
    bounds = R.ltrb(
      Math.max(bounds.l, g.l), Math.max(bounds.t, g.t),
      Math.min(bounds.r, g.r), Math.min(bounds.b, g.b),
    )
  }

  // Collect ruler lines from obstacle edges
  const vs: number[] = [bounds.l, bounds.r]
  const hs: number[] = [bounds.t, bounds.b]
  for (const o of allObs) {
    vs.push(o.l, o.r)
    hs.push(o.t, o.b)
  }

  const oA = connPt(pointA, sourcePort, true), oB = connPt(pointB, targetPort, false)
  if (isVert(pointA.side)) vs.push(oA.x); else hs.push(oA.y)
  if (isVert(pointB.side)) vs.push(oB.x); else hs.push(oB.y)

  // Add midpoints between rulers for routing flexibility
  const addMidpoints = (arr: number[]) => {
    const sorted = dedup(arr)
    const extra: number[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i]
      if (gap > 16) extra.push(Math.round((sorted[i] + sorted[i + 1]) / 2))
    }
    return [...arr, ...extra]
  }

  const finalVs = addMidpoints(vs)
  const finalHs = addMidpoints(hs)

  const spots = buildSpots(finalVs, finalHs, bounds, allObs)

  const sourceJetty = sourceJettySize ?? jettySize ?? margin
  const targetJetty = targetJettySize ?? jettySize ?? margin
  const extA = extrudePt(pointA, sourceJetty, sourcePort, true)
  const extB = extrudePt(pointB, targetJetty, targetPort, false)

  if (preferSimple) {
    const simpleCandidates = buildSimplePathCandidates(oA, extA, extB, oB)
    let bestSimple: Point[] | null = null
    let bestSimpleScore = Infinity
    for (const candidate of simpleCandidates) {
      const normalizedCandidate = normalizeOrthogonalPath(candidate)
      if (!isOrthogonalPath(normalizedCandidate)) continue
      if (!pathClear(normalizedCandidate, allObs, infA, infB, bounds)) continue
      if (pathOverlapsSegments(normalizedCandidate, occupiedSegments, { includeCross: true })) continue
      const score = scorePath(normalizedCandidate, occupiedSegments)
      if (score < bestSimpleScore) {
        bestSimple = normalizedCandidate
        bestSimpleScore = score
      }
    }
    if (bestSimple) {
      const nudged = normalizeOrthogonalPath(nudgeSegments(bestSimple, allObs, occupiedSegments))
      const finalPath = pathClear(nudged, allObs, infA, infB, bounds) &&
        !pathOverlapsSegments(nudged, occupiedSegments, { includeCross: true })
        ? nudged
        : bestSimple
      if (!pathClear(finalPath, allObs, infA, infB, bounds) ||
        pathOverlapsSegments(finalPath, occupiedSegments, { includeCross: true })) {
        return []
      }
      return assertOrthogonalPath(
        finalPath,
        'routeOrthogonal simple result',
      )
    }
  }

  spots.push(extA, extB)

  const adj = buildAdj(spots, allObs)
  const path = astar(adj, extA, extB, occupiedSegments)

  if (path.length === 0) return []

  const simplified = normalizeOrthogonalPath(simplify([oA, ...path, oB]))
  const nudged = normalizeOrthogonalPath(nudgeSegments(simplified, allObs, occupiedSegments))
  const finalPath = pathClear(nudged, allObs, infA, infB, bounds) &&
    !pathOverlapsSegments(nudged, occupiedSegments, { includeCross: true })
    ? nudged
    : simplified
  if (!pathClear(finalPath, allObs, infA, infB, bounds) ||
    pathOverlapsSegments(finalPath, occupiedSegments, { includeCross: true })) {
    return []
  }
  return assertOrthogonalPath(
    finalPath,
    'routeOrthogonal result',
  )
}
