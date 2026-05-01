/**
 * Picker status hasil evaluasi: SESUAI | PERLU_PERBAIKAN.
 * Memakai OptionCardPicker generik; opsi dan teks dari konstanta evaluasi.
 * Per ERD: Hasil evaluasi adalah SESUAI / TIDAK_SESUAI (display: Sesuai / Perlu Perbaikan)
 */
import { CheckCircle, XCircle } from 'lucide-react'
import { OptionCardPicker, type OptionCardOption } from '@/components/ui/option-card-picker'
import { InfoCard } from '@/components/ui/info-card'
import { STATUS_HASIL_EVALUASI } from '@/api/evaluasi'
import type { StatusHasilEvaluasi } from '@/types/dto/evaluasi.dto'

const OPTIONS: OptionCardOption<StatusHasilEvaluasi>[] = [
  {
    value: STATUS_HASIL_EVALUASI.SESUAI,
    label: 'Sesuai',
    description: '→ SOP memenuhi standar dan siap diverifikasi',
    icon: <CheckCircle className="w-6 h-6" />,
    variant: 'success',
  },
  {
    value: STATUS_HASIL_EVALUASI.TIDAK_SESUAI,
    label: 'Perlu Perbaikan',
    description: '→ SOP perlu perbaikan sebelum diverifikasi',
    icon: <XCircle className="w-6 h-6" />,
    variant: 'warning',
  },
]

export interface StatusHasilEvaluasiPickerProps {
  value: StatusHasilEvaluasi | null
  onChange: (value: StatusHasilEvaluasi) => void
  komentarTrim?: string
}

export function StatusHasilEvaluasiPicker({
  value,
  onChange,
  komentarTrim = '',
}: StatusHasilEvaluasiPickerProps) {
  return (
    <>
      <OptionCardPicker<StatusHasilEvaluasi>
        options={OPTIONS}
        value={value}
        onChange={onChange}
        label="Hasil Evaluasi"
        required
      />
      {value === STATUS_HASIL_EVALUASI.TIDAK_SESUAI && !komentarTrim && (
        <InfoCard variant="warning" className="mt-2 flex items-start gap-2">
          <p className="text-[10px] text-amber-800">Catatan wajib diisi jika hasil Perlu Perbaikan.</p>
        </InfoCard>
      )}
    </>
  )
}
