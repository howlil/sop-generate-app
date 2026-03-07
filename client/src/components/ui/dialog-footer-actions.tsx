import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

export interface DialogFooterActionsProps {
  cancelLabel?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
  /** Tambahan class untuk wrapper DialogFooter. */
  className?: string
  /** Class untuk tombol Batal. */
  cancelClassName?: string
  /** Class untuk tombol Konfirmasi. */
  confirmClassName?: string
}

export function DialogFooterActions({
  cancelLabel = 'Batal',
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled,
  className,
  cancelClassName,
  confirmClassName,
}: DialogFooterActionsProps) {
  return (
    <DialogFooter className={className ?? 'gap-2 pt-3'}>
      <Button variant="outline" size="sm" className={cn('h-8 text-xs', cancelClassName)} onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button size="sm" className={cn('h-8 text-xs', confirmClassName)} onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </Button>
    </DialogFooter>
  )
}
