import type { Point } from '@/components/sop/sop-diagram/core/route/orthogonalRouter'
import { normalizeOrthogonalPath } from '@/components/sop/sop-diagram/core/route/orthogonalRouter'

const GRID_SNAP = 4

export function snapToGrid(value: number, grid = GRID_SNAP): number {
  return Math.round(value / grid) * grid
}

export function pathToD(points: Point[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y}${rest.map((p) => ` L ${p.x} ${p.y}`).join('')}`
}

/** Sisipkan waypoint di tengah segment terdekat (index segment = titik awal segment). */
export function insertWaypointAtSegmentMidpoint(path: Point[], segmentIndex: number): Point[] {
  if (path.length < 2 || segmentIndex < 0 || segmentIndex >= path.length - 1) return path
  const a = path[segmentIndex]!
  const b = path[segmentIndex + 1]!
  const mid: Point = {
    x: snapToGrid((a.x + b.x) / 2),
    y: snapToGrid((a.y + b.y) / 2),
  }
  const next = [...path]
  next.splice(segmentIndex + 1, 0, mid)
  return normalizeOrthogonalPath(next)
}

export function removeWaypoint(path: Point[], index: number): Point[] {
  if (path.length <= 2 || index <= 0 || index >= path.length - 1) return path
  const next = path.filter((_, i) => i !== index)
  return normalizeOrthogonalPath(next)
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Point | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const mapped = pt.matrixTransform(ctm.inverse())
  return { x: mapped.x, y: mapped.y }
}

function applyWaypointDragDelta(
  path: Point[],
  index: number,
  dx: number,
  dy: number,
): Point[] {
  if (index < 0 || index >= path.length) return path
  const next = path.map((p) => ({ ...p }))
  const prev = next[index - 1]
  const nextPt = next[index + 1]
  let nx = next[index]!.x + dx
  let ny = next[index]!.y + dy
  if (prev && nextPt) {
    const vertPrev = Math.abs(prev.x - next[index]!.x) < 1
    const vertNext = Math.abs(nextPt.x - next[index]!.x) < 1
    const horizPrev = Math.abs(prev.y - next[index]!.y) < 1
    const horizNext = Math.abs(nextPt.y - next[index]!.y) < 1
    if (vertPrev && vertNext) {
      nx = prev.x
      ny = snapToGrid(ny)
    } else if (horizPrev && horizNext) {
      ny = snapToGrid(ny)
      nx = next[index]!.x
    } else if (horizPrev || horizNext) {
      ny = snapToGrid(ny)
      nx = next[index]!.x
    } else {
      nx = snapToGrid(nx)
      ny = next[index]!.y
    }
  } else {
    nx = snapToGrid(nx)
    ny = snapToGrid(ny)
  }
  next[index] = { x: nx, y: ny }
  return next
}

/** Drag waypoint dari path asal + delta SVG (stabil, tanpa akumulasi error). */
export function dragWaypointFromOrigin(
  originPath: Point[],
  index: number,
  dx: number,
  dy: number,
  options?: { normalize?: boolean },
): Point[] {
  const moved = applyWaypointDragDelta(originPath, index, dx, dy)
  if (options?.normalize === false) return moved
  return normalizeOrthogonalPath(moved)
}

/** Geser satu segmen ortogonal (horizontal naik/turun, vertikal kiri/kanan) — mirip draw.io. */
export function dragSegmentFromOrigin(
  originPath: Point[],
  segmentIndex: number,
  dx: number,
  dy: number,
  options?: { normalize?: boolean },
): Point[] {
  if (segmentIndex < 0 || segmentIndex >= originPath.length - 1) return originPath
  const a = originPath[segmentIndex]!
  const b = originPath[segmentIndex + 1]!
  const isHorizontal = a.y === b.y && a.x !== b.x
  const isVertical = a.x === b.x && a.y !== b.y
  if (!isHorizontal && !isVertical) return originPath
  const next = originPath.map((p) => ({ ...p }))
  if (isHorizontal) {
    const newY = snapToGrid(a.y + dy)
    next[segmentIndex] = { x: a.x, y: newY }
    next[segmentIndex + 1] = { x: b.x, y: newY }
  } else {
    const newX = snapToGrid(a.x + dx)
    next[segmentIndex] = { x: newX, y: a.y }
    next[segmentIndex + 1] = { x: newX, y: b.y }
  }
  if (options?.normalize === false) return next
  return normalizeOrthogonalPath(next)
}

/** Drag waypoint dengan constraint axis-lock orthogonal. */
export function dragWaypointOrthogonal(
  path: Point[],
  index: number,
  dx: number,
  dy: number,
): Point[] {
  return dragWaypointFromOrigin(path, index, dx, dy, { normalize: true })
}

function isCollinearMiddle(prev: Point, cur: Point, next: Point): boolean {
  return (prev.x === cur.x && cur.x === next.x) || (prev.y === cur.y && cur.y === next.y)
}

type SegmentAxis = 'horizontal' | 'vertical'

function segmentAxis(from: Point, to: Point): SegmentAxis | null {
  if (from.x === to.x && from.y !== to.y) return 'vertical'
  if (from.y === to.y && from.x !== to.x) return 'horizontal'
  return null
}

/** Hapus satu lipatan persegi (4 titik) menjadi satu siku ortogonal. */
function tryCollapseRectangle(path: Point[]): Point[] | null {
  for (let i = 0; i < path.length - 3; i += 1) {
    const p0 = path[i]!
    const p1 = path[i + 1]!
    const p2 = path[i + 2]!
    const p3 = path[i + 3]!
    if (p0.x === p2.x && p1.y === p3.y && (p0.x !== p1.x || p0.y !== p1.y)) {
      const corner = { x: p0.x, y: p3.y }
      const merged = [...path.slice(0, i + 1), corner, p3, ...path.slice(i + 4)]
      return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
    }
    if (p0.y === p2.y && p1.x === p3.x && (p0.y !== p1.y || p0.x !== p1.x)) {
      const corner = { x: p3.x, y: p0.y }
      const merged = [...path.slice(0, i + 1), corner, p3, ...path.slice(i + 4)]
      return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
    }
  }
  return null
}

/** Maks. offset dari spine agar lipatan dianggap notch (bukan L-routing sengaja). */
const SPINE_NOTCH_MAX_PX = 48

/**
 * Hapus lipatan 2-langkah dekat spine vertikal/horizontal (b dan e sejajar sumbu utama).
 * L-routing yang menyimpang jauh dari spine (mis. elbow ke kolom lain) tidak dihapus.
 */
function tryRemoveSpineDetour(path: Point[], maxSpineNotchPx = SPINE_NOTCH_MAX_PX): Point[] | null {
  for (let i = 0; i < path.length - 3; i += 1) {
    const b = path[i]!
    const c = path[i + 1]!
    const d = path[i + 2]!
    const e = path[i + 3]!
    const bc = segmentAxis(b, c)
    const cd = segmentAxis(c, d)
    const de = segmentAxis(d, e)
    if (!bc || !cd || !de || bc === cd || cd === de) continue
    if (b.x === e.x && bc === 'horizontal' && cd === 'vertical' && de === 'horizontal') {
      if (Math.abs(c.x - b.x) <= maxSpineNotchPx && Math.abs(d.x - b.x) <= maxSpineNotchPx) {
        const merged = [...path.slice(0, i + 1), ...path.slice(i + 3)]
        return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
      }
    }
    if (b.y === e.y && bc === 'vertical' && cd === 'horizontal' && de === 'vertical') {
      if (Math.abs(c.y - b.y) <= maxSpineNotchPx && Math.abs(d.y - b.y) <= maxSpineNotchPx) {
        const merged = [...path.slice(0, i + 1), ...path.slice(i + 3)]
        return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
      }
    }
  }
  return null
}

/** Hapus detour 2 titik (b-c-d-e) bila b dan e sejajar — hanya lipatan kecil. */
function tryRemoveTwoStepDetour(path: Point[], maxNotchPx: number): Point[] | null {
  for (let i = 0; i < path.length - 3; i += 1) {
    const b = path[i]!
    const c = path[i + 1]!
    const d = path[i + 2]!
    const e = path[i + 3]!
    const bc = segmentAxis(b, c)
    const cd = segmentAxis(c, d)
    const de = segmentAxis(d, e)
    if (!bc || !cd || !de || bc === cd || cd === de) continue
    if (b.x === e.x && bc === 'horizontal' && cd === 'vertical' && de === 'horizontal') {
      const detourW = Math.abs(c.x - b.x)
      const detourH = Math.abs(d.y - c.y)
      if (detourW <= maxNotchPx && detourH <= maxNotchPx) {
        const merged = [...path.slice(0, i + 1), ...path.slice(i + 3)]
        return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
      }
    }
    if (b.y === e.y && bc === 'vertical' && cd === 'horizontal' && de === 'vertical') {
      const detourW = Math.abs(c.x - b.x)
      const detourH = Math.abs(d.y - c.y)
      if (detourW <= maxNotchPx && detourH <= maxNotchPx) {
        const merged = [...path.slice(0, i + 1), ...path.slice(i + 3)]
        return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
      }
    }
  }
  return null
}

/** Hapus detour 3 titik bila notch kecil dan titik awal/akhir sejajar. */
function tryRemoveThreeStepDetour(path: Point[], maxNotchPx: number): Point[] | null {
  for (let i = 0; i < path.length - 4; i += 1) {
    const b = path[i]!
    const c = path[i + 1]!
    const d = path[i + 2]!
    const e = path[i + 3]!
    const f = path[i + 4]!
    const bc = segmentAxis(b, c)
    const cd = segmentAxis(c, d)
    const de = segmentAxis(d, e)
    const ef = segmentAxis(e, f)
    if (!bc || !cd || !de || !ef || bc === cd || cd === de || de === ef) continue
    const detourW = Math.max(Math.abs(c.x - b.x), Math.abs(d.x - e.x))
    const detourH = Math.max(Math.abs(c.y - b.y), Math.abs(d.y - e.y))
    if (detourW > maxNotchPx || detourH > maxNotchPx) continue
    if (
      b.x === f.x &&
      bc === 'vertical' &&
      cd === 'horizontal' &&
      de === 'vertical' &&
      ef === 'horizontal'
    ) {
      const merged = [...path.slice(0, i + 1), ...path.slice(i + 4)]
      return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
    }
    if (
      b.y === f.y &&
      bc === 'horizontal' &&
      cd === 'vertical' &&
      de === 'horizontal' &&
      ef === 'vertical'
    ) {
      const merged = [...path.slice(0, i + 1), ...path.slice(i + 4)]
      return normalizeOrthogonalPath(merged.map((p) => ({ ...p })))
    }
  }
  return null
}

function removeOrthogonalNotches(path: Point[], maxNotchPx: number): Point[] {
  let next = normalizeOrthogonalPath(path.map((p) => ({ ...p })))
  let changed = true
  while (changed) {
    changed = false
    const collapsed = tryCollapseRectangle(next)
    if (collapsed) {
      next = collapsed
      changed = true
      continue
    }
    const spineDetour = tryRemoveSpineDetour(next)
    if (spineDetour) {
      next = spineDetour
      changed = true
      continue
    }
    const twoStep = tryRemoveTwoStepDetour(next, maxNotchPx)
    if (twoStep) {
      next = twoStep
      changed = true
      continue
    }
    const threeStep = tryRemoveThreeStepDetour(next, maxNotchPx)
    if (threeStep) {
      next = threeStep
      changed = true
    }
  }
  return next
}

/** Kurangi zig-zag: collinear, dogleg pendek, dan lipatan persegi redundan. */
export function simplifyOrthogonalPath(path: Point[], minSegmentPx = 10): Point[] {
  if (path.length < 3) return normalizeOrthogonalPath(path.map((p) => ({ ...p })))
  const maxNotchPx = Math.max(minSegmentPx + 8, 24)
  let next = removeOrthogonalNotches(path, maxNotchPx)
  const withoutCollinear: Point[] = [next[0]!]
  for (let i = 1; i < next.length - 1; i += 1) {
    const prev = withoutCollinear[withoutCollinear.length - 1]!
    const cur = next[i]!
    const after = next[i + 1]!
    if (!isCollinearMiddle(prev, cur, after)) {
      withoutCollinear.push(cur)
    }
  }
  withoutCollinear.push(next[next.length - 1]!)
  next = withoutCollinear
  let changed = true
  while (changed && next.length > 2) {
    changed = false
    const simplified: Point[] = [next[0]!]
    for (let i = 1; i < next.length - 1; i += 1) {
      const prev = simplified[simplified.length - 1]!
      const cur = next[i]!
      const after = next[i + 1]!
      const leg1 = Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y)
      const leg2 = Math.abs(after.x - cur.x) + Math.abs(after.y - cur.y)
      if (leg1 < minSegmentPx && leg2 < minSegmentPx) {
        changed = true
        continue
      }
      simplified.push(cur)
    }
    simplified.push(next[next.length - 1]!)
    next = normalizeOrthogonalPath(simplified)
  }
  return removeOrthogonalNotches(next, maxNotchPx)
}

export function findNearestSegmentIndex(path: Point[], x: number, y: number): number {
  if (path.length < 2) return -1
  let bestIdx = 0
  let bestDist = Infinity
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i]!
    const b = path[i + 1]!
    const dist = pointToSegmentDistance(x, y, a.x, a.y, b.x, b.y)
    if (dist < bestDist) {
      bestDist = dist
      bestIdx = i
    }
  }
  return bestIdx
}

function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - x1, py - y1)
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  const cx = x1 + t * dx
  const cy = y1 + t * dy
  return Math.hypot(px - cx, py - cy)
}
