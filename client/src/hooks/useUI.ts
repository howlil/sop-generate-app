/**
 * Hook utilitas UI: toast dan state panel collapsible.
 * Satu file untuk hook kecil yang dipakai di banyak tempat.
 */
import { useCallback, useState } from 'react'
import { useAppStore, type ToastType } from '@/lib/stores/app-store'

/** Hook akses toast — satu titik akses untuk UI. */
export function useToast() {
  const toast = useAppStore((s) => s.toast)
  const clearToast = useAppStore((s) => s.clearToast)
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    useAppStore.getState().showToast(message, type)
  }, [])
  return { showToast, toast, clearToast }
}

/** State panel kiri/kanan collapsible (untuk layout dengan sidebar). */
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
