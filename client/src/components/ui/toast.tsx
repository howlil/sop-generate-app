import { cn } from '@/utils/cn'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  className?: string
  /** Role for aria-live region. Use 'status' for polite, 'alert' for assertive */
  role?: 'status' | 'alert'
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function Toast({ message, type = 'success', className, role = 'status' }: ToastProps) {
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'rounded-md border px-4 py-2 text-sm flex items-start gap-2 max-w-sm w-full',
        typeClasses[type],
        className
      )}
    >
      <span className="flex-1 break-words whitespace-pre-wrap">{message}</span>
    </div>
  )
}

