import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { TTESignaturePayload } from '@/lib/types/tte'
import { getValidasiPengesahanUrl } from '@/lib/data/tte-storage'
import { formatDateIdLong } from '@/utils/format-date'

export interface TTESignatureBlockProps {
  payload: TTESignaturePayload
  /** Contoh: "OPD" atau "Biro Organisasi" */
  roleLabel: string
  /** Ukuran sisi QR (px). */
  qrSize?: number
  className?: string
}

export function TTESignatureBlock({
  payload,
  roleLabel,
  qrSize = 80,
  className = '',
}: TTESignatureBlockProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const url = getValidasiPengesahanUrl(payload.id)
    QRCode.toDataURL(url, { width: qrSize, margin: 1 })
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [payload.id, qrSize])

  const signedDate = payload.signedAt
    ? formatDateIdLong(payload.signedAt)
    : '—'

  return (
    <div className={`inline-block text-center ${className}`}>
      <p className="text-xs font-medium text-gray-700 mb-1">{roleLabel}</p>
      <p className="text-sm font-semibold text-gray-900">{payload.nama}</p>
      <p className="text-xs text-gray-600">NIP. {payload.nip}</p>
      <p className="text-xs text-gray-500 mt-1">Tanda Tangan Elektronik BSRE</p>
      <p className="text-xs text-gray-500">{signedDate}</p>
      {qrDataUrl && (
        <div className="mt-2 flex justify-center">
          <img
            src={qrDataUrl}
            alt="QR Validasi Pengesahan"
            width={qrSize}
            height={qrSize}
            className="border border-gray-200 rounded"
          />
        </div>
      )}
    </div>
  )
}
