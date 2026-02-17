import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded border text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-700 border-0',
        secondary: 'bg-gray-100 text-gray-700 border-0',
        outline: 'border-gray-200 bg-transparent text-gray-700',
        success: 'bg-green-100 text-green-700 border-0',
        warning: 'bg-orange-100 text-orange-700 border-0',
        destructive: 'bg-red-100 text-red-700 border-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn('h-4 px-1.5 py-0 flex items-center', badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
