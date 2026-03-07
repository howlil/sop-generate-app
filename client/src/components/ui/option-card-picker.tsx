import type { ReactNode } from 'react'
import { FormField } from '@/components/ui/form-field'
import { cn } from '@/utils/cn'

export type OptionCardVariant = 'success' | 'warning' | 'neutral' | 'info'

export interface OptionCardOption<T> {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  variant?: OptionCardVariant
}

const VARIANT_STYLES: Record<OptionCardVariant, { selected: string; icon: string; label: string }> = {
  success: {
    selected: 'border-green-600 bg-green-50',
    icon: 'text-green-600',
    label: 'text-green-600',
  },
  warning: {
    selected: 'border-amber-600 bg-amber-50',
    icon: 'text-amber-600',
    label: 'text-amber-600',
  },
  neutral: {
    selected: 'border-gray-600 bg-gray-50',
    icon: 'text-gray-600',
    label: 'text-gray-600',
  },
  info: {
    selected: 'border-blue-600 bg-blue-50',
    icon: 'text-blue-600',
    label: 'text-blue-600',
  },
}

const BASE_OPTION_CLASS =
  'p-3 rounded-md border transition-all border-gray-200 bg-white hover:bg-gray-50 text-left w-full'
const UNSELECTED_LABEL = 'text-gray-700'
const UNSELECTED_ICON = 'text-gray-400'

export interface OptionCardPickerProps<T> {
  /** Opsi yang bisa dipilih (value, label, deskripsi, icon, variant warna) */
  options: OptionCardOption<T>[]
  /** Nilai terpilih */
  value: T | null
  /** Callback saat opsi dipilih */
  onChange: (value: T) => void
  /** Label form (optional; jika tidak ada, tidak pakai FormField wrapper) */
  label?: ReactNode
  required?: boolean
  /** Layout: grid cols */
  columns?: 2 | 3 | 4
  className?: string
  /** Class untuk tiap kartu opsi */
  optionClassName?: string
}

function isEqual<T>(a: T | null, b: T): boolean {
  if (a === null) return false
  return a === b
}

/**
 * Picker berbasis kartu: beberapa opsi dengan icon + label + deskripsi, satu yang terpilih.
 * Agnostic terhadap domain; konten dan value sepenuhnya dari props.
 */
export function OptionCardPicker<T>({
  options,
  value,
  onChange,
  label,
  required,
  columns = 2,
  className,
  optionClassName,
}: OptionCardPickerProps<T>) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns]

  const content = (
    <div className={cn('grid gap-2', gridClass, className)}>
      {options.map((opt) => {
        const selected = isEqual(value, opt.value)
        const variant = opt.variant ?? 'neutral'
        const styles = VARIANT_STYLES[variant]
        return (
          <button
            key={String(opt.value)}
            type="button"
            className={cn(
              BASE_OPTION_CLASS,
              selected ? styles.selected : '',
              optionClassName
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon && (
              <div
                className={cn(
                  'w-6 h-6 mx-auto mb-1 flex items-center justify-center',
                  selected ? styles.icon : UNSELECTED_ICON
                )}
              >
                {opt.icon}
              </div>
            )}
            <span
              className={cn(
                'text-xs font-semibold block',
                selected ? styles.label : UNSELECTED_LABEL
              )}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {opt.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  if (label != null) {
    return (
      <FormField label={label} required={required}>
        {content}
      </FormField>
    )
  }

  return content
}
