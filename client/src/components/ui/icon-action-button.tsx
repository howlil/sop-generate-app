import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface IconActionButtonProps {
  icon: LucideIcon
  title: string
  /** Jika diisi, render sebagai Link. */
  to?: string
  /** Params untuk Link (mis. { id: sop.id }). */
  params?: Record<string, string>
  /** State untuk Link (mis. data untuk halaman detail). */
  state?: Record<string, unknown>
  onClick?: () => void
  disabled?: boolean
  /** Tombol hapus (warna merah). */
  destructive?: boolean
  /** Tampilan: ghost (default) atau outline. */
  variant?: 'ghost' | 'outline'
  className?: string
  /** Ukuran icon (default 3.5). */
  iconSize?: 'sm' | 'md'
}

export function IconActionButton({
  icon: Icon,
  title,
  to,
  params,
  state,
  onClick,
  disabled,
  destructive,
  variant = 'ghost',
  className,
  iconSize = 'md',
}: IconActionButtonProps) {
  const iconEl = <Icon className={cn(iconSize === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
  const btn = (
    <Button
      type="button"
      variant={variant}
      size="icon-sm"
      className={cn(
        'h-7 w-7 p-0',
        destructive && 'text-red-600 hover:bg-red-50 hover:text-red-700',
        className
      )}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {iconEl}
    </Button>
  )
  if (to) return <Link to={to} params={params} state={state}>{btn}</Link>
  return btn
}
