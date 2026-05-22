export type DiagramAnchorSide = 'top' | 'right' | 'bottom' | 'left'
export type DiagramAnchorKind = 'start' | 'end'

export interface DiagramPathAnchor {
  id: string
  x: number
  y: number
  side: DiagramAnchorSide
  kind: DiagramAnchorKind
}

export interface ResolveAnchorSnapOptions {
  anchors: DiagramPathAnchor[]
  x: number
  y: number
  kind: DiagramAnchorKind
  snapDistancePx: number
  releaseDistancePx: number
  lockedAnchorId?: string | null
}

export interface ResolveMagneticAnchorSnapOptions extends ResolveAnchorSnapOptions {
  hardSnapDistancePx: number
}

export interface MagneticAnchorSnapResult {
  anchor: DiagramPathAnchor
  distance: number
  ratio: number
  x: number
  y: number
  hardSnapped: boolean
}

export function isEndpointIndex(index: number, pathLength: number): boolean {
  return index === 0 || index === pathLength - 1
}

export function findNearestAnchor(
  anchors: DiagramPathAnchor[],
  x: number,
  y: number,
  kind: DiagramAnchorKind,
): { anchor: DiagramPathAnchor; distance: number } | null {
  let nearest: DiagramPathAnchor | null = null
  let nearestDistance = Infinity
  for (const anchor of anchors) {
    if (anchor.kind !== kind) continue
    const distance = Math.hypot(anchor.x - x, anchor.y - y)
    if (distance < nearestDistance) {
      nearest = anchor
      nearestDistance = distance
    }
  }
  if (!nearest) return null
  return { anchor: nearest, distance: nearestDistance }
}

export function resolveAnchorSnap(
  options: ResolveAnchorSnapOptions,
): DiagramPathAnchor | null {
  const {
    anchors,
    x,
    y,
    kind,
    snapDistancePx,
    releaseDistancePx,
    lockedAnchorId,
  } = options
  const nearest = findNearestAnchor(anchors, x, y, kind)
  if (!nearest) return null
  if (lockedAnchorId) {
    const locked = anchors.find((anchor) => anchor.id === lockedAnchorId && anchor.kind === kind)
    if (!locked) return null
    const lockedDistance = Math.hypot(locked.x - x, locked.y - y)
    if (lockedDistance <= releaseDistancePx) {
      return locked
    }
    return nearest.distance <= snapDistancePx ? nearest.anchor : null
  }
  return nearest.distance <= snapDistancePx ? nearest.anchor : null
}

function smoothstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t))
  return clamped * clamped * (3 - 2 * clamped)
}

function interpolate(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio
}

export function resolveMagneticAnchorSnap(
  options: ResolveMagneticAnchorSnapOptions,
): MagneticAnchorSnapResult | null {
  const {
    anchors,
    x,
    y,
    kind,
    snapDistancePx,
    releaseDistancePx,
    hardSnapDistancePx,
    lockedAnchorId,
  } = options
  const nearest = findNearestAnchor(anchors, x, y, kind)
  if (!nearest) return null

  let target = nearest.anchor
  let distance = nearest.distance
  let activeSnapDistance = snapDistancePx

  if (lockedAnchorId) {
    const locked = anchors.find((anchor) => anchor.id === lockedAnchorId && anchor.kind === kind)
    if (locked) {
      const lockedDistance = Math.hypot(locked.x - x, locked.y - y)
      if (lockedDistance <= releaseDistancePx) {
        target = locked
        distance = lockedDistance
        activeSnapDistance = releaseDistancePx
      } else if (nearest.distance > snapDistancePx) {
        return null
      }
    } else if (nearest.distance > snapDistancePx) {
      return null
    }
  } else if (nearest.distance > snapDistancePx) {
    return null
  }

  if (distance <= hardSnapDistancePx) {
    return {
      anchor: target,
      distance,
      ratio: 1,
      x: target.x,
      y: target.y,
      hardSnapped: true,
    }
  }

  const magneticRange = Math.max(1, activeSnapDistance - hardSnapDistancePx)
  const ratio = smoothstep((activeSnapDistance - distance) / magneticRange)
  return {
    anchor: target,
    distance,
    ratio,
    x: interpolate(x, target.x, ratio),
    y: interpolate(y, target.y, ratio),
    hardSnapped: false,
  }
}
