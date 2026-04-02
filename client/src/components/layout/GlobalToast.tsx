import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toast } from '@/components/ui/toast'
import { useUIStore } from '@/stores/uiStore'

const AUTO_CLOSE_MS = 5000

/**
 * GlobalToast component with optimized Zustand subscription.
 * Only subscribes to first toast to prevent unnecessary re-renders.
 */
export function GlobalToast() {
  // Optimized: Subscribe to first toast only, not entire array
  const firstToast = useUIStore((state) => state.toasts[0])
  const removeToast = useUIStore((state) => state.removeToast)

  useEffect(() => {
    if (!firstToast) return
    const t = setTimeout(() => removeToast(firstToast.id), AUTO_CLOSE_MS)
    return () => clearTimeout(t)
  }, [firstToast?.id, removeToast])

  if (!firstToast) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
          className="pointer-events-auto"
        >
          <Toast
            message={firstToast.message}
            type={firstToast.type === 'error' ? 'error' : 'success'}
            role={firstToast.type === 'error' ? 'alert' : 'status'}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
