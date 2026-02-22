import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

export interface DialogFooterActionsProps {
  cancelLabel?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
  /** Tambahan class untuk wrapper DialogFooter. */
  className?: string
}

export function DialogFooterActions({
  cancelLabel = 'Batal',
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled,
  className,
}: DialogFooterActionsProps) {
  return (
    <DialogFooter className={className ?? 'gap-2 pt-3'}>
      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button size="sm" className="h-8 text-xs" onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </Button>
    </DialogFooter>
  )
}
