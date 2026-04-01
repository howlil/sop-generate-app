/**
 * Hook utilitas UI: toast dan state panel collapsible.
 * Wrapper untuk UI store yang baru
 */

import { useCallback, useState } from 'react'
import { useUIStore, showToast as showAppToast } from '@/stores/uiStore'
import type { ToastType } from '@/stores/uiStore'

/** Hook akses toast — satu titik akses untuk UI. */
export function useToast() {
  const { toasts, addToast, removeToast } = useUIStore()
  
  const toast = toasts[0] || { message: null, type: 'success' as ToastType, id: '' }
  
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    addToast(message, type)
  }, [addToast])
  
  const clearToast = useCallback(() => {
    if (toasts.length > 0) {
      removeToast(toasts[0].id)
    }
  }, [toasts, removeToast])

  return { 
    showToast, 
    toast: { message: toast.message, type: toast.type },
    clearToast 
  }
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

/** Export showToast untuk direct use */
export { showAppToast as showToast } from '@/stores/uiStore'
