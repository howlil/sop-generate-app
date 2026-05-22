import type { Side } from '@/components/sop/sop-diagram/core/route/selectSidePairs'
import {
  normalizeOrthogonalPath,
  pathIntersectsRectangles,
  routeOnCorridor,
  routeOrthogonal,
  type CorridorGraph,
  type Point,
  type Rect,
} from '@/components/sop/sop-diagram/core/route/orthogonalRouter'
import {
  bpmnPathHitsObstacle,
  routeBpmn,
  type BpmnRouteOptions,
} from '@/components/sop/sop-diagram/core/route/bpmnRouter'
import { simplifyOrthogonalPath } from './orthogonal-path-edit.util'

export type PathGuardDiagramKind = 'flowchart' | 'bpmn'

const DEFAULT_CLEARANCE = 3
const SHAPE_INTERIOR_INSET = 3
const FLOWCHART_SHAPE_MARGIN = 16

export interface PathShapeGuardCheckInput {
  kind: PathGuardDiagramKind
  path: Point[]
  obstacles: Rect[]
  fromShape: Rect
  toShape: Rect
  clearance?: number
}

export interface RepairPathAroundShapesInput {
  kind: PathGuardDiagramKind
  startPoint: Point
  endPoint: Point
  sSide: Side
  eSide: Side
  fromShape: Rect
  toShape: Rect
  obstacles: Rect[]
  flowchart?: {
    globalBounds?: Rect
    globalBoundsMargin?: number
    corridorGraph?: CorridorGraph | null
  }
  bpmn?: BpmnRouteOptions
}

function distanceOnSide(shape: Rect, side: Side, point: Point): number {
  if (side === 'top' || side === 'bottom') {
    if (shape.width <= 0) return 0.5
    return Math.max(0, Math.min(1, (point.x - shape.left) / shape.width))
  }
  if (shape.height <= 0) return 0.5
  return Math.max(0, Math.min(1, (point.y - shape.top) / shape.height))
}

function filterRoutingObstacles(
  obstacles: Rect[],
  fromShape: Rect,
  toShape: Rect,
): Rect[] {
  return obstacles.filter(
    (obs) =>
      !(
        obs.left < fromShape.left + fromShape.width &&
        obs.left + obs.width > fromShape.left &&
        obs.top < fromShape.top + fromShape.height &&
        obs.top + obs.height > fromShape.top
      ) &&
      !(
        obs.left < toShape.left + toShape.width &&
        obs.left + obs.width > toShape.left &&
        obs.top < toShape.top + toShape.height &&
        obs.top + obs.height > toShape.top
      ),
  )
}

function pointInRectInterior(point: Point, rect: Rect, inset: number): boolean {
  return (
    point.x > rect.left + inset &&
    point.x < rect.left + rect.width - inset &&
    point.y > rect.top + inset &&
    point.y < rect.top + rect.height - inset
  )
}

/** True bila ada segmen ortogonal yang memotong interior shape (termasuk from/to). */
export function pathCrossesShapeBodies(
  path: Point[],
  fromShape: Rect,
  toShape: Rect,
  obstacles: Rect[],
  clearance = DEFAULT_CLEARANCE,
): boolean {
  const normalized = normalizeOrthogonalPath(path.map((p) => ({ ...p })))
  if (normalized.length < 2) return false
  const inset = SHAPE_INTERIOR_INSET + clearance
  const bodyRects = [fromShape, toShape, ...obstacles]
  for (let i = 0; i < normalized.length - 1; i += 1) {
    const a = normalized[i]!
    const b = normalized[i + 1]!
    if (a.x !== b.x && a.y !== b.y) return true
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    for (const rect of bodyRects) {
      if (pointInRectInterior(mid, rect, inset)) return true
    }
  }
  return pathIntersectsRectangles(normalized, obstacles, clearance)
}

export function isPathBlockingShapes(input: PathShapeGuardCheckInput): boolean {
  const { kind, path, obstacles, fromShape, toShape, clearance = DEFAULT_CLEARANCE } = input
  if (path.length < 2) return false
  if (kind === 'bpmn') {
    return bpmnPathHitsObstacle(path, obstacles, fromShape, toShape)
  }
  return pathCrossesShapeBodies(path, fromShape, toShape, obstacles, clearance)
}

function attachManualEndpoints(path: Point[], startPoint: Point, endPoint: Point): Point[] {
  if (path.length < 2) return [startPoint, endPoint]
  const next = path.map((p) => ({ ...p }))
  next[0] = { ...startPoint }
  next[next.length - 1] = { ...endPoint }
  return normalizeOrthogonalPath(next)
}

function repairFlowchartPath(input: RepairPathAroundShapesInput): Point[] | null {
  const routingObstacles = filterRoutingObstacles(input.obstacles, input.fromShape, input.toShape)
  const distA = distanceOnSide(input.fromShape, input.sSide, input.startPoint)
  const distB = distanceOnSide(input.toShape, input.eSide, input.endPoint)
  const pointA = { shape: input.fromShape, side: input.sSide, distance: distA }
  const pointB = { shape: input.toShape, side: input.eSide, distance: distB }
  const corridorGraph = input.flowchart?.corridorGraph
  const corridorPath =
    corridorGraph != null
      ? routeOnCorridor({
          graph: corridorGraph,
          pointA,
          pointB,
          shapeMargin: FLOWCHART_SHAPE_MARGIN,
          occupiedSegments: [],
        })
      : []
  const routed =
    corridorPath.length >= 2
      ? corridorPath
      : routeOrthogonal({
          pointA,
          pointB,
          obstacles: routingObstacles,
          shapeMargin: FLOWCHART_SHAPE_MARGIN,
          globalBounds: input.flowchart?.globalBounds,
          globalBoundsMargin: input.flowchart?.globalBoundsMargin ?? 20,
          occupiedSegments: [],
          preferSimple: true,
        })
  if (routed.length < 2) return null
  const withEndpoints = attachManualEndpoints(routed, input.startPoint, input.endPoint)
  const simplified = simplifyOrthogonalPath(withEndpoints)
  if (
    isPathBlockingShapes({
      kind: 'flowchart',
      path: simplified,
      obstacles: input.obstacles,
      fromShape: input.fromShape,
      toShape: input.toShape,
    })
  ) {
    return null
  }
  return simplified
}

function repairBpmnPath(input: RepairPathAroundShapesInput): Point[] | null {
  if (!input.bpmn) return null
  const routed = routeBpmn({
    ...input.bpmn,
    fromSide: input.sSide,
    toSide: input.eSide,
    fromDistance: distanceOnSide(input.fromShape, input.sSide, input.startPoint),
    toDistance: distanceOnSide(input.toShape, input.eSide, input.endPoint),
  })
  if (routed.length < 2) return null
  const withEndpoints = attachManualEndpoints(routed, input.startPoint, input.endPoint)
  const simplified = simplifyOrthogonalPath(withEndpoints)
  if (
    isPathBlockingShapes({
      kind: 'bpmn',
      path: simplified,
      obstacles: input.obstacles,
      fromShape: input.fromShape,
      toShape: input.toShape,
    })
  ) {
    return null
  }
  return simplified
}

export function repairPathAroundShapes(input: RepairPathAroundShapesInput): Point[] | null {
  if (input.kind === 'bpmn') {
    return repairBpmnPath(input)
  }
  return repairFlowchartPath(input)
}

/** Re-route penuh saat anchor pindah ke sisi lain (draw.io-style). */
export function rebuildPathForAnchorSides(
  input: RepairPathAroundShapesInput,
  options?: { fallbackPath?: Point[] },
): Point[] | null {
  const checkInput = {
    kind: input.kind,
    path: [] as Point[],
    obstacles: input.obstacles,
    fromShape: input.fromShape,
    toShape: input.toShape,
  }
  const isValid = (candidate: Point[]) =>
    candidate.length >= 2 && !isPathBlockingShapes({ ...checkInput, path: candidate })

  const repaired = repairPathAroundShapes(input)
  if (repaired && isValid(repaired)) return repaired

  if (options?.fallbackPath && options.fallbackPath.length >= 2) {
    const fallback = simplifyOrthogonalPath(
      normalizeOrthogonalPath(options.fallbackPath.map((p) => ({ ...p }))),
    )
    if (isValid(fallback)) return fallback
  }
  return repaired
}

export interface PathShapeGuardConfig {
  check: PathShapeGuardCheckInput
  repair: RepairPathAroundShapesInput
}

export function finalizeManualOrthogonalPath(
  path: Point[],
  guard: PathShapeGuardConfig,
  fallbackPath?: Point[],
): Point[] {
  const check = (candidate: Point[]) =>
    !isPathBlockingShapes({ ...guard.check, path: candidate })

  const next = simplifyOrthogonalPath(normalizeOrthogonalPath(path.map((p) => ({ ...p }))))
  if (check(next)) return next

  const repaired = repairPathAroundShapes(guard.repair)
  if (repaired && repaired.length >= 2 && check(repaired)) return repaired

  if (fallbackPath && fallbackPath.length >= 2) {
    const fallback = simplifyOrthogonalPath(normalizeOrthogonalPath(fallbackPath.map((p) => ({ ...p }))))
    if (check(fallback)) return fallback
    return fallback
  }

  if (repaired && repaired.length >= 2) return repaired
  return next
}
