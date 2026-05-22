import { describe, expect, it } from 'vitest'
import { findNearestAnchor, resolveAnchorSnap, resolveMagneticAnchorSnap } from '../anchor-snap.util'

const anchors = [
  { id: 'start-top', x: 100, y: 80, side: 'top', kind: 'start' },
  { id: 'start-right', x: 140, y: 100, side: 'right', kind: 'start' },
  { id: 'end-left', x: 260, y: 100, side: 'left', kind: 'end' },
] as const

describe('anchor-snap.util', () => {
  it('should_find_nearest_anchor_by_kind', () => {
    const nearest = findNearestAnchor([...anchors], 132, 96, 'start')
    expect(nearest?.anchor.id).toBe('start-right')
  })

  it('should_snap_when_pointer_inside_threshold', () => {
    const snapped = resolveAnchorSnap({
      anchors: [...anchors],
      x: 136,
      y: 98,
      kind: 'start',
      snapDistancePx: 12,
      releaseDistancePx: 18,
      lockedAnchorId: null,
    })
    expect(snapped?.id).toBe('start-right')
  })

  it('should_keep_locked_anchor_until_release_threshold', () => {
    const keepLocked = resolveAnchorSnap({
      anchors: [...anchors],
      x: 152,
      y: 111,
      kind: 'start',
      snapDistancePx: 8,
      releaseDistancePx: 20,
      lockedAnchorId: 'start-right',
    })
    expect(keepLocked?.id).toBe('start-right')
  })

  it('should_return_magnetic_position_between_pointer_and_anchor', () => {
    const snapped = resolveMagneticAnchorSnap({
      anchors: [...anchors],
      x: 128,
      y: 100,
      kind: 'start',
      snapDistancePx: 16,
      releaseDistancePx: 24,
      hardSnapDistancePx: 5,
      lockedAnchorId: null,
    })
    expect(snapped?.anchor.id).toBe('start-right')
    expect(snapped?.hardSnapped).toBe(false)
    expect(snapped?.ratio).toBeGreaterThan(0)
    expect(snapped?.ratio).toBeLessThan(1)
    expect(snapped?.x).toBeGreaterThan(128)
    expect(snapped?.x).toBeLessThan(140)
    expect(snapped?.y).toBe(100)
  })

  it('should_hard_snap_when_inside_hard_snap_threshold', () => {
    const snapped = resolveMagneticAnchorSnap({
      anchors: [...anchors],
      x: 137,
      y: 100,
      kind: 'start',
      snapDistancePx: 16,
      releaseDistancePx: 24,
      hardSnapDistancePx: 5,
      lockedAnchorId: null,
    })
    expect(snapped?.anchor.id).toBe('start-right')
    expect(snapped?.hardSnapped).toBe(true)
    expect(snapped?.x).toBe(140)
    expect(snapped?.y).toBe(100)
  })

  it('should_keep_locked_anchor_magnetic_until_release_threshold', () => {
    const snapped = resolveMagneticAnchorSnap({
      anchors: [...anchors],
      x: 156,
      y: 100,
      kind: 'start',
      snapDistancePx: 8,
      releaseDistancePx: 20,
      hardSnapDistancePx: 4,
      lockedAnchorId: 'start-right',
    })
    expect(snapped?.anchor.id).toBe('start-right')
    expect(snapped?.x).toBeLessThan(156)
  })

  it('should_return_null_outside_snap_radius_when_unlocked', () => {
    const snapped = resolveMagneticAnchorSnap({
      anchors: [...anchors],
      x: 180,
      y: 100,
      kind: 'start',
      snapDistancePx: 16,
      releaseDistancePx: 24,
      hardSnapDistancePx: 5,
      lockedAnchorId: null,
    })
    expect(snapped).toBeNull()
  })
})
