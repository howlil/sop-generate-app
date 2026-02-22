import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { verifyTTEEmail } from '@/lib/tte'

const ROLE_LABEL: Record<string, string> = {
  'kepala-opd': 'Kepala OPD',
  'kepala-biro-organisasi': 'Kepala Biro Organisasi',
  'tim-evaluasi': 'Tim Evaluasi (Evaluator)',
}

export interface VerifikasiTTDBerhasilPageProps {
  token: string
}

export function VerifikasiTTDBerhasilPage({ token }: VerifikasiTTDBerhasilPageProps) {
  const [verifiedRole, setVerifiedRole] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!token) {
      setInvalid(true)
      return
    }
    const role = verifyTTEEmail(token)
    if (role) setVerifiedRole(role)
    else setInvalid(true)
  }, [token])

  if (invalid) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Link tidak valid</h1>
          <p className="text-sm text-gray-600 mt-2">
            Link verifikasi tidak valid atau sudah digunakan. Silakan buat TTD elektronik
            kembali dari halaman TTD Elektronik.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to="/kepala-opd/ttd-elektronik">
              <Button variant="outline" size="sm">
                Ke TTD Elektronik (Kepala OPD)
              </Button>
            </Link>
            <Link to="/kepala-biro-organisasi/ttd-elektronik">
              <Button variant="outline" size="sm">
                Ke TTD Elektronik (Kepala Biro)
              </Button>
            </Link>
            <Link to="/tim-evaluasi/ttd-elektronik">
              <Button variant="outline" size="sm">
                Ke TTD Elektronik (Tim Evaluasi)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!verifiedRole) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-sm text-gray-500">Memverifikasi...</div>
      </div>
    )
  }

  const label = ROLE_LABEL[verifiedRole] ?? verifiedRole
  const ttdPage =
    verifiedRole === 'kepala-opd'
      ? '/kepala-opd/ttd-elektronik'
      : verifiedRole === 'tim-evaluasi'
        ? '/tim-evaluasi/ttd-elektronik'
        : '/kepala-biro-organisasi/ttd-elektronik'

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Verifikasi berhasil</h1>
        <p className="text-sm text-gray-600 mt-2">
          Tanda Tangan Elektronik (TTD) Anda untuk <strong>{label}</strong> berhasil
          dibuat dan sudah aktif.
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Anda dapat menggunakan TTD untuk mengesahkan SOP atau memverifikasi evaluasi
          dengan memasukkan PIN saat diminta.
        </p>
        <Link to={ttdPage} className="mt-6 inline-block">
          <Button size="sm">Kembali ke TTD Elektronik</Button>
        </Link>
      </div>
    </div>
  )
}
