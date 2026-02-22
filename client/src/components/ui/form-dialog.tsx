import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogFooterActions } from '@/components/ui/dialog-footer-actions'

export interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  confirmDisabled?: boolean
  /** Dialog width variant. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
}

const SIZE_MAP: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
}

/**
 * Pre-wired form dialog: title + description + form content + Batal/Simpan footer.
 * Covers the ~20 create/edit dialog instances across the codebase.
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Simpan',
  cancelLabel = 'Batal',
  onConfirm,
  confirmDisabled,
  size = 'md',
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${SIZE_MAP[size]} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
          {description != null && (
            <DialogDescription className="text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3">{children}</div>

        <DialogFooterActions
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
        />
      </DialogContent>
    </Dialog>
  )
}
