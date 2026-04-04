/**
 * UI store - Zustand
 * Store untuk UI state global (toast, sidebar, modals)
 */

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  message: string
  type: ToastType
  id: string
}

interface UIState {
  toasts: Toast[]
  sidebarOpen: boolean
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  sidebarOpen: true,

  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { message, type, id }] }))

    // Auto-dismiss after 5 seconds (increased for accessibility)
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 5000)
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

// Convenience function for use outside components
export const showToast = (message: string, type: ToastType = 'info') => {
  useUIStore.getState().addToast(message, type)
}

