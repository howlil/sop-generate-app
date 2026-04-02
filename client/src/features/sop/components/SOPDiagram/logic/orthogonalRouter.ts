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

interface Point { x: number; y: number }
interface Rect { left: number; top: number; width: number; height: number }

export interface ConnectorPoint {
  shape: Rect
  side: Side
  distance: number
}

export interface OccupiedSegment {
  x1: number; y1: number
  x2: number; y2: number
}

export interface RouteOptions {
  pointA: ConnectorPoint
  pointB: ConnectorPoint
  obstacles?: Rect[]
  shapeMargin?: number
  globalBounds?: Rect
  globalBoundsMargin?: number
  occupiedSegments?: OccupiedSegment[]
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

function connPt(cp: ConnectorPoint): Point {
  const s = R.of(cp.shape)
  switch (cp.side) {
    case 'top':    return { x: s.l + s.w * cp.distance, y: s.t }
    case 'bottom': return { x: s.l + s.w * cp.distance, y: s.b }
    case 'left':   return { x: s.l, y: s.t + s.h * cp.distance }
    case 'right':  return { x: s.r, y: s.t + s.h * cp.distance }
  }
}

function extrudePt(cp: ConnectorPoint, margin: number): Point {
  const { x, y } = connPt(cp)
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
    if (!(a.x === b.x && b.x === c.x) && !(a.y === b.y && b.y === c.y)) out.push(b)
  }
  out.push(pts[pts.length - 1])
  return out
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
  if (path.length < 2) return Infinity
  let score = 0
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x
    const dy = path[i + 1].y - path[i].y
    score += Math.abs(dx) + Math.abs(dy) // Manhattan distance — avoids sqrt
    const seg = { x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y }
    for (let j = 0; j < occupied.length; j++) {
      const occ = occupied[j]
      if (segmentsOverlap(seg, occ)) score += OVERLAP_PENALTY
      else if (segmentsCross(seg, occ)) score += CROSS_PENALTY
      else if (segmentsNearby(seg, occ, NEAR_THRESHOLD)) score += NEAR_PENALTY
    }
  }
  score += Math.max(0, path.length - 2) * 100
  return score
}

export function pathToSegments(path: Point[]): OccupiedSegment[] {
  const segs: OccupiedSegment[] = []
  for (let i = 0; i < path.length - 1; i++)
    segs.push({ x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y })
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
  } = opts

  const oA = connPt(pointA)
  const oB = connPt(pointB)
  const extA = { x: Math.round(extrudePt(pointA, margin).x), y: Math.round(extrudePt(pointA, margin).y) }
  const extB = { x: Math.round(extrudePt(pointB, margin).x), y: Math.round(extrudePt(pointB, margin).y) }

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

  return simplify([oA, ...path, oB])
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

  const oA = connPt(pointA), oB = connPt(pointB)
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

  const extA = extrudePt(pointA, margin)
  const extB = extrudePt(pointB, margin)
  spots.push(extA, extB)

  const adj = buildAdj(spots, allObs)
  const path = astar(adj, extA, extB, occupiedSegments)

  if (path.length === 0) return []

  const simplified = simplify([oA, ...path, oB])
  return nudgeSegments(simplified, allObs, occupiedSegments)
}
