import { useParams } from '@tanstack/react-router'
import { getTTESignatureById, getTTEAuditLog } from '@/lib/tte'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'
import { formatDatetime } from '@/utils/format-date'
import { InfoField, InfoGrid } from '@/components/ui/info-field'

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
    signature.role === 'kepala-opd' ? 'OPD' : 'Biro Organisasi'

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
            <InfoGrid cols={2}>
              <InfoField label="Dokumen" direction="vertical">{signature.documentLabel}</InfoField>
              <InfoField label="ID Dokumen" direction="vertical">
                <span className="font-mono text-xs">{signature.documentId}</span>
              </InfoField>
              <InfoField label="Referensi" direction="vertical">{signature.referenceId}</InfoField>
              <InfoField label="Ditandatangani oleh" direction="vertical">
                {signature.nama} (NIP. {signature.nip})
              </InfoField>
              <InfoField label="Jabatan" direction="vertical">{roleLabel}</InfoField>
              <InfoField label="Waktu tanda tangan" direction="vertical">
                {formatDatetime(signature.signedAt)}
              </InfoField>
            </InfoGrid>

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
                    {formatDatetime(entry.timestamp)}
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
