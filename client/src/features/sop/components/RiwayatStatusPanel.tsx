/**
 * Panel riwayat perubahan status SOP (audit trail).
 * Menampilkan kronologi: siapa, role apa, ubah status dari apa ke apa, kapan.
 */
import { Activity } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
export interface AuditLogEntry {
  id: string
  action: string
  timestamp: string
  aktorNama: string
  aktorRole: string
  statusSebelum?: string
  statusSesudah: string
  keterangan?: string
}

const ACTION_LABEL: Record<string, string> = {
  BUAT_SOP: 'Membuat SOP',
  SALIN_ISI_DARI_SOP: 'Menyalin isi dari SOP lain',
  SIMPAN_DRAFT: 'Simpan sebagai draft',
  SELESAI_PENYUSUNAN: 'Selesai penyusunan',
  AJUKAN_EVALUASI: 'Mengajukan ke evaluasi',
  MULAI_EVALUASI: 'Mulai evaluasi',
  KIRIM_HASIL_EVALUASI: 'Mengirim hasil evaluasi',
  REVISI_DARI_EVALUATOR: 'Dikembalikan untuk revisi',
  VERIFIKASI_PENGAJUAN_EVALUASI: 'Verifikasi pengajuan evaluasi (Biro)',
  TTD_BA_KOORDINATOR_TIM_PENYUSUN: 'Tanda tangan Berita Acara (Koordinator Tim Penyusun)',
  SAHKAN_SOP: 'Mengesahkan SOP',
  CABUT_SOP: 'Mencabut SOP',
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface RiwayatStatusPanelProps {
  entries: AuditLogEntry[]
}

export function RiwayatStatusPanel({ entries }: RiwayatStatusPanelProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-8 h-8" />}
        title="Belum ada riwayat"
        description="Perubahan status SOP akan tercatat di sini."
      />
    )
  }

  return (
    <div className="relative pl-4">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
      <ul className="space-y-4">
        {entries.map((entry, i) => (
          <li key={entry.id} className="relative flex gap-3">
            <span
              className={`absolute -left-[13px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                i === 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-xs font-semibold text-gray-900">
                  {ACTION_LABEL[entry.action] ?? entry.action}
                </span>
                <span className="text-[10px] text-gray-400">{formatTimestamp(entry.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {entry.aktorNama}{' '}
                <span className="text-gray-400">({entry.aktorRole})</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {entry.statusSebelum && (
                  <>
                    <StatusBadge status={entry.statusSebelum} className="text-[10px] px-1.5 py-0 h-4" />
                    <span className="text-gray-400 text-[10px]">→</span>
                  </>
                )}
                <StatusBadge status={entry.statusSesudah} className="text-[10px] px-1.5 py-0 h-4" />
              </div>
              {entry.keterangan && (
                <p className="text-[11px] text-gray-500 mt-1 italic">{entry.keterangan}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
