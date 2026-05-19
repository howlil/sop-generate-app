import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { StatusHasilEvaluasi } from '@/types/dto/evaluasi.dto'

export interface EvaluasiKeputusanSebelumnyaCardProps {
  hasil: StatusHasilEvaluasi
  catatan: string | null
}

function labelHasil(hasil: StatusHasilEvaluasi): string {
  if (hasil === 'SESUAI') return 'Sesuai'
  if (hasil === 'PERLU_PERBAIKAN') return 'Perlu perbaikan'
  return hasil
}

export function EvaluasiKeputusanSebelumnyaCard({
  hasil,
  catatan,
}: EvaluasiKeputusanSebelumnyaCardProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 text-xs">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-medium text-gray-700"
        onClick={() => setOpen((v) => !v)}
      >
        <span>Keputusan sebelumnya</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="px-3 pb-3 pt-0 space-y-1 text-gray-600 border-t border-gray-100">
          <p>
            <span className="text-gray-500">Status: </span>
            <span className="font-medium text-gray-800">{labelHasil(hasil)}</span>
          </p>
          {catatan?.trim() ? (
            <p className="leading-snug whitespace-pre-wrap">
              <span className="text-gray-500">Catatan: </span>
              {catatan}
            </p>
          ) : null}
          <p className="text-[11px] text-gray-500 pt-1">
            Ini bukan penilaian aktif — pilih hasil baru di bawah setelah meninjau dokumen
            terbaru.
          </p>
        </div>
      ) : null}
    </div>
  )
}
