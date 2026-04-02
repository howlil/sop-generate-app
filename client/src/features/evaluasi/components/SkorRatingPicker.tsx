/**
 * Picker skor 1–5 (untuk evaluasi OPD).
 */
import { FormField } from '@/components/ui/form-field'

const SKOR_OPTIONS = [1, 2, 3, 4, 5] as const

export interface SkorRatingPickerProps {
  value: number | null
  onChange: (value: number) => void
  label?: string
  hint?: string
}

export function SkorRatingPicker({
  value,
  onChange,
  label = 'Nilai evaluasi OPD (1–5)',
  hint = 'Setiap evaluasi SOP dapat disertai nilai evaluasi OPD.',
}: SkorRatingPickerProps) {
  return (
    <FormField label={label}>
      <div className="flex flex-wrap justify-center gap-1.5">
        {SKOR_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-md border text-sm font-semibold transition-all ${
              value === n
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {hint && <p className="text-[10px] text-gray-500 mt-1">{hint}</p>}
    </FormField>
  )
}
