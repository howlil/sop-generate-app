/**
 * UI utilities and hooks
 * Source of truth for UI state management
 */

import { useState, useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'
import type { ToastType } from '@/stores/uiStore'

/**
 * Hook untuk toast - wrapper untuk useUIStore
 * Returns showToast function dan toast state
 */
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
    clearToast,
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
