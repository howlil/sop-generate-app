/**
 * Flowchart route candidate selection.
 * Centralizes side-pair preference plus draw.io-style port and jetty hints.
 */

import type { PortConstraint } from './orthogonalRouter'
import { isYaLabel, isTidakLabel } from '../sopDiagramTypes'

export type Side = 'top' | 'bottom' | 'left' | 'right'

export interface FlowchartConnectionForSidePairs {
  id: string
  from: string
  to: string
  label?: string | null
  sourceType?: string
  targetType?: string
}

export interface ElemPos {
  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number
}

export type UsedSides = Record<
  string,
  {
    in?: Partial<Record<Side, string[]>>
    out?: Partial<Record<Side, string[]>>
  }
>

export interface FlowchartRouteCandidate {
  sSide: Side
  eSide: Side
  sourcePort?: PortConstraint
  targetPort?: PortConstraint
  jettySize?: number
  sourceJettySize?: number
  targetJettySize?: number
  preferSimple?: boolean
}

const DEFAULT_JETTY = 16
const LOOPBACK_JETTY = 22
const OPC_JETTY = 18

function sideToPortConstraint(side: Side): NonNullable<PortConstraint['portConstraint']> {
  switch (side) {
    case 'top':
      return 'north'
    case 'bottom':
      return 'south'
    case 'left':
      return 'west'
    case 'right':
      return 'east'
  }
}

function makeSourcePort(side: Side): PortConstraint {
  return { portConstraint: sideToPortConstraint(side) }
}

function makeTargetPort(side: Side): PortConstraint {
  return { portConstraint: sideToPortConstraint(side) }
}

function makeCandidate(
  sSide: Side,
  eSide: Side,
  overrides: Partial<FlowchartRouteCandidate> = {},
): FlowchartRouteCandidate {
  return {
    sSide,
    eSide,
    sourcePort: makeSourcePort(sSide),
    targetPort: makeTargetPort(eSide),
    jettySize: DEFAULT_JETTY,
    preferSimple: true,
    ...overrides,
  }
}

/**
 * Select preferred route candidates for flowchart connectors.
 * Candidates retain the legacy side ordering but also carry port/jetty hints.
 * Geometry must already be plausible as an orthogonal route on its own;
 * caller-side normalization may clean legacy diagonals, but candidate ranking
 * must not depend on a later "snap to orthogonal" rescue step.
 */
export function selectSidePairs(
  conn: FlowchartConnectionForSidePairs,
  from: ElemPos,
  to: ElemPos,
  usedSides: UsedSides,
  reservedSides: Map<string, Set<string>> | undefined,
  toId: string,
  connectionId: string,
): FlowchartRouteCandidate[] {
  const dx = (to.left + to.width / 2) - (from.left + from.width / 2)
  const dy = (to.top + to.height / 2) - (from.top + from.height / 2)

  const colThreshold = Math.max(from.width, to.width) * 0.5
  const sameCol = Math.abs(dx) < colThreshold
  const destRight = !sameCol && dx > 0
  const destLeft = !sameCol && dx < 0
  const destBelow = dy > 10
  const destAbove = dy < -10
  const isSameColumnLoopBack = destAbove && sameCol

  const isStartTerminator = conn.sourceType === 'flowchart-terminator'
  const isDecSrc = conn.sourceType === 'flowchart-decision'
  const isYa = isYaLabel(conn.label)
  const isTidak = isTidakLabel(conn.label)

  const srcOutBusy = (s: Side) =>
    (usedSides[conn.from]?.out?.[s] ?? []).some((id) => id !== conn.id)
  const dstInBusy = (s: Side) =>
    (usedSides[conn.to]?.in?.[s] ?? []).some((id) => id !== conn.id)

  const candidates: FlowchartRouteCandidate[] = []

  const push = (sSide: Side, eSide: Side, overrides: Partial<FlowchartRouteCandidate> = {}) => {
    candidates.push(makeCandidate(sSide, eSide, overrides))
  }

  const isToOpc = conn.targetType === 'flowchart-opc'
  const isFromOpc = conn.sourceType === 'flowchart-opc'
  if (isToOpc) {
    if (!srcOutBusy('bottom')) push('bottom', 'top', { jettySize: OPC_JETTY })
    if (destRight) {
      if (!srcOutBusy('right')) push('right', 'top', { jettySize: OPC_JETTY, preferSimple: false })
    } else if (destLeft) {
      if (!srcOutBusy('left')) push('left', 'top', { jettySize: OPC_JETTY, preferSimple: false })
    } else {
      push('right', 'top', { jettySize: OPC_JETTY, preferSimple: false })
      push('left', 'top', { jettySize: OPC_JETTY, preferSimple: false })
    }
  }
  if (isFromOpc) {
    if (!dstInBusy('top')) push('bottom', 'top', { jettySize: OPC_JETTY })
    if (destRight) {
      push('bottom', 'right', { jettySize: OPC_JETTY, preferSimple: false })
      push('bottom', 'left', { jettySize: OPC_JETTY, preferSimple: false })
    } else if (destLeft) {
      push('bottom', 'left', { jettySize: OPC_JETTY, preferSimple: false })
      push('bottom', 'right', { jettySize: OPC_JETTY, preferSimple: false })
    } else {
      push('bottom', 'left', { jettySize: OPC_JETTY, preferSimple: false })
      push('bottom', 'right', { jettySize: OPC_JETTY, preferSimple: false })
    }
  }
  if (isToOpc || isFromOpc) {
    push('right', 'top', { jettySize: OPC_JETTY, preferSimple: false })
    push('left', 'top', { jettySize: OPC_JETTY, preferSimple: false })
    push('bottom', 'left', { jettySize: OPC_JETTY, preferSimple: false })
    push('bottom', 'right', { jettySize: OPC_JETTY, preferSimple: false })
  }

  if (isStartTerminator && destBelow) {
    if (destRight) {
      push('bottom', 'top')
      if (!srcOutBusy('right')) push('right', 'top', { preferSimple: false })
    } else if (destLeft) {
      push('bottom', 'top')
      if (!srcOutBusy('left')) push('left', 'top', { preferSimple: false })
    } else {
      push('bottom', 'top')
    }
  }

  if (sameCol && destBelow && !isSameColumnLoopBack) {
    push('bottom', 'top', {
      preferSimple: true,
      sourcePort: { ...makeSourcePort('bottom'), exitX: 0.5 },
      targetPort: { ...makeTargetPort('top'), entryX: 0.5 },
    })
    if (srcOutBusy('bottom') || dstInBusy('top')) {
      if (!srcOutBusy('right')) push('right', 'top', { preferSimple: false })
      if (!srcOutBusy('left')) push('left', 'top', { preferSimple: false })
    }
  }

  if (isDecSrc && isYa) {
    if (destBelow) {
      if (sameCol) {
        push('bottom', 'top', {
          sourcePort: { ...makeSourcePort('bottom'), exitX: 0.5 },
          targetPort: { ...makeTargetPort('top'), entryX: 0.5 },
        })
      } else if (destLeft) {
        push('bottom', 'right', { preferSimple: false })
        push('left', 'top', { preferSimple: false })
      } else if (destRight) {
        push('bottom', 'left', { preferSimple: false })
        push('right', 'top', { preferSimple: false })
      } else {
        push('bottom', 'top')
      }
    } else if (destAbove) {
      if (destLeft) {
        push('top', 'right', { preferSimple: false })
        push('left', 'bottom', { preferSimple: false })
      } else if (destRight) {
        push('top', 'left', { preferSimple: false })
        push('right', 'bottom', { preferSimple: false })
      } else {
        push('top', 'bottom', { preferSimple: false })
      }
    }
  } else if (isDecSrc && isTidak) {
    const isTargetDecision = conn.targetType === 'flowchart-decision'
    if (destAbove) {
      const loopOpts = { jettySize: LOOPBACK_JETTY, preferSimple: false }
      if (destLeft) {
        if (!srcOutBusy('left') && !dstInBusy('left')) push('left', 'left', loopOpts)
        if (!srcOutBusy('right') && !dstInBusy('right')) push('right', 'right', loopOpts)
      } else if (destRight) {
        if (!srcOutBusy('right') && !dstInBusy('right')) push('right', 'right', loopOpts)
        if (!srcOutBusy('left') && !dstInBusy('left')) push('left', 'left', loopOpts)
      } else {
        if (!srcOutBusy('left') && !dstInBusy('left')) push('left', 'left', loopOpts)
        if (!srcOutBusy('right') && !dstInBusy('right')) push('right', 'right', loopOpts)
      }
    } else if (destBelow && isTargetDecision) {
      if (!srcOutBusy('right') && !dstInBusy('right')) push('right', 'right', { preferSimple: false })
      if (!srcOutBusy('right') && !dstInBusy('left')) push('right', 'left', { preferSimple: false })
      if (!srcOutBusy('left') && !dstInBusy('right')) push('left', 'right', { preferSimple: false })
      if (!srcOutBusy('left') && !dstInBusy('left')) push('left', 'left', { preferSimple: false })
    } else if (sameCol && destBelow) {
      push('bottom', 'top', {
        preferSimple: true,
        sourcePort: { ...makeSourcePort('bottom'), exitX: 0.5 },
        targetPort: { ...makeTargetPort('top'), entryX: 0.5 },
      })
      if (!srcOutBusy('right')) push('right', 'top', { preferSimple: false })
      if (!srcOutBusy('left')) push('left', 'top', { preferSimple: false })
    } else if (destRight) {
      push('right', 'top', { preferSimple: false })
      push('bottom', 'left', { preferSimple: false })
    } else if (destLeft) {
      push('left', 'top', { preferSimple: false })
      push('bottom', 'right', { preferSimple: false })
    } else {
      push('right', 'top', { preferSimple: false })
      push('left', 'top', { preferSimple: false })
    }
  } else if (destAbove) {
    if (sameCol) {
      if (!srcOutBusy('right') && !dstInBusy('right')) {
        push('right', 'right', { jettySize: LOOPBACK_JETTY, preferSimple: false })
      }
      if (!srcOutBusy('left') && !dstInBusy('left')) {
        push('left', 'left', { jettySize: LOOPBACK_JETTY, preferSimple: false })
      }
      push('top', 'bottom', { preferSimple: false })
    } else if (destRight) {
      push('right', 'bottom', { preferSimple: false })
      push('top', 'right', { preferSimple: false })
    } else {
      push('left', 'bottom', { preferSimple: false })
      push('top', 'left', { preferSimple: false })
    }
  } else if (sameCol) {
    if (destBelow) push('bottom', 'top')
    else push('top', 'bottom')
  } else if (destRight) {
    if (srcOutBusy('bottom') || dstInBusy('left')) {
      push('right', 'top')
      push('bottom', 'left')
    } else {
      push('bottom', 'left')
      push('right', 'top')
    }
  } else if (destLeft) {
    if (srcOutBusy('bottom') || dstInBusy('right')) {
      push('left', 'top')
      push('bottom', 'right')
    } else {
      push('bottom', 'right')
      push('left', 'top')
    }
  }

  push('bottom', 'top')
  push('top', 'bottom')
  push('right', 'left')
  push('left', 'right')
  push('bottom', 'left')
  push('bottom', 'right')
  push('right', 'top')
  push('left', 'top')

  const seen = new Set<string>()
  let deduped = candidates.filter((candidate) => {
    const k = `${candidate.sSide}-${candidate.eSide}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  if (isDecSrc && isSameColumnLoopBack) {
    deduped = deduped.filter(
      ({ sSide, eSide }) => !(sSide === 'top' && eSide === 'bottom') && !(sSide === 'bottom' && eSide === 'top'),
    )
  }

  if (!reservedSides || reservedSides.size === 0) return deduped

  const baseId = connectionId.replace(/__in$/, '')
  const preferred: FlowchartRouteCandidate[] = []
  const reservedForOthers: FlowchartRouteCandidate[] = []
  for (const candidate of deduped) {
    const ownerSet = reservedSides.get(`${toId}-${candidate.eSide}`)
    const isOwner = ownerSet && (ownerSet.has(connectionId) || ownerSet.has(baseId))
    if (ownerSet && !isOwner) reservedForOthers.push(candidate)
    else preferred.push(candidate)
  }
  return [...preferred, ...reservedForOthers]
}
