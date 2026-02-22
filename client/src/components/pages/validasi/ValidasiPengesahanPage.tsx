import { useParams } from '@tanstack/react-router'
import { getTTESignatureById, getTTEAuditLog } from '@/lib/tte'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'

export function ValidasiPengesahanPage() {
  const params = useParams({ strict: false })
  const id = (params as { id?: string }).id

  const signature = id ? getTTESignatureById(id) : null
  const auditLog = getTTEAuditLog()
  const relevantAudit = signature
    ? auditLog.filter(
        (e) =>
          (e.documentId === signature.documentId && e.referenceId === signature.referenceId) ||
          e.timestamp === signature.signedAt
      )
    : []

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-lg font-semibold text-gray-900">Validasi Pengesahan</h1>
          <p className="text-sm text-gray-600 mt-2">ID tanda tangan tidak valid.</p>
        </div>
      </div>
    )
  }

  if (!signature) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-lg font-semibold text-gray-900">Validasi Pengesahan</h1>
          <p className="text-sm text-gray-600 mt-2">
            Tanda tangan dengan ID ini tidak ditemukan atau telah kadaluarsa.
          </p>
        </div>
      </div>
    )
  }

  const roleLabel =
    signature.role === 'kepala-opd' ? 'Kepala OPD' : 'Kepala Biro Organisasi'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Detail Pengesahan – TTE BSRE
            </h1>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-500">Dokumen</p>
              <p className="font-medium text-gray-900">{signature.documentLabel}</p>
              <p className="text-gray-500">ID Dokumen</p>
              <p className="font-mono text-xs text-gray-900">{signature.documentId}</p>
              <p className="text-gray-500">Referensi</p>
              <p className="text-gray-900">{signature.referenceId}</p>
              <p className="text-gray-500">Ditandatangani oleh</p>
              <p className="text-gray-900">{signature.nama} (NIP. {signature.nip})</p>
              <p className="text-gray-500">Jabatan</p>
              <p className="text-gray-900">{roleLabel}</p>
              <p className="text-gray-500">Waktu tanda tangan</p>
              <p className="text-gray-900">
                {new Date(signature.signedAt).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-xs font-semibold text-gray-700 mb-2">Blok TTE</h2>
              <TTESignatureBlock payload={signature} roleLabel={roleLabel} qrSize={100} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Audit Log</h2>
          {relevantAudit.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada entri audit untuk dokumen ini.</p>
          ) : (
            <ul className="space-y-2">
              {relevantAudit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs border-b border-gray-100 pb-2 last:border-0"
                >
                  <span className="text-gray-500">
                    {new Date(entry.timestamp).toLocaleString('id-ID')}
                  </span>
                  <span className="font-medium">
                    {entry.action === 'pengesahan_sop' ? 'Pengesahan SOP' : 'Verifikasi Evaluasi'}
                  </span>
                  <span className="text-gray-600">{entry.nama} (NIP. {entry.nip})</span>
                  <span className="text-gray-500">— {entry.documentLabel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
