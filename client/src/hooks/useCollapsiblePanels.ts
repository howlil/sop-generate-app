/**
 * Shared hook for left/right collapsible panel state.
 */
import { useState } from 'react'

export function useCollapsiblePanels(initialLeft = false, initialRight = false) {
  const [leftCollapsed, setLeftCollapsed] = useState(initialLeft)
  const [rightCollapsed, setRightCollapsed] = useState(initialRight)

  return {
    leftCollapsed,
    setLeftCollapsed,
    rightCollapsed,
    setRightCollapsed,
  }
}
