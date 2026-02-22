import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import type { TTERole } from '@/lib/tte-types'
import {
  getTTEProfile,
  setTTEProfile,
  hashPin,
  getTTEVerificationSuccessUrl,
} from '@/lib/tte'

const ROLE_LABEL: Record<TTERole, string> = {
  'kepala-opd': 'Kepala OPD',
  'kepala-biro-organisasi': 'Kepala Biro Organisasi',
  'tim-evaluasi': 'Tim Evaluasi (Evaluator)',
}

export interface TTDElektronikPageProps {
  role: TTERole
  /** NIP default (dari role) */
  defaultNip: string
  /** Nama default */
  defaultNama: string
}

type WizardStep = 'data-diri' | 'pin' | 'cek-email'

export function TTDElektronikPage({
  role,
  defaultNip,
  defaultNama,
}: TTDElektronikPageProps) {
  const profile = useMemo(() => getTTEProfile(role), [role])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [step, setStep] = useState<WizardStep>('data-diri')
  const [nip, setNip] = useState(profile?.nip ?? defaultNip)
  const [nama, setNama] = useState(profile?.nama ?? defaultNama)
  const [email, setEmail] = useState(profile?.email ?? '')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)

  const statusLabel = !profile
    ? 'Belum dibuat'
    : profile.emailVerified
      ? 'Aktif'
      : 'Menunggu verifikasi email'
  const statusVariant = !profile
    ? 'secondary'
    : profile.emailVerified
      ? 'default'
      : 'outline'

  const openBuat = () => {
    setStep('data-diri')
    setNip(profile?.nip ?? defaultNip)
    setNama(profile?.nama ?? defaultNama)
    setEmail(profile?.email ?? '')
    setPin('')
    setPinConfirm('')
    setError(null)
    setVerificationToken(null)
    setDialogOpen(true)
  }

  const handleNextFromDataDiri = (e: React.FormEvent) => {
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
    setStep('pin')
  }

  const handleNextFromPin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (pin.length < 4) {
      setError('PIN minimal 4 karakter.')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN dan Konfirmasi PIN tidak sama.')
      return
    }
    const token = 'tte_verify_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12)
    setTTEProfile(role, {
      nip: nip.trim(),
      nama: nama.trim(),
      email: email.trim(),
      pinHash: hashPin(pin),
      emailVerified: false,
      role,
      verificationToken: token,
    })
    setVerificationToken(token)
    setPin('')
    setPinConfirm('')
    setStep('cek-email')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setStep('data-diri')
    setVerificationToken(null)
  }

  const verificationUrl = verificationToken
    ? getTTEVerificationSuccessUrl(verificationToken)
    : ''

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={[{ label: ROLE_LABEL[role] }, { label: 'TTD Elektronik' }]}
        title="Buat TTD Elektronik (TTE BSRE)"
        description={
          role === 'tim-evaluasi'
            ? 'Kelola tanda tangan elektronik untuk menandatangani hasil evaluasi SOP (TTE BSRE).'
            : 'Kelola tanda tangan elektronik untuk mengesahkan SOP atau memverifikasi evaluasi.'
        }
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Riwayat Tanda Tangan</h2>
          <Button size="sm" className="h-8 text-xs" onClick={openBuat}>
            Buat TTD
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Jabatan</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Tanggal dibuat</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-xs font-medium text-gray-900">
                  {ROLE_LABEL[role]}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant} className="text-xs">
                    {statusLabel}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {step === 'data-diri' && 'Data Diri'}
              {step === 'pin' && 'Buat PIN TTE'}
              {step === 'cek-email' && 'Verifikasi lewat Email'}
            </DialogTitle>
          </DialogHeader>

          {step === 'data-diri' && (
            <>
              <p className="text-xs text-gray-600 -mt-2">
                Isi data diri yang akan terhubung dengan TTD elektronik Anda.
              </p>
              <form onSubmit={handleNextFromDataDiri} className="space-y-3 mt-2">
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
                {error && <p className="text-xs text-red-600">{error}</p>}
                <DialogFooter className="gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleCloseDialog}
                  >
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs">
                    Lanjut
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {step === 'pin' && (
            <>
              <p className="text-xs text-gray-600 -mt-2">
                Buat PIN untuk verifikasi saat menandatangani dokumen (min. 4 karakter).
              </p>
              <form onSubmit={handleNextFromPin} className="space-y-3 mt-2">
                <div>
                  <Label className="text-xs">PIN TTE</Label>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setStep('data-diri')}
                  >
                    Kembali
                  </Button>
                  <Button type="submit" size="sm" className="h-8 text-xs">
                    Buat & kirim kode verifikasi
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}

          {step === 'cek-email' && (
            <>
              <p className="text-xs text-gray-600 -mt-2">
                Kode verifikasi telah dikirim ke <strong>{email}</strong>. Buka email Anda
                dan klik link untuk menyelesaikan aktivasi TTD.
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-2">
                Simulasi: klik link di bawah untuk verifikasi (tanpa benar-benar mengirim
                email).
              </p>
              <div className="mt-3">
                <Link
                  to="/validasi/ttd/berhasil"
                  search={{ token: verificationToken ?? '' }}
                  className="text-xs text-blue-600 hover:underline break-all"
                  onClick={handleCloseDialog}
                >
                  {verificationUrl}
                </Link>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleCloseDialog}
                >
                  Tutup
                </Button>
                <Link to="/validasi/ttd/berhasil" search={{ token: verificationToken ?? '' }}>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleCloseDialog}
                  >
                    Buka halaman verifikasi
                  </Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
