'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/stores/app-store'
import { Toast } from '@/components/ui/toast'

const AUTO_CLOSE_MS = 4000

export function GlobalToast() {
  const toast = useAppStore((s) => s.toast)
  const clearToast = useAppStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast.message) return
    const t = setTimeout(clearToast, AUTO_CLOSE_MS)
    return () => clearTimeout(t)
  }, [toast.message, clearToast])

  if (!toast.message) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Toast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} />
    </div>
  )
}
