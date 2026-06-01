import type { Point, Rect } from '../../shared/orthogonalRouter'
import type { BpmnLaneLayout, Side } from '../bpmnRouter'

export interface BpmnOuterCorridorCandidate {
  path: Point[]
  sSide: Side
  eSide: Side
  corridor: 'top' | 'right' | 'bottom' | 'left'
}

function edgePoint(shape: Rect, side: Side, distance: number, isDiamond: boolean): Point {
  const ratio = isDiamond ? 0.5 : distance
  switch (side) {
    case 'top':
      return { x: shape.left + shape.width * ratio, y: shape.top }
    case 'right':
      return { x: shape.left + shape.width, y: shape.top + shape.height * ratio }
    case 'bottom':
      return { x: shape.left + shape.width * ratio, y: shape.top + shape.height }
    case 'left':
      return { x: shape.left, y: shape.top + shape.height * ratio }
  }
}

function extrude(point: Point, side: Side, distance: number): Point {
  switch (side) {
    case 'top':
      return { x: point.x, y: point.y - distance }
    case 'right':
      return { x: point.x + distance, y: point.y }
    case 'bottom':
      return { x: point.x, y: point.y + distance }
    case 'left':
      return { x: point.x - distance, y: point.y }
  }
}

function laneBounds(layout: BpmnLaneLayout): { top: number; bottom: number } {
  if (layout.lanes.length === 0) return { top: 0, bottom: 0 }
  return {
    top: Math.min(...layout.lanes.map((lane) => lane.top)),
    bottom: Math.max(...layout.lanes.map((lane) => lane.top + lane.height)),
  }
}

export function buildFeedbackCorridorCandidates(input: {
  fromShape: Rect
  toShape: Rect
  fromDistance: number
  toDistance: number
  fromIsDiamond: boolean
  toIsDiamond: boolean
  layout: BpmnLaneLayout
  bounds: Rect
  trackOffset?: number
}): BpmnOuterCorridorCandidate[] {
  const {
    fromShape,
    toShape,
    fromDistance,
    toDistance,
    fromIsDiamond,
    toIsDiamond,
    layout,
    bounds,
    trackOffset = 0,
  } = input
  const lanes = laneBounds(layout)
  const distance = 24 + trackOffset * 12
  const top = Math.max(bounds.top + 4, lanes.top - distance)
  const bottom = Math.min(bounds.top + bounds.height - 4, lanes.bottom + distance)
  const left = bounds.left + 4
  const right = bounds.left + bounds.width - 4

  const candidates: BpmnOuterCorridorCandidate[] = []
  const addHorizontal = (side: 'top' | 'bottom', y: number) => {
    const start = edgePoint(fromShape, side, fromDistance, fromIsDiamond)
    const end = edgePoint(toShape, side, toDistance, toIsDiamond)
    const extStart = extrude(start, side, distance)
    const extEnd = extrude(end, side, distance)
    candidates.push({
      sSide: side,
      eSide: side,
      corridor: side,
      path: [start, extStart, { x: extStart.x, y }, { x: extEnd.x, y }, extEnd, end],
    })
  }
  const addVertical = (side: 'left' | 'right', x: number) => {
    const start = edgePoint(fromShape, side, fromDistance, fromIsDiamond)
    const end = edgePoint(toShape, side, toDistance, toIsDiamond)
    const extStart = extrude(start, side, distance)
    const extEnd = extrude(end, side, distance)
    candidates.push({
      sSide: side,
      eSide: side,
      corridor: side,
      path: [start, extStart, { x, y: extStart.y }, { x, y: extEnd.y }, extEnd, end],
    })
  }

  addHorizontal('bottom', bottom)
  addHorizontal('top', top)
  addVertical('right', right)
  addVertical('left', left)
  return candidates
}
