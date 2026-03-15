import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toast } from '@/components/ui/toast'
import { useToast } from '@/hooks/useUI'

const AUTO_CLOSE_MS = 4000

export function GlobalToast() {
  const { toast, clearToast } = useToast()

  useEffect(() => {
    if (!toast.message) return
    const t = setTimeout(clearToast, AUTO_CLOSE_MS)
    return () => clearTimeout(t)
  }, [toast.message, clearToast])

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <Toast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
