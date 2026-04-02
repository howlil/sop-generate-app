/**
 * Side-pair selection for arrow connectors.
 * Implements the arrow connector algorithm for flowchart routing.
 */

import { isYaLabel, isTidakLabel } from './sopDiagramTypes'

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

/**
 * Select preferred [tail-side, head-side] pairs for arrow routing.
 * Used by FlowchartArrowConnector.
 */
export function selectSidePairs(
  conn: FlowchartConnectionForSidePairs,
  from: ElemPos,
  to: ElemPos,
  usedSides: UsedSides,
  reservedSides: Map<string, Set<string>> | undefined,
  toId: string,
  connectionId: string,
): Array<[Side, Side]> {
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

  const pairs: Array<[Side, Side]> = []

  /* ── Off-page connector ──────────────────────────────────── */
  const isToOpc = conn.targetType === 'flowchart-opc'
  const isFromOpc = conn.sourceType === 'flowchart-opc'
  if (isToOpc) {
    if (!srcOutBusy('bottom')) pairs.push(['bottom', 'top'])
    if (destRight) {
      if (!srcOutBusy('right')) pairs.push(['right', 'top'])
    } else if (destLeft) {
      if (!srcOutBusy('left')) pairs.push(['left', 'top'])
    } else {
      pairs.push(['right', 'top'], ['left', 'top'])
    }
  }
  if (isFromOpc) {
    if (!dstInBusy('top')) pairs.push(['bottom', 'top'])
    if (destRight) {
      pairs.push(['bottom', 'right'], ['bottom', 'left'])
    } else if (destLeft) {
      pairs.push(['bottom', 'left'], ['bottom', 'right'])
    } else {
      pairs.push(['bottom', 'left'], ['bottom', 'right'])
    }
  }
  if (isToOpc || isFromOpc) {
    pairs.push(['right', 'top'], ['left', 'top'], ['bottom', 'left'], ['bottom', 'right'])
  }

  /* ── Case 0: Start (terminator) → next task ───────────────── */
  if (isStartTerminator && destBelow) {
    if (destRight) {
      if (!srcOutBusy('right')) pairs.push(['right', 'top'])
      pairs.push(['bottom', 'top'])
    } else if (destLeft) {
      if (!srcOutBusy('left')) pairs.push(['left', 'top'])
      pairs.push(['bottom', 'top'])
    } else {
      pairs.push(['bottom', 'top'])
    }
  }

  /* ── Case 3: Decision source with branching ───────────────── */
  if (isDecSrc && (isYa || isTidak)) {
    if (destAbove) {
      if (!srcOutBusy('right') && !dstInBusy('right')) pairs.push(['right', 'right'])
      if (!srcOutBusy('left') && !dstInBusy('left')) pairs.push(['left', 'left'])
      pairs.push(['right', 'top'], ['left', 'top'])
    } else if (isYa) {
      if (sameCol && destBelow) {
        pairs.push(['bottom', 'top'])
      } else if (destRight) {
        pairs.push(['bottom', 'left'], ['right', 'top'])
      } else if (destLeft) {
        pairs.push(['bottom', 'right'], ['left', 'top'])
      } else {
        pairs.push(['bottom', 'top'])
      }
    } else if (isTidak) {
      if (sameCol && destBelow) {
        if (!srcOutBusy('right')) pairs.push(['right', 'top'])
        if (!srcOutBusy('left')) pairs.push(['left', 'top'])
        pairs.push(['right', 'top'], ['left', 'top'])
      } else if (destRight) {
        pairs.push(['right', 'top'], ['bottom', 'left'])
      } else if (destLeft) {
        pairs.push(['left', 'top'], ['bottom', 'right'])
      } else {
        pairs.push(['right', 'top'], ['left', 'top'])
      }
    }
  }

  /* ── Non-decision loop-back ───────────────────────────────── */
  else if (destAbove) {
    if (sameCol) {
      if (!srcOutBusy('right') && !dstInBusy('right')) pairs.push(['right', 'right'])
      if (!srcOutBusy('left') && !dstInBusy('left')) pairs.push(['left', 'left'])
      pairs.push(['top', 'bottom'])
    } else if (destRight) {
      pairs.push(['right', 'bottom'], ['top', 'right'])
    } else {
      pairs.push(['left', 'bottom'], ['top', 'left'])
    }
  }

  /* ── Case 1: Same column ─────────────────────────────────── */
  else if (sameCol) {
    if (destBelow) pairs.push(['bottom', 'top'])
    else pairs.push(['top', 'bottom'])
  }

  /* ── Case 2: Different columns ────────────────────────────── */
  else if (destRight) {
    if (srcOutBusy('bottom') || dstInBusy('left'))
      pairs.push(['right', 'top'], ['bottom', 'left'])
    else pairs.push(['bottom', 'left'], ['right', 'top'])
  } else if (destLeft) {
    if (srcOutBusy('bottom') || dstInBusy('right'))
      pairs.push(['left', 'top'], ['bottom', 'right'])
    else pairs.push(['bottom', 'right'], ['left', 'top'])
  }

  /* ── General fallbacks ────────────────────────────────────── */
  pairs.push(
    ['bottom', 'top'],
    ['top', 'bottom'],
    ['right', 'left'],
    ['left', 'right'],
    ['bottom', 'left'],
    ['bottom', 'right'],
    ['right', 'top'],
    ['left', 'top'],
  )

  const seen = new Set<string>()
  let deduped = pairs.filter(([s, e]) => {
    const k = `${s}-${e}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  if (isDecSrc && isSameColumnLoopBack) {
    deduped = deduped.filter(
      ([s, e]) => !(s === 'top' && e === 'bottom') && !(s === 'bottom' && e === 'top'),
    )
  }

  if (!reservedSides || reservedSides.size === 0) return deduped

  const baseId = connectionId.replace(/__in$/, '')
  const preferred: Array<[Side, Side]> = []
  const reservedForOthers: Array<[Side, Side]> = []
  for (const pair of deduped) {
    const [, endSide] = pair
    const ownerSet = reservedSides.get(`${toId}-${endSide}`)
    const isOwner = ownerSet && (ownerSet.has(connectionId) || ownerSet.has(baseId))
    if (ownerSet && !isOwner) reservedForOthers.push(pair)
    else preferred.push(pair)
  }
  return [...preferred, ...reservedForOthers]
}
