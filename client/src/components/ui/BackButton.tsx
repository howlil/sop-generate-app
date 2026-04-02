import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export interface BackButtonProps {
  /** Jika pakai Link, isi `to`. Jika pakai onClick, kosongkan. */
  to?: string
  /** Handler saat diklik (jika tidak pakai Link). */
  onClick?: () => void
  /** Label teks; jika tidak diisi, hanya icon (untuk header leading). */
  children?: React.ReactNode
  /** Ukuran: 'sm' dengan label, 'icon' hanya icon. */
  size?: 'sm' | 'icon'
  className?: string
}

const defaultLabel = 'Kembali'

export function BackButton({ to, onClick, children, size, className }: BackButtonProps) {
  const label = children ?? defaultLabel
  const iconOnly = size === 'icon' || children === undefined
  const content = (
    <>
      <ArrowLeft className={cn(iconOnly ? 'w-4 h-4' : 'w-3.5 h-3.5 mr-1')} />
      {!iconOnly && label}
    </>
  )

  const button = (
    <Button
      type="button"
      variant={iconOnly ? 'ghost' : 'outline'}
      size={iconOnly ? 'icon' : 'sm'}
      className={cn(iconOnly && 'h-8 w-8', className)}
      onClick={onClick}
      title={iconOnly ? (typeof label === 'string' ? label : defaultLabel) : undefined}
    >
      {content}
    </Button>
  )

  if (to) {
    return <Link to={to}>{button}</Link>
  }
  return button
}
