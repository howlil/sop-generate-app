/**
 * Picker status hasil evaluasi: Sesuai | Revisi Biro (dua tombol).
 */
import { CheckCircle, XCircle } from 'lucide-react'
import { FormField } from '@/components/ui/form-field'
import { InfoCard } from '@/components/ui/info-card'
import type { StatusHasilEvaluasiForm } from '@/lib/constants/evaluasi'

export interface StatusHasilEvaluasiPickerProps {
  value: StatusHasilEvaluasiForm | null
  onChange: (value: StatusHasilEvaluasiForm) => void
  komentarTrim?: string
}

export function StatusHasilEvaluasiPicker({
  value,
  onChange,
  komentarTrim = '',
}: StatusHasilEvaluasiPickerProps) {
  return (
    <FormField label="Status Hasil Evaluasi" required>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`p-3 rounded-md border transition-all ${
            value === 'Sesuai' ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => onChange('Sesuai')}
        >
          <CheckCircle
            className={`w-6 h-6 mx-auto mb-1 ${value === 'Sesuai' ? 'text-green-600' : 'text-gray-400'}`}
          />
          <span className={`text-xs font-semibold block ${value === 'Sesuai' ? 'text-green-600' : 'text-gray-700'}`}>
            Sesuai
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5">→ Dievaluasi Tim Evaluasi</span>
        </button>
        <button
          type="button"
          className={`p-3 rounded-md border transition-all ${
            value === 'Revisi Biro' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => onChange('Revisi Biro')}
        >
          <XCircle
            className={`w-6 h-6 mx-auto mb-1 ${value === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-400'}`}
          />
          <span className={`text-xs font-semibold block ${value === 'Revisi Biro' ? 'text-amber-600' : 'text-gray-700'}`}>
            Revisi Biro
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5">→ Revisi dari Tim Evaluasi</span>
        </button>
      </div>
      {value === 'Revisi Biro' && !komentarTrim && (
        <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
          <p className="text-[10px] text-amber-800">Komentar evaluasi wajib untuk status Revisi Biro.</p>
        </InfoCard>
      )}
    </FormField>
  )
}
