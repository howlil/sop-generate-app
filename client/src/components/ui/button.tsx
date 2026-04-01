import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]',
        destructive: 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
        outline: 'border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.98]',
        ghost: 'hover:bg-gray-100 active:scale-[0.98]',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-4 gap-2',
        sm: 'h-9 px-3 gap-1.5',
        lg: 'h-12 px-5 gap-2.5',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(props as unknown as React.ComponentPropsWithRef<typeof motion.button>)}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
