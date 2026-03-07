import { useEffect } from 'react'
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

  if (!toast.message) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Toast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} />
    </div>
  )
}
