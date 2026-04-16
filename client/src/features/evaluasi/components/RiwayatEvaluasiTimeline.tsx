/**
 * Timeline component for evaluation history (riwayat evaluasi).
 * Displays audit trail from LogNilaiEvaluasi.
 */
import { History, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { formatDateId } from "@/utils/format-date"
import type { LogNilaiEvaluasi } from "@/features/evaluasi"

export interface RiwayatEvaluasiTimelineProps {
  logs: LogNilaiEvaluasi[]
  className?: string
}

function HasilBadge({ hasil }: { hasil?: string | null }) {
  if (!hasil) return <span className="text-gray-400 text-xs">Belum dinilai</span>
  if (hasil === "SESUAI") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium">
        <CheckCircle className="w-3 h-3" />
        Sesuai
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">
      <XCircle className="w-3 h-3" />
      Tidak Sesuai
    </span>
  )
}

export function RiwayatEvaluasiTimeline({ logs, className = "" }: RiwayatEvaluasiTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <History className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-xs text-center">Belum ada riwayat evaluasi</p>
        <p className="text-[10px] text-center mt-1 text-gray-300">Perubahan hasil evaluasi akan tercatat di sini</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {logs.map((log) => (
        <div
          key={log.id}
          className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-semibold text-blue-700">
                  {log.evaluatorNama?.charAt(0) ?? "E"}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">{log.evaluatorNama ?? "Evaluator"}</p>
                <p className="text-[10px] text-gray-500">{formatDateId(log.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <HasilBadge hasil={log.hasilSesudah} />
            </div>
          </div>

          {/* Perubahan */}
          {(log.hasilSebelum !== log.hasilSesudah) && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-gray-500">Perubahan:</span>
              <HasilBadge hasil={log.hasilSebelum} />
              <span className="text-gray-400">→</span>
              <HasilBadge hasil={log.hasilSesudah} />
            </div>
          )}

          {/* Catatan */}
          {log.catatanSesudah && (
            <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-white rounded p-2 border border-gray-100">
              <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
              <p className="whitespace-pre-wrap">{log.catatanSesudah}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
