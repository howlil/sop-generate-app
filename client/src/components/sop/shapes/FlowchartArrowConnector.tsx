import { useLayoutEffect, useState, useRef } from 'react'
import type { ArrowConnectionConfig, ArrowPathPoint } from '../sopDiagramTypes'

export interface FlowchartConnection {
  id: string
  from: string
  to: string
  label?: string | null
  sourceType?: string
  targetType?: string
}

/** Obstacle element id for collision detection */
export interface ArrowObstacle {
  id: string
}

/** Per-element sides already used by connections; used for scoring. */
export type UsedSides = Record<
  string,
  {
    in?: Partial<Record<Side, string[]>>
    out?: Partial<Record<Side, string[]>>
  }
>

type Side = 'top' | 'bottom' | 'left' | 'right'

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

interface FlowchartArrowConnectorProps {
  connection: FlowchartConnection
  idcontainer: string
  idarrow: string | number
  /** Other element ids to avoid when routing (excluding from/to) */
  obstacles?: ArrowObstacle[]
  /** Sides already in use per element; affects scoring */
  usedSides?: UsedSides
  /** When set and valid, path is taken from here and auto-routing is skipped */
  manualConfig?: ArrowConnectionConfig | null
  /** Override label position when set */
  manualLabelPosition?: { x: number; y: number } | null
  /** Callback when path is computed (auto or from manual); parent can persist to arrowConfig */
  onPathUpdated?: (payload: PathUpdatedPayload) => void
}

function getElementPosition(
  elementId: string,
  container: HTMLElement
): { left: number; top: number; width: number; height: number; right: number; bottom: number } | null {
  const el = document.getElementById(elementId)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
    right: rect.right - containerRect.left,
    bottom: rect.bottom - containerRect.top,
  }
}

const SAMPLE_STEP = 10
const OBSTACLE_PADDING = 15
const ESCAPE_OFFSET = 30

function isPointInRect(
  p: { x: number; y: number },
  rect: { left: number; top: number; right: number; bottom: number }
): boolean {
  return (
    p.x >= rect.left - OBSTACLE_PADDING &&
    p.x <= rect.right + OBSTACLE_PADDING &&
    p.y >= rect.top - OBSTACLE_PADDING &&
    p.y <= rect.bottom + OBSTACLE_PADDING
  )
}

function isPathColliding(
  points: { x: number; y: number }[],
  obstacleRects: { left: number; top: number; right: number; bottom: number }[]
): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]
    const p2 = points[i + 1]
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
    if (dist < 1) continue
    const numSamples = Math.max(2, Math.ceil(dist / SAMPLE_STEP))
    for (let j = 1; j < numSamples; j++) {
      const t = j / numSamples
      const pt = {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
      }
      for (const obs of obstacleRects) {
        if (isPointInRect(pt, obs)) return true
      }
    }
  }
  return false
}

function getFixedDistancePoint(
  start: { x: number; y: number },
  end: { x: number; y: number },
  distance: number,
  offset = 19
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

function isValidManualConfig(c: ArrowConnectionConfig | null | undefined): boolean {
  if (!c?.startPoint || !c?.endPoint) return false
  const { startPoint, endPoint } = c
  return (
    typeof startPoint.x === 'number' &&
    typeof startPoint.y === 'number' &&
    typeof endPoint.x === 'number' &&
    typeof endPoint.y === 'number' &&
    !isNaN(startPoint.x) &&
    !isNaN(startPoint.y) &&
    !isNaN(endPoint.x) &&
    !isNaN(endPoint.y)
  )
}

export function FlowchartArrowConnector({
  connection,
  idcontainer,
  idarrow,
  obstacles = [],
  usedSides = {},
  manualConfig,
  manualLabelPosition,
  onPathUpdated,
}: FlowchartArrowConnectorProps) {
  const [pathData, setPathData] = useState('')
  const [labelPos, setLabelPos] = useState<{ x: number; y: number } | null>(null)
  const emittedRef = useRef(false)
  /** Avoid re-emitting same auto path when usedSides updates (prevents infinite setState loop) */
  const lastEmittedAutoSigRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const container =
      document.getElementById(idcontainer) ?? document.querySelector<HTMLElement>(`#${idcontainer}`)
    if (!container) {
      setPathData('')
      setLabelPos(null)
      return
    }

    const hasValidManual =
      isValidManualConfig(manualConfig) && manualConfig!.startPoint && manualConfig!.endPoint

    if (hasValidManual && manualConfig!) {
      const { startPoint, endPoint, bendPoints = [] } = manualConfig
      const points = [startPoint, ...bendPoints, endPoint]
      const d = pathToD(points)
      setPathData(d)
      if (connection.label) {
        const pos =
          manualLabelPosition ??
          getFixedDistancePoint(
            startPoint,
            bendPoints.length ? bendPoints[0] : endPoint,
            30,
            19
          )
        setLabelPos(pos)
      } else setLabelPos(null)
      if (onPathUpdated && !emittedRef.current) {
        const pos =
          connection.label &&
          (manualLabelPosition ??
            getFixedDistancePoint(
              startPoint,
              bendPoints.length ? bendPoints[0] : endPoint,
              30,
              19
            ))
        onPathUpdated({
          connectionId: connection.id,
          from: connection.from,
          to: connection.to,
          sSide: manualConfig.sSide,
          eSide: manualConfig.eSide,
          startPoint: { ...startPoint },
          endPoint: { ...endPoint },
          bendPoints: bendPoints.map((p) => ({ ...p })),
          label: connection.label ?? undefined,
          labelPosition: pos ?? undefined,
        })
        emittedRef.current = true
      }
      return
    }

    emittedRef.current = false
    const fromPos = getElementPosition(connection.from, container)
    const toPos = getElementPosition(connection.to, container)
    if (!fromPos || !toPos) {
      setPathData('')
      setLabelPos(null)
      return
    }

    const obstacleRects = obstacles
      .map((o) => o.id)
      .filter((id) => id !== connection.from && id !== connection.to)
      .map((id) => getElementPosition(id, container))
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => ({
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
      }))

    const fromCenter = {
      x: fromPos.left + fromPos.width / 2,
      y: fromPos.top + fromPos.height / 2,
    }
    const toCenter = {
      x: toPos.left + toPos.width / 2,
      y: toPos.top + toPos.height / 2,
    }
    const deltaX = toCenter.x - fromCenter.x
    const deltaY = toCenter.y - fromCenter.y

    // Rule: connector must connect only to one of 4 cardinal points (top, bottom, left, right) — center of each edge
    const fromPoints: Record<Side, { x: number; y: number }> = {
      top: { x: fromCenter.x, y: fromPos.top },
      bottom: { x: fromCenter.x, y: fromPos.bottom },
      left: { x: fromPos.left, y: fromCenter.y },
      right: { x: fromPos.right, y: fromCenter.y },
    }
    const toPoints: Record<Side, { x: number; y: number }> = {
      top: { x: toCenter.x, y: toPos.top },
      bottom: { x: toCenter.x, y: toPos.bottom },
      left: { x: toPos.left, y: toCenter.y },
      right: { x: toPos.right, y: toCenter.y },
    }

    const startSides: Side[] = ['right', 'left', 'bottom', 'top']
    const endSides: Side[] = ['top', 'left', 'right', 'bottom']

    interface Candidate {
      points: { x: number; y: number }[]
      start: { x: number; y: number }
      end: { x: number; y: number }
      bendPoints: { x: number; y: number }[]
      type: string
      sSide: Side
      eSide: Side
      length: number
      score: number
    }

    const candidates: Candidate[] = []

    for (const sSide of startSides) {
      for (const eSide of endSides) {
        const start = fromPoints[sSide]
        const end = toPoints[eSide]

        if (sSide === 'bottom' && eSide === 'top' && fromPos.bottom <= toPos.top) {
          const overlapLeft = Math.max(fromPos.left, toPos.left)
          const overlapRight = Math.min(fromPos.right, toPos.right)
          if (overlapRight > overlapLeft) {
            const midX = overlapLeft + (overlapRight - overlapLeft) / 2
            const pts = [{ x: midX, y: start.y }, { x: midX, y: end.y }]
            candidates.push({
              points: pts,
              start: pts[0],
              end: pts[1],
              bendPoints: [],
              type: 'straight_v',
              sSide,
              eSide,
              length: Math.abs(start.y - end.y),
              score: 0,
            })
          }
        }
        if (sSide === 'top' && eSide === 'bottom' && fromPos.top >= toPos.bottom) {
          const overlapLeft = Math.max(fromPos.left, toPos.left)
          const overlapRight = Math.min(fromPos.right, toPos.right)
          if (overlapRight > overlapLeft) {
            const midX = overlapLeft + (overlapRight - overlapLeft) / 2
            const pts = [{ x: midX, y: start.y }, { x: midX, y: end.y }]
            candidates.push({
              points: pts,
              start: pts[0],
              end: pts[1],
              bendPoints: [],
              type: 'straight_v',
              sSide,
              eSide,
              length: Math.abs(start.y - end.y),
              score: 0,
            })
          }
        }
        if (sSide === 'right' && eSide === 'left' && fromPos.right <= toPos.left) {
          const overlapTop = Math.max(fromPos.top, toPos.top)
          const overlapBottom = Math.min(fromPos.bottom, toPos.bottom)
          if (overlapBottom > overlapTop) {
            const midY = overlapTop + (overlapBottom - overlapTop) / 2
            const pts = [{ x: start.x, y: midY }, { x: end.x, y: midY }]
            candidates.push({
              points: pts,
              start: pts[0],
              end: pts[1],
              bendPoints: [],
              type: 'straight_h',
              sSide,
              eSide,
              length: Math.abs(start.x - end.x),
              score: 0,
            })
          }
        }
        if (sSide === 'left' && eSide === 'right' && fromPos.left >= toPos.right) {
          const overlapTop = Math.max(fromPos.top, toPos.top)
          const overlapBottom = Math.min(fromPos.bottom, toPos.bottom)
          if (overlapBottom > overlapTop) {
            const midY = overlapTop + (overlapBottom - overlapTop) / 2
            const pts = [{ x: start.x, y: midY }, { x: end.x, y: midY }]
            candidates.push({
              points: pts,
              start: pts[0],
              end: pts[1],
              bendPoints: [],
              type: 'straight_h',
              sSide,
              eSide,
              length: Math.abs(start.x - end.x),
              score: 0,
            })
          }
        }

        if ((sSide === 'top' || sSide === 'bottom') && (eSide === 'left' || eSide === 'right')) {
          const bend = { x: start.x, y: end.y }
          candidates.push({
            points: [start, bend, end],
            start,
            end,
            bendPoints: [bend],
            type: 'one_bend_vh',
            sSide,
            eSide,
            length: Math.abs(start.y - bend.y) + Math.abs(bend.x - end.x),
            score: 0,
          })
        }
        if ((sSide === 'left' || sSide === 'right') && (eSide === 'top' || eSide === 'bottom')) {
          const bend = { x: end.x, y: start.y }
          candidates.push({
            points: [start, bend, end],
            start,
            end,
            bendPoints: [bend],
            type: 'one_bend_hv',
            sSide,
            eSide,
            length: Math.abs(start.x - bend.x) + Math.abs(bend.y - end.y),
            score: 0,
          })
        }
        // Vertical-to-vertical (bottom↔top) with 1 bend — agar panah "Tidak" (dari diamond ke step di atas) selalu punya path
        if (sSide === 'bottom' && eSide === 'top') {
          const bendViaTargetX = { x: end.x, y: start.y }
          candidates.push({
            points: [start, bendViaTargetX, end],
            start,
            end,
            bendPoints: [bendViaTargetX],
            type: 'one_bend_vv_hthenv',
            sSide,
            eSide,
            length: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
            score: 0,
          })
          const bendViaSourceX = { x: start.x, y: end.y }
          candidates.push({
            points: [start, bendViaSourceX, end],
            start,
            end,
            bendPoints: [bendViaSourceX],
            type: 'one_bend_vv_vthenh',
            sSide,
            eSide,
            length: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
            score: 0,
          })
        }
        if (sSide === 'top' && eSide === 'bottom') {
          const bendViaTargetX = { x: end.x, y: start.y }
          candidates.push({
            points: [start, bendViaTargetX, end],
            start,
            end,
            bendPoints: [bendViaTargetX],
            type: 'one_bend_vv_hthenv',
            sSide,
            eSide,
            length: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
            score: 0,
          })
          const bendViaSourceX = { x: start.x, y: end.y }
          candidates.push({
            points: [start, bendViaSourceX, end],
            start,
            end,
            bendPoints: [bendViaSourceX],
            type: 'one_bend_vv_vthenh',
            sSide,
            eSide,
            length: Math.abs(start.x - end.x) + Math.abs(start.y - end.y),
            score: 0,
          })
        }

        if (sSide === eSide) {
          if (sSide === 'top' || sSide === 'bottom') {
            const b1 = {
              x: start.x,
              y: sSide === 'top' ? Math.min(start.y, end.y) - ESCAPE_OFFSET : Math.max(start.y, end.y) + ESCAPE_OFFSET,
            }
            const b2 = { x: end.x, y: b1.y }
            candidates.push({
              points: [start, b1, b2, end],
              start,
              end,
              bendPoints: [b1, b2],
              type: 'two_bend_vhv',
              sSide,
              eSide,
              length:
                Math.abs(start.y - b1.y) + Math.abs(b1.x - b2.x) + Math.abs(b2.y - end.y),
              score: 0,
            })
          }
          if (sSide === 'left' || sSide === 'right') {
            const b1 = {
              x: sSide === 'left' ? Math.min(start.x, end.x) - ESCAPE_OFFSET : Math.max(start.x, end.x) + ESCAPE_OFFSET,
              y: start.y,
            }
            const b2 = { x: b1.x, y: end.y }
            candidates.push({
              points: [start, b1, b2, end],
              start,
              end,
              bendPoints: [b1, b2],
              type: 'two_bend_hvh',
              sSide,
              eSide,
              length:
                Math.abs(start.x - b1.x) + Math.abs(b1.y - b2.y) + Math.abs(b2.x - end.x),
              score: 0,
            })
          }
        }
      }
    }

    candidates.forEach((p) => {
      let score = p.length
      if (p.type.startsWith('one_bend')) score += 10
      if (p.type.startsWith('two_bend')) score += 30
      if (p.sSide === 'right' && deltaX < -10) score += 150
      if (p.sSide === 'left' && deltaX > 10) score += 150
      if (p.sSide === 'bottom' && deltaY < -10) score += 150
      if (p.sSide === 'top' && deltaY > 10) score += 150
      if (p.eSide === 'right' && deltaX > 10) score += 100
      if (p.eSide === 'left' && deltaX < -10) score += 100
      if (p.eSide === 'bottom' && deltaY > 10) score += 100
      if (p.eSide === 'top' && deltaY < -10) score += 100

      const srcUsed = usedSides[connection.from] ?? { in: {}, out: {} }
      const tgtUsed = usedSides[connection.to] ?? { in: {}, out: {} }
      if (srcUsed.in?.[p.sSide]) score += 800
      if (tgtUsed.out?.[p.eSide]) score += 800
      if (srcUsed.out?.[p.sSide]) score += 100
      if (tgtUsed.in?.[p.eSide]) score += 100
      if (!srcUsed.in?.[p.sSide] && !srcUsed.out?.[p.sSide]) score -= 150
      if (!tgtUsed.in?.[p.eSide] && !tgtUsed.out?.[p.eSide]) score -= 150

      p.score = score
    })

    const unique = Array.from(
      new Map(candidates.map((c) => [JSON.stringify(c.points), c])).values()
    )
    unique.sort((a, b) => a.score - b.score)

    // Rule: connector must not cross diagram — only use a path that does not intersect other shapes
    let best: Candidate | null = null
    for (const path of unique) {
      if (!isPathColliding(path.points, obstacleRects)) {
        best = path
        break
      }
    }
    // Do not fallback to a colliding path; skip drawing if no valid path exists
    if (!best) {
      setPathData('')
      setLabelPos(null)
      return
    }

    const d = pathToD(best.points)
    setPathData(d)

    let labelPosition: { x: number; y: number } | null = null
    if (connection.label) {
      const start = best.start
      const end = best.bendPoints.length ? best.bendPoints[0] : best.end
      labelPosition =
        manualLabelPosition ?? getFixedDistancePoint(start, end, 30, 19)
      setLabelPos(labelPosition)
    } else setLabelPos(null)

    const payload: PathUpdatedPayload = {
      connectionId: connection.id,
      from: connection.from,
      to: connection.to,
      sSide: best.sSide,
      eSide: best.eSide,
      startPoint: { ...best.start },
      endPoint: { ...best.end },
      bendPoints: best.bendPoints.map((p) => ({ ...p })),
      label: connection.label ?? undefined,
      labelPosition: labelPosition ?? undefined,
    }
    const sig = `${connection.id}:${best.sSide}:${best.eSide}:${JSON.stringify(best.points)}`
    if (onPathUpdated && lastEmittedAutoSigRef.current !== sig) {
      lastEmittedAutoSigRef.current = sig
      onPathUpdated(payload)
    }
  }, [
    idcontainer,
    connection.id,
    connection.from,
    connection.to,
    connection.label,
    manualConfig,
    manualLabelPosition,
    obstacles,
    usedSides,
    onPathUpdated,
  ])

  if (!pathData) return null

  const effectiveLabelPos = manualLabelPosition ?? labelPos

  return (
    <g>
      <defs>
        <marker
          id={`arrowhead-flow-${idarrow}`}
          markerWidth="10"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="black" />
        </marker>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="black"
        strokeWidth="2"
        markerEnd={`url(#arrowhead-flow-${idarrow})`}
      />
      {connection.label && effectiveLabelPos && (
        <text
          x={effectiveLabelPos.x}
          y={effectiveLabelPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontFamily="Arial"
          fill="black"
        >
          {connection.label}
        </text>
      )}
    </g>
  )
}
