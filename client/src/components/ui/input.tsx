import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display and link via aria-describedby */
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, errorMessage, ...props }, ref) => {
    const errorId = errorMessage ? `input-error-${React.useId()}` : undefined

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          errorMessage && 'ring-2 ring-red-500 border-red-500',
          className
        )}
        ref={ref}
        aria-invalid={!!errorMessage}
        aria-describedby={errorId}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
