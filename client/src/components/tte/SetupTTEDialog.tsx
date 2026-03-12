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
import type { TTERole } from '@/lib/types/tte'
import { hashPin } from '@/lib/domain/tte'
import { setTTEProfile } from '@/lib/data/tte-storage'

export interface SetupTTEDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: TTERole
  defaultNip: string
  defaultNama: string
  onSetupComplete: () => void
}

export function SetupTTEDialog({
  open,
  onOpenChange,
  role,
  defaultNip,
  defaultNama,
  onSetupComplete,
}: SetupTTEDialogProps) {
  const [nip, setNip] = useState(defaultNip)
  const [nama, setNama] = useState(defaultNama)
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!nip.trim() || !nama.trim()) {
      setError('NIP dan Nama wajib diisi.')
      return
    }
    if (!email.trim()) {
      setError('Email dinas wajib diisi.')
      return
    }
    if (pin.length < 4) {
      setError('PIN minimal 4 karakter.')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN dan Konfirmasi PIN tidak sama.')
      return
    }

    setTTEProfile(role, {
      nip: nip.trim(),
      nama: nama.trim(),
      email: email.trim(),
      pinHash: hashPin(pin),
      emailVerified: true,
      role,
    })
    setPin('')
    setPinConfirm('')
    setError(null)
    onSetupComplete()
    // Defer close to avoid removeChild during form submit (Radix Dialog)
    setTimeout(() => onOpenChange(false), 0)
  }

  const handleClose = () => {
    setError(null)
    setPin('')
    setPinConfirm('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Setup Tanda Tangan Elektronik (TTE) BSRE</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-gray-600 -mt-2">
          Daftarkan NIP dan email dinas, lalu buat PIN untuk verifikasi saat menandatangani.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">NIP</Label>
            <Input
              className="mt-1"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Nomor Induk Pegawai"
            />
          </div>
          <div>
            <Label className="text-xs">Nama</Label>
            <Input
              className="mt-1"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <Label className="text-xs">Email dinas</Label>
            <Input
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@instansi.go.id"
            />
          </div>
          <div>
            <Label className="text-xs">PIN TTE (min. 4 karakter)</Label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="mt-1"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN untuk verifikasi"
              maxLength={8}
            />
          </div>
          <div>
            <Label className="text-xs">Konfirmasi PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="mt-1"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value)}
              placeholder="Ulangi PIN"
              maxLength={8}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs">
              Simpan &amp; verifikasi email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
