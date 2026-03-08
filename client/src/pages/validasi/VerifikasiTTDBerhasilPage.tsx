import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { ROUTES } from '@/lib/constants/routes'
import { verifyTTEEmail } from '@/lib/tte'

const ROLE_LABEL: Record<string, string> = {
  'kepala-opd': 'OPD',
  'biro-organisasi': 'Biro Organisasi',
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
            <span className="text-red-600 text-lg">✕</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Link tidak valid</h1>
          <p className="text-sm text-gray-600 mt-2">
            Link verifikasi tidak valid atau sudah digunakan. Silakan buat TTD elektronik
            kembali dari halaman TTD Elektronik.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link to={ROUTES.KEPALA_OPD.TTD}>
              <Button variant="outline" size="sm">
                Ke TTD Elektronik (OPD)
              </Button>
            </Link>
            <Link to={ROUTES.BIRO_ORGANISASI.TTD}>
              <Button variant="outline" size="sm">
                Ke TTD Elektronik (Biro Organisasi)
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
  const ttdPage = verifiedRole === 'kepala-opd' ? ROUTES.KEPALA_OPD.TTD : ROUTES.BIRO_ORGANISASI.TTD

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-lg">✓</span>
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
        <BackButton to={ttdPage} className="mt-6 inline-block h-8 text-xs">
          Kembali ke TTD Elektronik
        </BackButton>
      </div>
    </div>
  )
}
