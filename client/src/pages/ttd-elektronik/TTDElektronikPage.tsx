import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import type { TTERole } from '@/lib/types/tte'
import {
  getTTEProfile,
  setTTEProfile,
  hashPin,
  getTTEVerificationSuccessUrl,
} from '@/lib/tte'
import { formatDateIdLong } from '@/utils/format-date'

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
        <Table.Root>
          <Table.Table className="text-left">
            <thead>
              <Table.HeadRow>
                <Table.Th className="px-4 py-2">Jabatan</Table.Th>
                <Table.Th className="px-4 py-2">Status</Table.Th>
                <Table.Th className="px-4 py-2">Tanggal dibuat</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              <Table.BodyRow>
                <Table.Td className="px-4 py-3 font-medium text-gray-900">
                  {ROLE_LABEL[role]}
                </Table.Td>
                <Table.Td className="px-4 py-3">
                  <Badge variant={statusVariant} className="text-xs">
                    {statusLabel}
                  </Badge>
                </Table.Td>
                <Table.Td className="px-4 py-3 text-gray-600">
                  {profile?.createdAt
                    ? formatDateIdLong(profile.createdAt)
                    : '—'}
                </Table.Td>
              </Table.BodyRow>
            </tbody>
          </Table.Table>
        </Table.Root>
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
                <FormField label="NIP">
                  <Input
                    className="h-9 text-xs"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Nomor Induk Pegawai"
                  />
                </FormField>
                <FormField label="Nama">
                  <Input
                    className="h-9 text-xs"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </FormField>
                <FormField label="Email dinas">
                  <Input
                    type="email"
                    className="h-9 text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@instansi.go.id"
                  />
                </FormField>
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
                <FormField label="PIN TTE">
                  <Input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    className="h-9 text-xs"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN untuk verifikasi"
                    maxLength={8}
                  />
                </FormField>
                <FormField label="Konfirmasi PIN">
                  <Input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    className="h-9 text-xs"
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)}
                    placeholder="Ulangi PIN"
                    maxLength={8}
                  />
                </FormField>
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
