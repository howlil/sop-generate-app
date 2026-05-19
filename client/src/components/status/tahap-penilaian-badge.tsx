import { cn } from '@/utils/cn'
import type { TahapPenilaianSop } from '@/lib/evaluasi/evaluasi-domain'
import { getTahapPenilaianCopy } from '@/lib/evaluasi/evaluasi-domain'

export interface TahapPenilaianBadgeProps {
  tahap: TahapPenilaianSop
  className?: string
}

export function TahapPenilaianBadge({ tahap, className }: TahapPenilaianBadgeProps) {
  const copy = getTahapPenilaianCopy(tahap)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight',
        copy.badgeClassName,
        className,
      )}
    >
      {copy.badgeLabel}
    </span>
  )
}
