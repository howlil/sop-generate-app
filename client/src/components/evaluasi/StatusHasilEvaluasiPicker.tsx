/**
 * Picker status hasil evaluasi: SESUAI | TIDAK_SESUAI.
 * Memakai OptionCardPicker generik; opsi dan teks dari konstanta evaluasi.
 * Per ERD: Hasil evaluasi adalah SESUAI / TIDAK_SESUAI
 */
import { CheckCircle, XCircle } from 'lucide-react'
import { OptionCardPicker, type OptionCardOption } from '@/components/ui/option-card-picker'
import { InfoCard } from '@/components/ui/info-card'
import { STATUS_HASIL_EVALUASI, type StatusHasilEvaluasiForm } from '@/lib/domain/evaluasi'

const OPTIONS: OptionCardOption<StatusHasilEvaluasiForm>[] = [
  {
    value: 'SESUAI',
    label: 'Sesuai',
    description: `→ ${STATUS_HASIL_EVALUASI.SESUAI}`,
    icon: <CheckCircle className="w-6 h-6" />,
    variant: 'success',
  },
  {
    value: 'TIDAK_SESUAI',
    label: 'Perlu Perbaikan',
    description: `→ ${STATUS_HASIL_EVALUASI.TIDAK_SESUAI}`,
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
        label="Hasil Evaluasi"
        required
      />
      {value === 'TIDAK_SESUAI' && !komentarTrim && (
        <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
          <p className="text-[10px] text-amber-800">Catatan wajib diisi jika hasil Perlu Perbaikan.</p>
        </InfoCard>
      )}
    </>
  )
}
