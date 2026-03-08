/**
 * Select filter status SOP — satu komponen dengan STATUS_SOP_ALL (sesuai StatusBadge & types/sop).
 * Dipakai di Filter SOP (Manajemen SOP, Daftar SOP, SOP Saya).
 */
import { Select } from '@/components/ui/select'
import { SOP_STATUS_FILTER_OPTIONS } from '@/lib/types/sop'
import { cn } from '@/utils/cn'

export interface SOPStatusFilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function SOPStatusFilterSelect({
  value,
  onValueChange,
  className,
}: SOPStatusFilterSelectProps) {
  return (
    <Select
      className={cn('h-9 w-full', className)}
      value={value}
      onValueChange={onValueChange}
      options={SOP_STATUS_FILTER_OPTIONS}
    />
  )
}
