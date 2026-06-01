import type { FlowchartPelaksanaBoundsRect, ImplementerColumnBoundsMap } from './flowchart-column-bounds.util'
import { columnBoundsToCorridor } from './flowchart-column-bounds.util'
import { buildFlowchartColumnTrunkPath } from './flowchart-column-trunk.util'
import { buildFlowchartCrossColumnPath } from './flowchart-cross-column-route.util'
import {
  buildFlowchartLoopbackPath,
  seqFromFlowchartShapeId,
} from './flowchart-loopback-route.util'
import {
  classifyFlowchartRouteComplexity,
  isSimpleSequentialFlow,
  rowSpanBetween,
} from './flowchart-route-complexity.util'
import type { FlowchartGridLayout } from './flowchart-grid-layout.util'
import { pathWithinPelaksanaBounds } from './flowchart-path-bounds.util'
import { pathIntersectsRectangles, type Point, type Rect, type Side } from '../shared/orthogonalRouter'

export interface TryDedicatedFlowchartPathInput {
  fromShape: Rect
  toShape: Rect
  fromIsDiamond: boolean
  toIsDiamond: boolean
  sourceColumn: FlowchartPelaksanaBoundsRect | null
  targetColumn: FlowchartPelaksanaBoundsRect | null
  routingBounds: FlowchartPelaksanaBoundsRect | null
  columns: ImplementerColumnBoundsMap | null | undefined
  pelaksana: FlowchartPelaksanaBoundsRect | null | undefined
  gridLayout: FlowchartGridLayout | null
  obstacles: Rect[]
  destAbove: boolean
  destBelow: boolean
  sameCol: boolean
  isCrossColumn: boolean
  isLoopBackDecision: boolean
  isTidakLoopBack: boolean
  isLinearDown: boolean
  sourceType?: string
  targetType?: string
  fromId: string
  toId: string
  loopbackCorridorIndex: number
  crossColumnGutterSlot: number
  columnTrunkSlot: number
  sourceJetty: number
  targetJetty: number
}

export interface DedicatedFlowchartPathResult {
  path: Point[]
  sSide: Side
  eSide: Side
}

function isDedicatedUsable(
  path: Point[],
  routingBounds: FlowchartPelaksanaBoundsRect | null,
  obstacles: Rect[],
): boolean {
  if (path.length < 2) return false
  if (!pathWithinPelaksanaBounds(path, routingBounds, 0)) return false
  if (pathIntersectsRectangles(path, obstacles, 2)) return false
  return true
}

/**
 * Coba path khusus (loop-back / lintas kolom / trunk) sebelum router generik.
 * Tidak menolak crossing — reconcile pass menangani violator.
 */
export function tryBuildDedicatedFlowchartPath(
  input: TryDedicatedFlowchartPathInput,
): DedicatedFlowchartPathResult | null {
  const {
    fromShape,
    toShape,
    fromIsDiamond,
    toIsDiamond,
    sourceColumn,
    routingBounds,
    columns,
    pelaksana,
    gridLayout,
    obstacles,
    destAbove,
    destBelow,
    sameCol,
    isCrossColumn,
    isLoopBackDecision,
    isLinearDown,
    sourceType,
    targetType,
    fromId,
    toId,
    loopbackCorridorIndex,
    crossColumnGutterSlot,
    columnTrunkSlot,
    sourceJetty,
    targetJetty,
  } = input

  const fromSeq = seqFromFlowchartShapeId(fromId)
  const toSeq = seqFromFlowchartShapeId(toId)
  const fromRow = Math.max(0, fromSeq - 1)
  const toRow = Math.max(0, toSeq - 1)
  const rowSpan = rowSpanBetween(fromId, toId)

  const complexity = classifyFlowchartRouteComplexity({
    fromId,
    toId,
    destAbove,
    destBelow,
    sameCol,
    isCrossColumn,
    sourceType,
    targetType,
    label: null,
  })

  /** Alur sederhana N→N+1: biarkan router orthogonal (L/Z), jangan bus/trunk paksa. */
  if (isSimpleSequentialFlow({
    fromId,
    toId,
    destAbove,
    destBelow,
    sameCol,
    isCrossColumn,
    sourceType,
    targetType,
    label: null,
  })) {
    return null
  }

  if (isLoopBackDecision && destAbove && sourceColumn) {
    const corridorBounds = columnBoundsToCorridor(sourceColumn)
    const toLeft = toShape.left + toShape.width / 2 < fromShape.left + fromShape.width / 2
    const loopSides: Array<'left' | 'right'> = toLeft ? ['left', 'right'] : ['right', 'left']
    for (const side of loopSides) {
      const loopPath = buildFlowchartLoopbackPath({
        fromPos: {
          left: fromShape.left,
          top: fromShape.top,
          width: fromShape.width,
          height: fromShape.height,
          right: fromShape.left + fromShape.width,
          bottom: fromShape.top + fromShape.height,
        },
        toPos: {
          left: toShape.left,
          top: toShape.top,
          width: toShape.width,
          height: toShape.height,
          right: toShape.left + toShape.width,
          bottom: toShape.top + toShape.height,
        },
        fromShape,
        toShape,
        sSide: side,
        eSide: side,
        fromIsDiamond,
        toIsDiamond,
        sourceJetty,
        targetJetty,
        corridorBounds,
        gridLayout,
        corridorIndex: loopbackCorridorIndex,
        fromRow,
        toRow,
      })
      if (loopPath && isDedicatedUsable(loopPath, routingBounds, obstacles)) {
        return { path: loopPath, sSide: side, eSide: side }
      }
    }
  }

  if (
    complexity === 'complex' &&
    isCrossColumn &&
    (destBelow || destAbove) &&
    rowSpan >= 2
  ) {
    const sidePairs: Array<[Side, Side]> = [
      ['bottom', 'top'],
      ['right', 'top'],
      ['left', 'top'],
      ['bottom', 'left'],
      ['bottom', 'right'],
    ]
    for (const [sSide, eSide] of sidePairs) {
      const crossPath = buildFlowchartCrossColumnPath({
        fromShape,
        toShape,
        fromIsDiamond,
        toIsDiamond,
        sSide,
        eSide,
        sourceJetty,
        targetJetty,
        columns,
        pelaksanaFallback: pelaksana,
        gridLayout,
        gutterSlot: crossColumnGutterSlot,
        fromRow,
        toRow,
      })
      if (crossPath && isDedicatedUsable(crossPath, routingBounds, obstacles)) {
        return { path: crossPath, sSide, eSide }
      }
    }
  }

  if (
    isLinearDown &&
    sameCol &&
    sourceColumn &&
    sourceType !== 'flowchart-decision' &&
    rowSpan >= 2
  ) {
    const trunkPath = buildFlowchartColumnTrunkPath({
      fromShape,
      toShape,
      fromIsDiamond,
      toIsDiamond,
      column: sourceColumn,
      trunkSlot: columnTrunkSlot,
      sourceJetty,
      targetJetty,
    })
    if (trunkPath && isDedicatedUsable(trunkPath, routingBounds, obstacles)) {
      return { path: trunkPath, sSide: 'bottom', eSide: 'top' }
    }
  }

  return null
}
