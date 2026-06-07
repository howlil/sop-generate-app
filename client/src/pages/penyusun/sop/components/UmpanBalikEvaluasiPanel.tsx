import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { HasilEvaluasiBadge } from '@/components/status/hasil-evaluasi-badge'
import {
  getStatusTindakLanjutBadgeClass,
  getStatusTindakLanjutLabel,
} from '@/lib/status'
import type { UmpanBalikEvaluasiDetail } from '@/types/dto/evaluasi.dto'

export interface UmpanBalikEvaluasiPanelProps {
  umpanBalik: UmpanBalikEvaluasiDetail | null | undefined
  isLoading?: boolean
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function UmpanBalikEvaluasiPanel({
  umpanBalik,
  isLoading = false,
}: UmpanBalikEvaluasiPanelProps) {
  if (isLoading) {
    return <p className="p-3 text-xs text-gray-500">Memuat komentar evaluasi…</p>
  }

  if (!umpanBalik) {
    return (
      <p className="p-3 text-xs text-gray-500">
        Belum ada komentar evaluasi (catatan evaluator) untuk dokumen ini.
      </p>
    )
  }

  const umpanBalikData = umpanBalik
  const isTerbuka = umpanBalikData.statusTindakLanjut === 'TERBUKA'
  const isSelesai = umpanBalikData.statusTindakLanjut === 'SELESAI'
  const tindakLanjutLabel = getStatusTindakLanjutLabel(
    umpanBalikData.statusTindakLanjut,
    umpanBalikData.statusTindakLanjutLabel,
  )

  return (
    <div className="p-3 space-y-3">
      <p className="text-[10px] text-gray-500 leading-snug">
        Komentar evaluator disimpan pada nilai evaluasi. Kirim ulang evaluasi setelah perbaikan
        tersimpan.
      </p>
      <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-xs space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <HasilEvaluasiBadge hasil={umpanBalikData.hasil} label={umpanBalikData.hasilLabel} />
          {tindakLanjutLabel && (isTerbuka || isSelesai) ? (
            <Badge
              className={`text-xs inline-flex items-center gap-0.5 ${getStatusTindakLanjutBadgeClass(umpanBalikData.statusTindakLanjut)}`}
            >
              {isSelesai ? <Check className="w-3 h-3" aria-hidden /> : null}
              {tindakLanjutLabel}
            </Badge>
          ) : null}
        </div>
        {umpanBalikData.dinilaiOleh ? (
          <p className="text-gray-600">
            Evaluator:{' '}
            <span className="font-medium text-gray-900">{umpanBalikData.dinilaiOleh.nama}</span>
          </p>
        ) : null}
        <p className="text-gray-900 whitespace-pre-wrap break-words">
          {umpanBalikData.catatan ?? '—'}
        </p>
        {umpanBalikData.ditindaklanjutiPada && umpanBalikData.ditindaklanjutiOleh ? (
          <p className="text-[10px] text-gray-500">
            Ditandai selesai oleh {umpanBalikData.ditindaklanjutiOleh.nama} pada{' '}
            {formatDate(umpanBalikData.ditindaklanjutiPada)}
          </p>
        ) : null}
      </div>
    </div>
  )
}
