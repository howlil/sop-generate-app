/**
 * Picker status hasil evaluasi: Sesuai | Revisi Biro.
 * Memakai OptionCardPicker generik; opsi dan teks dari konstanta evaluasi.
 */
import { CheckCircle, XCircle } from 'lucide-react'
import { OptionCardPicker, type OptionCardOption } from '@/components/ui/option-card-picker'
import { InfoCard } from '@/components/ui/info-card'
import { STATUS_HASIL_EVALUASI, type StatusHasilEvaluasiForm } from '@/lib/domain/evaluasi'

const OPTIONS: OptionCardOption<StatusHasilEvaluasiForm>[] = [
  {
    value: 'Sesuai',
    label: 'Sesuai',
    description: `→ ${STATUS_HASIL_EVALUASI.Sesuai}`,
    icon: <CheckCircle className="w-6 h-6" />,
    variant: 'success',
  },
  {
    value: 'Revisi Biro',
    label: 'Revisi Biro',
    description: `→ ${STATUS_HASIL_EVALUASI['Revisi Biro']}`,
    icon: <XCircle className="w-6 h-6" />,
    variant: 'warning',
  },
]

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
    <>
      <OptionCardPicker<StatusHasilEvaluasiForm>
        options={OPTIONS}
        value={value}
        onChange={onChange}
        label="Status Hasil Evaluasi"
        required
      />
      {value === 'Revisi Biro' && !komentarTrim && (
        <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
          <p className="text-[10px] text-amber-800">Komentar evaluasi wajib untuk status Revisi Biro.</p>
        </InfoCard>
      )}
    </>
  )
}
