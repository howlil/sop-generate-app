import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface IconActionButtonProps {
  icon: LucideIcon
  title: string
  to?: string
  params?: Record<string, string>
  search?: Record<string, string>
  state?: Record<string, unknown>
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  variant?: 'ghost' | 'outline'
  className?: string
}

export function IconActionButton({
  icon: Icon,
  title,
  to,
  params,
  search,
  state,
  onClick,
  disabled,
  destructive,
  variant = 'ghost',
  className,
}: IconActionButtonProps) {
  const btn = (
    <Button
      type="button"
      variant={variant}
      size="icon-sm"
      className={cn(
        destructive && 'text-red-600 hover:bg-red-50 hover:text-red-700',
        className
      )}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="w-3.5 h-3.5" />
    </Button>
  )

  if (to) {
    return <Link to={to} params={params} search={search} state={state}>{btn}</Link>
  }
  return btn
}
