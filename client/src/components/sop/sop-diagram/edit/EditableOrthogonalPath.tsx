import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { Side } from '@/components/sop/sop-diagram/core/route/selectSidePairs'
import type { ArrowPathPoint } from '@/components/sop/sop-diagram/core/sopDiagramTypes'
import {
  clientToSvgPoint,
  dragSegmentFromOrigin,
  dragWaypointFromOrigin,
  findNearestSegmentIndex,
  insertWaypointAtSegmentMidpoint,
  pathToD,
  removeWaypoint,
} from './orthogonal-path-edit.util'
import {
  isEndpointIndex,
  resolveMagneticAnchorSnap,
  type DiagramPathAnchor,
} from './anchor-snap.util'
import {
  finalizeManualOrthogonalPath,
  isPathBlockingShapes,
  pathCrossesShapeBodies,
  rebuildPathForAnchorSides,
  type PathShapeGuardConfig,
} from './path-shape-guard.util'

export interface EditablePathChangePayload {
  startPoint: ArrowPathPoint
  endPoint: ArrowPathPoint
  bendPoints: ArrowPathPoint[]
  sSide: Side
  eSide: Side
}

interface EditableOrthogonalPathProps {
  path: ArrowPathPoint[]
  sSide: Side
  eSide: Side
  anchors?: DiagramPathAnchor[]
  shapeGuard?: PathShapeGuardConfig | null
  connectionId: string
  isSelected: boolean
  markerEndId: string
  strokeWidth?: number
  onSelect: (connectionId: string) => void
  onChange: (payload: EditablePathChangePayload) => void
  onDeleteSelected?: () => void
}

const SNAP_DISTANCE_PX = 16
const SNAP_RELEASE_DISTANCE_PX = 24
const SNAP_HARD_DISTANCE_PX = 5
const DRAG_START_THRESHOLD_PX = 3

type DragMode = 'waypoint' | 'segment'

interface DragSession {
  mode: DragMode
  pointerId: number
  index: number
  originPath: ArrowPathPoint[]
  originClientX: number
  originClientY: number
  originSvgX: number
  originSvgY: number
  svg: SVGSVGElement
  moved: boolean
}

function clonePath(path: ArrowPathPoint[]): ArrowPathPoint[] {
  return path.map((p) => ({ ...p }))
}

function EditableOrthogonalPathInner({
  path,
  sSide,
  eSide,
  anchors = [],
  shapeGuard = null,
  connectionId,
  isSelected,
  markerEndId,
  strokeWidth = 2,
  onSelect,
  onChange,
  onDeleteSelected,
}: EditableOrthogonalPathProps) {
  const [localPath, setLocalPath] = useState(path)
  const [localSides, setLocalSides] = useState<{ sSide: Side; eSide: Side }>({ sSide, eSide })
  const [activeAnchorId, setActiveAnchorId] = useState<string | null>(null)
  const [isPathInvalid, setIsPathInvalid] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const activeAnchorIdRef = useRef<string | null>(null)
  const lastValidPathRef = useRef<ArrowPathPoint[]>(path.map((p) => ({ ...p })))
  const dragSessionRef = useRef<DragSession | null>(null)
  const pendingPathRef = useRef<ArrowPathPoint[] | null>(null)
  const pathRafRef = useRef<number | null>(null)
  const invalidPreviewFrameRef = useRef<number | null>(null)
  const shapeGuardRef = useRef(shapeGuard)
  shapeGuardRef.current = shapeGuard
  const localSidesRef = useRef(localSides)
  localSidesRef.current = localSides

  useEffect(() => {
    if (dragSessionRef.current) return
    setLocalPath(path)
    lastValidPathRef.current = path.map((p) => ({ ...p }))
    setIsPathInvalid(false)
  }, [path])

  useEffect(() => {
    setLocalSides({ sSide, eSide })
  }, [eSide, sSide])

  useEffect(() => {
    if (!isSelected) {
      setActiveAnchorId(null)
      activeAnchorIdRef.current = null
    }
  }, [isSelected])

  useEffect(() => {
    return () => {
      if (pathRafRef.current !== null) cancelAnimationFrame(pathRafRef.current)
      if (invalidPreviewFrameRef.current !== null) cancelAnimationFrame(invalidPreviewFrameRef.current)
    }
  }, [])

  const updateInvalidPreview = useCallback((candidatePath: ArrowPathPoint[]) => {
    if (invalidPreviewFrameRef.current !== null) {
      cancelAnimationFrame(invalidPreviewFrameRef.current)
    }
    invalidPreviewFrameRef.current = requestAnimationFrame(() => {
      invalidPreviewFrameRef.current = null
      const guard = shapeGuardRef.current
      if (!guard) {
        setIsPathInvalid(false)
        return
      }
      const { kind, obstacles, fromShape, toShape, clearance } = guard.check
      if (kind === 'flowchart') {
        setIsPathInvalid(
          pathCrossesShapeBodies(candidatePath, fromShape, toShape, obstacles, clearance),
        )
        return
      }
      setIsPathInvalid(isPathBlockingShapes({ ...guard.check, path: candidatePath }))
    })
  }, [])

  const schedulePathUpdate = useCallback((nextPath: ArrowPathPoint[]) => {
    pendingPathRef.current = nextPath
    if (pathRafRef.current !== null) return
    pathRafRef.current = requestAnimationFrame(() => {
      pathRafRef.current = null
      const pending = pendingPathRef.current
      if (pending) setLocalPath(pending)
    })
  }, [])

  const alignEndpointSegment = useCallback(
    (nextPath: ArrowPathPoint[], index: number): ArrowPathPoint[] => {
      if (!isEndpointIndex(index, nextPath.length)) return nextPath
      const target = { ...nextPath[index]! }
      const neighbor = index === 0 ? nextPath[1] : nextPath[nextPath.length - 2]
      if (!neighbor) return nextPath
      if (target.x !== neighbor.x && target.y !== neighbor.y) {
        if (Math.abs(target.x - neighbor.x) <= Math.abs(target.y - neighbor.y)) {
          target.x = neighbor.x
        } else {
          target.y = neighbor.y
        }
      }
      const aligned = nextPath.map((point) => ({ ...point }))
      aligned[index] = target
      return aligned
    },
    [],
  )

  const emitChange = useCallback(
    (nextPath: ArrowPathPoint[], nextSides?: { sSide?: Side; eSide?: Side }) => {
      if (nextPath.length < 2) return
      const mergedSides = {
        sSide: nextSides?.sSide ?? localSidesRef.current.sSide,
        eSide: nextSides?.eSide ?? localSidesRef.current.eSide,
      }
      setLocalSides(mergedSides)
      onChange({
        sSide: mergedSides.sSide,
        eSide: mergedSides.eSide,
        startPoint: { ...nextPath[0]! },
        endPoint: { ...nextPath[nextPath.length - 1]! },
        bendPoints: nextPath.slice(1, -1).map((p) => ({ ...p })),
      })
    },
    [onChange],
  )

  const commitPath = useCallback(
    (rawPath: ArrowPathPoint[], nextSides?: { sSide?: Side; eSide?: Side }) => {
      const guard = shapeGuardRef.current
      const mergedSides = {
        sSide: nextSides?.sSide ?? localSidesRef.current.sSide,
        eSide: nextSides?.eSide ?? localSidesRef.current.eSide,
      }
      if (!guard) {
        setLocalPath(rawPath)
        lastValidPathRef.current = rawPath.map((p) => ({ ...p }))
        setIsPathInvalid(false)
        emitChange(rawPath, mergedSides)
        return rawPath
      }
      const repairInput = {
        ...guard.repair,
        startPoint: { ...rawPath[0]! },
        endPoint: { ...rawPath[rawPath.length - 1]! },
        sSide: mergedSides.sSide,
        eSide: mergedSides.eSide,
      }
      const finalized = finalizeManualOrthogonalPath(
        rawPath,
        { check: guard.check, repair: repairInput },
        lastValidPathRef.current,
      )
      const invalid = isPathBlockingShapes({ ...guard.check, path: finalized })
      setIsPathInvalid(invalid)
      if (invalid) {
        const revert = lastValidPathRef.current.map((p) => ({ ...p }))
        setLocalPath(revert)
        return revert
      }
      lastValidPathRef.current = finalized.map((p) => ({ ...p }))
      setLocalPath(finalized)
      setIsPathInvalid(false)
      emitChange(finalized, mergedSides)
      return finalized
    },
    [emitChange],
  )

  const applyDragDelta = useCallback(
    (session: DragSession, svgX: number, svgY: number): ArrowPathPoint[] => {
      const dx = svgX - session.originSvgX
      const dy = svgY - session.originSvgY
      if (session.mode === 'segment') {
        return dragSegmentFromOrigin(session.originPath, session.index, dx, dy, {
          normalize: false,
        })
      }
      let moved = dragWaypointFromOrigin(session.originPath, session.index, dx, dy, {
        normalize: false,
      })
      const pointKind =
        session.index === 0 ? 'start' : session.index === moved.length - 1 ? 'end' : null
      if (pointKind) {
        const endpoint = moved[session.index]
        if (endpoint) {
          const magneticSnap = resolveMagneticAnchorSnap({
            anchors,
            x: endpoint.x,
            y: endpoint.y,
            kind: pointKind,
            snapDistancePx: SNAP_DISTANCE_PX,
            releaseDistancePx: SNAP_RELEASE_DISTANCE_PX,
            hardSnapDistancePx: SNAP_HARD_DISTANCE_PX,
            lockedAnchorId: activeAnchorIdRef.current,
          })
          if (magneticSnap) {
            const snappedPath = moved.map((point) => ({ ...point }))
            snappedPath[session.index] = { x: magneticSnap.x, y: magneticSnap.y }
            activeAnchorIdRef.current = magneticSnap.anchor.id
            moved = alignEndpointSegment(snappedPath, session.index)
          } else {
            activeAnchorIdRef.current = null
            moved = alignEndpointSegment(moved, session.index)
          }
        }
      }
      return moved
    },
    [alignEndpointSegment, anchors],
  )

  const finishDragSession = useCallback(() => {
    const session = dragSessionRef.current
    dragSessionRef.current = null
    setIsDragging(false)
    if (!session?.moved) return
    if (pathRafRef.current !== null) {
      cancelAnimationFrame(pathRafRef.current)
      pathRafRef.current = null
    }
    const current = pendingPathRef.current ?? localPath
    pendingPathRef.current = null
    const kind =
      session.mode === 'waypoint' && session.index === 0
        ? 'start'
        : session.mode === 'waypoint' && session.index === current.length - 1
          ? 'end'
          : null
    const snappedAnchor = kind
      ? anchors.find((anchor) => anchor.id === activeAnchorIdRef.current && anchor.kind === kind)
      : null
    const sidePatch: { sSide?: Side; eSide?: Side } = {}
    if (snappedAnchor?.kind === 'start') sidePatch.sSide = snappedAnchor.side
    if (snappedAnchor?.kind === 'end') sidePatch.eSide = snappedAnchor.side
    const mergedSides = {
      sSide: sidePatch.sSide ?? localSidesRef.current.sSide,
      eSide: sidePatch.eSide ?? localSidesRef.current.eSide,
    }
    const sidesChanged =
      (sidePatch.sSide !== undefined && sidePatch.sSide !== localSidesRef.current.sSide) ||
      (sidePatch.eSide !== undefined && sidePatch.eSide !== localSidesRef.current.eSide)
    const guard = shapeGuardRef.current
    if (snappedAnchor && sidesChanged && guard && session.mode === 'waypoint') {
      const pathWithAnchors = current.map((p) => ({ ...p }))
      if (snappedAnchor.kind === 'start') {
        pathWithAnchors[0] = { x: snappedAnchor.x, y: snappedAnchor.y }
      } else {
        pathWithAnchors[pathWithAnchors.length - 1] = { x: snappedAnchor.x, y: snappedAnchor.y }
      }
      const rebuilt = rebuildPathForAnchorSides(
        {
          ...guard.repair,
          startPoint: { ...pathWithAnchors[0]! },
          endPoint: { ...pathWithAnchors[pathWithAnchors.length - 1]! },
          sSide: mergedSides.sSide,
          eSide: mergedSides.eSide,
        },
        { fallbackPath: lastValidPathRef.current },
      )
      if (rebuilt && rebuilt.length >= 2) {
        const committed = commitPath(rebuilt, mergedSides)
        setLocalPath(committed)
        setActiveAnchorId(activeAnchorIdRef.current)
        return
      }
    }
    const normalized =
      session.mode === 'waypoint'
        ? alignEndpointSegment(current, session.index)
        : current
    const committed = commitPath(normalized, sidePatch)
    setLocalPath(committed)
    setActiveAnchorId(activeAnchorIdRef.current)
  }, [alignEndpointSegment, anchors, commitPath, localPath])

  const handlePointerMove = useCallback(
    (ev: PointerEvent) => {
      const session = dragSessionRef.current
      if (!session || ev.pointerId !== session.pointerId) return
      const svgPoint = clientToSvgPoint(session.svg, ev.clientX, ev.clientY)
      if (!svgPoint) return
      if (!session.moved) {
        const dist = Math.hypot(
          ev.clientX - session.originClientX,
          ev.clientY - session.originClientY,
        )
        if (dist < DRAG_START_THRESHOLD_PX) return
        session.moved = true
      }
      const nextPath = applyDragDelta(session, svgPoint.x, svgPoint.y)
      schedulePathUpdate(nextPath)
      updateInvalidPreview(nextPath)
    },
    [applyDragDelta, schedulePathUpdate, updateInvalidPreview],
  )

  const handlePointerUp = useCallback(
    (ev: PointerEvent) => {
      const session = dragSessionRef.current
      if (!session || ev.pointerId !== session.pointerId) return
      try {
        session.svg.releasePointerCapture(ev.pointerId)
      } catch {
        /* ignore */
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      finishDragSession()
    },
    [finishDragSession, handlePointerMove],
  )

  const startDragSession = useCallback(
    (
      e: React.PointerEvent,
      mode: DragMode,
      index: number,
      originPath: ArrowPathPoint[],
    ) => {
      e.stopPropagation()
      e.preventDefault()
      onSelect(connectionId)
      const target = e.currentTarget as SVGElement
      const svg = target.ownerSVGElement
      if (!svg) return
      const svgPoint = clientToSvgPoint(svg, e.clientX, e.clientY)
      if (!svgPoint) return
      try {
        target.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      dragSessionRef.current = {
        mode,
        pointerId: e.pointerId,
        index,
        originPath: clonePath(originPath),
        originClientX: e.clientX,
        originClientY: e.clientY,
        originSvgX: svgPoint.x,
        originSvgY: svgPoint.y,
        svg,
        moved: false,
      }
      setIsDragging(true)
      setIsPathInvalid(false)
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
    },
    [connectionId, handlePointerMove, handlePointerUp, onSelect],
  )

  useEffect(() => {
    if (!isSelected) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDeleteSelected?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSelected, onDeleteSelected])

  const handlePathClick = (e: React.MouseEvent<SVGPathElement>) => {
    e.stopPropagation()
    onSelect(connectionId)
    if (e.detail < 2) return
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const local = clientToSvgPoint(svg, e.clientX, e.clientY)
    if (!local) return
    const segIdx = findNearestSegmentIndex(localPath, local.x, local.y)
    if (segIdx >= 0) {
      const inserted = insertWaypointAtSegmentMidpoint(localPath, segIdx)
      const committed = commitPath(inserted)
      setLocalPath(committed)
    }
  }

  const handlePathPointerDown = (e: React.PointerEvent<SVGPathElement>) => {
    if (e.button !== 0) return
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const local = clientToSvgPoint(svg, e.clientX, e.clientY)
    if (!local) return
    const segIdx = findNearestSegmentIndex(localPath, local.x, local.y)
    if (segIdx < 0) return
    startDragSession(e, 'segment', segIdx, localPath)
  }

  const handleHandlePointerDown = (index: number, e: React.PointerEvent<SVGCircleElement>) => {
    if (e.button !== 0) return
    startDragSession(e, 'waypoint', index, localPath)
  }

  const handleHandleContextMenu = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const removed = removeWaypoint(localPath, index)
    const committed = commitPath(removed)
    setLocalPath(committed)
  }

  const strokeColor = isSelected
    ? isPathInvalid
      ? '#ea580c'
      : '#2563eb'
    : 'black'

  return (
    <g className="print:hidden">
      <path
        d={pathToD(localPath)}
        fill="none"
        stroke="transparent"
        strokeWidth={isSelected ? strokeWidth + 12 : strokeWidth + 10}
        style={{
          pointerEvents: 'stroke',
          cursor: isSelected ? 'grab' : 'pointer',
          touchAction: 'none',
        }}
        onClick={handlePathClick}
        onPointerDown={isSelected ? handlePathPointerDown : undefined}
      />
      <path
        d={pathToD(localPath)}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? strokeWidth + 1 : strokeWidth}
        markerEnd={`url(#${markerEndId})`}
        style={{ pointerEvents: 'none' }}
      />
      {isSelected &&
        anchors.map((anchor) => {
          const isActive = anchor.id === activeAnchorId
          const isStart = anchor.kind === 'start'
          return (
            <circle
              key={`${connectionId}-anchor-${anchor.id}`}
              cx={anchor.x}
              cy={anchor.y}
              r={isActive ? 6 : 4}
              fill={isActive ? '#2563eb' : isStart ? '#bfdbfe' : '#dbeafe'}
              stroke={isActive ? '#1d4ed8' : '#60a5fa'}
              strokeWidth={isActive ? 2 : 1.5}
              opacity={0.8}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}
      {isSelected &&
        localPath.map((p, idx) => (
          <circle
            key={`${connectionId}-wp-${idx}`}
            cx={p.x}
            cy={p.y}
            r={idx === 0 || idx === localPath.length - 1 ? 5 : 6}
            fill={idx === 0 || idx === localPath.length - 1 ? '#1d4ed8' : '#ffffff'}
            stroke={isPathInvalid ? '#ea580c' : '#2563eb'}
            strokeWidth={2}
            style={{
              pointerEvents: 'all',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
            onPointerDown={(e) => handleHandlePointerDown(idx, e)}
            onContextMenu={(e) => handleHandleContextMenu(idx, e)}
          />
        ))}
    </g>
  )
}

export const EditableOrthogonalPath = memo(EditableOrthogonalPathInner)
