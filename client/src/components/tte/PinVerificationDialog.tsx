import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface PinVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onConfirm: (pin: string) => boolean | Promise<boolean>
  /** Label untuk tombol konfirmasi */
  confirmLabel?: string
}

export function PinVerificationDialog({
  open,
  onOpenChange,
  title,
  description = 'Masukkan PIN TTE BSRE Anda untuk melanjutkan.',
  onConfirm,
  confirmLabel = 'Verifikasi PIN',
}: PinVerificationDialogProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setPin('')
    setError(null)
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) {
      setError('PIN harus diisi.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const ok = await Promise.resolve(onConfirm(pin))
      if (ok) {
        setPin('')
        setError(null)
        // Defer close to avoid removeChild during form submit (Radix Dialog)
        setTimeout(() => onOpenChange(false), 0)
      } else {
        setError('PIN salah. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <p className="text-xs text-gray-600 -mt-2">{description}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">PIN TTE</Label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              className="mt-1"
              placeholder="Masukkan PIN"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError(null)
              }}
              maxLength={8}
            />
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
            >
              {loading ? 'Memverifikasi...' : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
