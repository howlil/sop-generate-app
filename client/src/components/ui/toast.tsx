import { cn } from '@/utils/cn'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  className?: string
}

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function Toast({ message, type = 'success', className }: ToastProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-2 text-xs flex items-center gap-2',
        typeClasses[type],
        className
      )}
    >
      {message}
    </div>
  )
}

