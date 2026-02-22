import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/utils/cn'

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Tampilkan asterisk (*) setelah teks untuk field wajib */
  required?: boolean
  /** default = primary (gray-700), muted = secondary (gray-500) */
  variant?: 'default' | 'muted'
}

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, required, variant = 'default', children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-xs font-medium leading-none block',
      variant === 'muted' ? 'text-gray-500 mb-1' : 'text-gray-700 mb-1',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500/80"> *</span>}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
