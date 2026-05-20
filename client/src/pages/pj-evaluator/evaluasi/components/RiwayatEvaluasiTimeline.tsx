/**

 * Timeline component for evaluation history (riwayat evaluasi).

 * Displays audit trail from LogNilaiEvaluasi.

 */

import { History, MessageSquare } from "lucide-react"

import { formatDateId } from "@/utils/format-date"

import type { LogNilaiEvaluasi } from "@/types/dto/evaluasi.dto"
import { HasilEvaluasiBadge } from "@/components/status/hasil-evaluasi-badge"



export interface RiwayatEvaluasiTimelineProps {

  logs: LogNilaiEvaluasi[]

  className?: string

}



function HasilBadge({ hasil }: { hasil?: string | null }) {

  if (!hasil) return <span className="text-gray-400 text-xs">Belum dinilai</span>

  const label =
    hasil === "SESUAI"
      ? "Sesuai"
      : hasil === "PERLU_PERBAIKAN"
        ? "Perlu Perbaikan"
        : hasil

  return <HasilEvaluasiBadge hasil={hasil} label={label} showDomain={false} />

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

    <div className={`space-y-2 ${className}`}>

      {logs.map((log) => {

        const hasPerubahanHasil =

          (log.hasilSebelum ?? null) !== (log.hasilSesudah ?? null)

        return (

          <div

            key={log.id}

            className="relative space-y-1.5 rounded-lg border border-gray-200 bg-gray-50 p-2.5 shadow-sm"

          >

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

              {!hasPerubahanHasil ? (

                <div className="flex items-center gap-1">

                  <HasilBadge hasil={log.hasilSesudah} />

                </div>

              ) : null}

            </div>



            {hasPerubahanHasil ? (

              <div className="flex flex-wrap items-center gap-2 text-[11px]">

                <span className="text-gray-500">Perubahan:</span>

                <HasilBadge hasil={log.hasilSebelum} />

                <span className="text-gray-400">→</span>

                <HasilBadge hasil={log.hasilSesudah} />

              </div>

            ) : null}



            {log.catatanSesudah ? (

              <div className="flex items-start gap-1.5 rounded border border-gray-100 bg-white p-1.5 text-xs text-gray-600">

                <MessageSquare className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />

                <p className="whitespace-pre-wrap">{log.catatanSesudah}</p>

              </div>

            ) : null}

          </div>

        )

      })}

    </div>

  )

}


