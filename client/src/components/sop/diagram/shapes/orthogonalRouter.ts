/**
 * Orthogonal Router v2 — A* with occupied-segment awareness
 *
 * Grid-based A* approach for optimal orthogonal path finding:
 * - Manhattan-distance heuristic for efficient search
 * - Occupied-segment penalty: heavily penalizes paths overlapping existing arrows
 * - Near-segment penalty: penalizes paths running parallel and close to existing arrows
 * - Crossing penalty: penalizes paths crossing existing arrows at a point
 * - Bend penalty to prefer straighter paths
 * - Edge-obstacle validation to prevent paths through obstacle interiors
 * - Post-process nudging with overlap-aware offset selection
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

/* ── Penalties & Thresholds ─────────────────────────────────── */

const OVERLAP_PENALTY = 5000
const CROSS_PENALTY = 1100
const NEAR_PENALTY = 350
const NEAR_THRESHOLD = 10
const BEND_FACTOR = 1.5

/* ── Rectangle utility ──────────────────────────────────────── */

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
  get nw(): Point { return { x: this.l, y: this.t } }
  get ne(): Point { return { x: this.r, y: this.t } }
  get sw(): Point { return { x: this.l, y: this.b } }
  get se(): Point { return { x: this.r, y: this.b } }
  get n(): Point { return { x: this.cx, y: this.t } }
  get s(): Point { return { x: this.cx, y: this.b } }
  get e(): Point { return { x: this.r, y: this.cy } }
  get west(): Point { return { x: this.l, y: this.cy } }
  get center(): Point { return { x: this.cx, y: this.cy } }
}

/* ── Segment analysis ───────────────────────────────────────── */

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

function edgePenalty(
  a: Point,
  b: Point,
  occupied: OccupiedSegment[],
): number {
  if (occupied.length === 0) return 0
  const seg = { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  let penalty = 0
  for (const occ of occupied) {
    if (segmentsOverlap(seg, occ)) penalty += OVERLAP_PENALTY
    else if (segmentsCross(seg, occ)) penalty += CROSS_PENALTY
    else if (segmentsNearby(seg, occ, NEAR_THRESHOLD)) penalty += NEAR_PENALTY
  }
  return penalty
}

/* ── A* pathfinding ─────────────────────────────────────────── */

function pk(p: Point) { return `${p.x},${p.y}` }

function dirOf(a: Point, b: Point): 'h' | 'v' | null {
  if (a.y === b.y) return 'h'
  if (a.x === b.x) return 'v'
  return null
}

interface AdjEntry { to: Point; dist: number }

function astar(
  adj: Map<string, AdjEntry[]>,
  src: Point,
  dst: Point,
  occupied: OccupiedSegment[],
): Point[] {
  const sk = pk(src), dk = pk(dst)
  if (!adj.has(sk) || !adj.has(dk)) return []

  interface Node { p: Point; g: number; f: number; prevDir: 'h' | 'v' | null; parent: Node | null }

  const gBest = new Map<string, number>()
  gBest.set(sk, 0)

  const open: Node[] = [{
    p: src,
    g: 0,
    f: Math.abs(dst.x - src.x) + Math.abs(dst.y - src.y),
    prevDir: null,
    parent: null,
  }]
  const closed = new Set<string>()

  while (open.length > 0) {
    let bi = 0
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bi].f) bi = i
    }
    const cur = open[bi]
    open.splice(bi, 1)

    const ck = pk(cur.p)
    if (ck === dk) {
      const path: Point[] = []
      let n: Node | null = cur
      while (n) { path.unshift(n.p); n = n.parent }
      return path
    }

    if (closed.has(ck)) continue
    closed.add(ck)

    const neighbors = adj.get(ck)
    if (!neighbors) continue

    for (const { to, dist } of neighbors) {
      const nk = pk(to)
      if (closed.has(nk)) continue

      let cost = dist
      const nd = dirOf(cur.p, to)
      if (cur.prevDir && nd && cur.prevDir !== nd) cost += dist * BEND_FACTOR
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

/* ── Grid: rulers → cells → spots → adjacency ──────────────── */

interface Cell { rect: R; row: number; col: number }

function buildGrid(vs: number[], hs: number[], bounds: R): { cells: Cell[]; rows: number; cols: number } {
  const ux = [...new Set(vs)].sort((a, b) => a - b).filter(v => v > bounds.l && v < bounds.r)
  const uy = [...new Set(hs)].sort((a, b) => a - b).filter(h => h > bounds.t && h < bounds.b)
  const xs = [bounds.l, ...ux, bounds.r]
  const ys = [bounds.t, ...uy, bounds.b]
  const rows = ys.length - 1, cols = xs.length - 1
  const cells: Cell[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push({ rect: R.ltrb(xs[c], ys[r], xs[c + 1], ys[r + 1]), row: r, col: c })
  return { cells, rows, cols }
}

function gridToSpots(g: { cells: Cell[]; rows: number; cols: number }, obs: R[]): Point[] {
  const blocked = (p: Point) => obs.some(o => o.contains(p))
  const raw: Point[] = []
  for (const { rect: r, row, col } of g.cells) {
    const fr = row === 0, lr = row === g.rows - 1, fc = col === 0, lc = col === g.cols - 1
    if ((fr && fc) || (fr && lc) || (lr && fc) || (lr && lc)) {
      raw.push(r.nw, r.ne, r.sw, r.se)
    } else if (fr) {
      raw.push(r.nw, r.n, r.ne)
    } else if (lr) {
      raw.push(r.se, r.s, r.sw)
    } else if (fc) {
      raw.push(r.nw, r.west, r.sw)
    } else if (lc) {
      raw.push(r.ne, r.e, r.se)
    } else {
      raw.push(r.nw, r.n, r.ne, r.e, r.se, r.s, r.sw, r.west, r.center)
    }
  }
  const seen = new Set<string>()
  return raw.filter(p => {
    const k = pk(p)
    if (seen.has(k)) return false
    seen.add(k)
    return !blocked(p)
  })
}

/**
 * Check that a straight edge between two spots doesn't pass through
 * the strict interior of any obstacle.
 */
function edgeClear(a: Point, b: Point, obs: R[]): boolean {
  if (a.x === b.x) {
    const x = a.x
    const y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y)
    return !obs.some(o => x > o.l && x < o.r && o.t < y2 && o.b > y1)
  }
  if (a.y === b.y) {
    const y = a.y
    const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x)
    return !obs.some(o => y > o.t && y < o.b && o.l < x2 && o.r > x1)
  }
  return true
}

function spotsToAdj(spots: Point[], obs: R[]): Map<string, AdjEntry[]> {
  const xs = [...new Set(spots.map(p => p.x))].sort((a, b) => a - b)
  const ys = [...new Set(spots.map(p => p.y))].sort((a, b) => a - b)

  const present = new Set(spots.map(pk))
  const adj = new Map<string, AdjEntry[]>()
  for (const p of spots) adj.set(pk(p), [])

  const link = (a: Point, b: Point) => {
    if (!present.has(pk(a)) || !present.has(pk(b))) return
    if (!edgeClear(a, b, obs)) return
    const d = Math.hypot(b.x - a.x, b.y - a.y)
    adj.get(pk(a))!.push({ to: b, dist: d })
    adj.get(pk(b))!.push({ to: a, dist: d })
  }

  for (let i = 0; i < ys.length; i++) {
    for (let j = 0; j < xs.length; j++) {
      const cur: Point = { x: xs[j], y: ys[i] }
      if (!present.has(pk(cur))) continue
      if (j > 0) link(cur, { x: xs[j - 1], y: ys[i] })
      if (i > 0) link(cur, { x: xs[j], y: ys[i - 1] })
    }
  }
  return adj
}

/* ── Helpers ─────────────────────────────────────────────────── */

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

/* ── Post-process nudging (overlap-aware) ───────────────────── */

function nudgeHSegments(pts: Point[], obs: R[], occupied: OccupiedSegment[]): Point[] {
  if (pts.length < 4) return pts
  const out = pts.map(p => ({ x: p.x, y: p.y }))

  for (let i = 1; i < out.length - 2; i++) {
    const a = out[i], b = out[i + 1]
    if (a.y !== b.y || a.x === b.x) continue

    const segY = a.y
    const lo = Math.min(a.x, b.x), hi = Math.max(a.x, b.x)

    let above = -Infinity, below = Infinity
    for (const o of obs) {
      if (o.r <= lo || o.l >= hi) continue
      if (o.b <= segY + 1) above = Math.max(above, o.b)
      if (o.t >= segY - 1) below = Math.min(below, o.t)
    }
    if (above <= -Infinity || below >= Infinity || below - above <= 8) continue

    const candidates = [Math.round((above + below) / 2)]
    candidates.push(Math.round(above + (below - above) * 0.33))
    candidates.push(Math.round(above + (below - above) * 0.67))

    for (const mid of candidates) {
      if (Math.abs(mid - segY) <= 2) continue
      if (mid <= above || mid >= below) continue
      if (obs.some(o => o.l < hi && o.r > lo && o.t <= mid && o.b >= mid)) continue

      const nudged = { x1: a.x, y1: mid, x2: b.x, y2: mid }
      const overlaps = occupied.some(occ => segmentsOverlap(nudged, occ))
      if (!overlaps) {
        out[i] = { x: a.x, y: mid }
        out[i + 1] = { x: b.x, y: mid }
        break
      }
    }
  }
  return out
}

function nudgeVSegments(pts: Point[], obs: R[], occupied: OccupiedSegment[]): Point[] {
  if (pts.length < 4) return pts
  const out = pts.map(p => ({ x: p.x, y: p.y }))

  for (let i = 1; i < out.length - 2; i++) {
    const a = out[i], b = out[i + 1]
    if (a.x !== b.x || a.y === b.y) continue

    const segX = a.x
    const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y)

    let leftOf = -Infinity, rightOf = Infinity
    for (const o of obs) {
      if (o.b <= lo || o.t >= hi) continue
      if (o.r <= segX + 1) leftOf = Math.max(leftOf, o.r)
      if (o.l >= segX - 1) rightOf = Math.min(rightOf, o.l)
    }
    if (leftOf <= -Infinity || rightOf >= Infinity || rightOf - leftOf <= 8) continue

    const candidates = [Math.round((leftOf + rightOf) / 2)]
    candidates.push(Math.round(leftOf + (rightOf - leftOf) * 0.33))
    candidates.push(Math.round(leftOf + (rightOf - leftOf) * 0.67))

    for (const mid of candidates) {
      if (Math.abs(mid - segX) <= 2) continue
      if (mid <= leftOf || mid >= rightOf) continue
      if (obs.some(o => o.t < hi && o.b > lo && o.l <= mid && o.r >= mid)) continue

      const nudged = { x1: mid, y1: a.y, x2: mid, y2: b.y }
      const overlaps = occupied.some(occ => segmentsOverlap(nudged, occ))
      if (!overlaps) {
        out[i] = { x: mid, y: a.y }
        out[i + 1] = { x: mid, y: b.y }
        break
      }
    }
  }
  return out
}

/* ── Score a completed path against occupied segments ────────── */

export function scorePath(path: Point[], occupied: OccupiedSegment[]): number {
  if (path.length < 2) return Infinity
  let score = 0
  for (let i = 0; i < path.length - 1; i++) {
    score += Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y)
    const seg = { x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y }
    for (const occ of occupied) {
      if (segmentsOverlap(seg, occ)) score += OVERLAP_PENALTY
      else if (segmentsCross(seg, occ)) score += CROSS_PENALTY
      else if (segmentsNearby(seg, occ, NEAR_THRESHOLD)) score += NEAR_PENALTY
    }
  }
  score += Math.max(0, path.length - 2) * 220
  return score
}

/** Convert a Point[] path to OccupiedSegment[] for inter-arrow coordination. */
export function pathToSegments(path: Point[]): OccupiedSegment[] {
  const segs: OccupiedSegment[] = []
  for (let i = 0; i < path.length - 1; i++)
    segs.push({ x1: path[i].x, y1: path[i].y, x2: path[i + 1].x, y2: path[i + 1].y })
  return segs
}

/* ── Main routing function ──────────────────────────────────── */

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

  const vs: number[] = [], hs: number[] = []
  for (const o of allObs) { vs.push(o.l, o.r); hs.push(o.t, o.b) }

  const oA = connPt(pointA), oB = connPt(pointB)
  ;(isVert(pointA.side) ? vs : hs).push(isVert(pointA.side) ? oA.x : oA.y)
  ;(isVert(pointB.side) ? vs : hs).push(isVert(pointB.side) ? oB.x : oB.y)

  const uhs = [...new Set(hs)].sort((a, b) => a - b)
  for (let i = 0; i < uhs.length - 1; i++) {
    const a = uhs[i], b = uhs[i + 1], gap = b - a
    hs.push(Math.round((a + b) / 2))
    if (gap > 24) {
      hs.push(Math.round(a + gap / 3))
      hs.push(Math.round(a + (2 * gap) / 3))
    }
  }
  const uvs = [...new Set(vs)].sort((a, b) => a - b)
  for (let i = 0; i < uvs.length - 1; i++) {
    const a = uvs[i], b = uvs[i + 1], gap = b - a
    vs.push(Math.round((a + b) / 2))
    if (gap > 24) {
      vs.push(Math.round(a + gap / 3))
      vs.push(Math.round(a + (2 * gap) / 3))
    }
  }

  /* Minimum grid resolution mengikuti lebar/tinggi bounds (A4 landscape canvas): tambah garis
   * merata di dalam bounds agar path punya cukup waypoint untuk belokan halus */
  if (gb) {
    const g = R.of(gb)
    const W = g.r - g.l
    const H = g.b - g.t
    const stepX = Math.max(40, Math.floor(W / 10))
    const stepY = Math.max(32, Math.floor(H / 10))
    if (W > 60 && stepX > 0) {
      for (let x = g.l + stepX; x < g.r; x += stepX) {
        const px = Math.round(x)
        if (!vs.includes(px)) vs.push(px)
      }
    }
    if (H > 48 && stepY > 0) {
      for (let y = g.t + stepY; y < g.b; y += stepY) {
        const py = Math.round(y)
        if (!hs.includes(py)) hs.push(py)
      }
    }
  }

  const grid = buildGrid(vs, hs, bounds)
  const spots = gridToSpots(grid, allObs)

  const extA = extrudePt(pointA, margin)
  const extB = extrudePt(pointB, margin)
  spots.push(extA, extB)

  const adj = spotsToAdj(spots, allObs)
  const path = astar(adj, extA, extB, occupiedSegments)

  if (path.length === 0) return []

  const simplified = simplify([oA, ...path, oB])
  return nudgeVSegments(nudgeHSegments(simplified, allObs, occupiedSegments), allObs, occupiedSegments)
}
