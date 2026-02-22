import * as React from 'react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
  > {
  value?: string
  onValueChange?: (value: string) => void
  /** Opsi dari array (alternatif dari children <option>) */
  options?: SelectOption[]
  /** Placeholder untuk value kosong (option disabled dengan value "") */
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      value,
      onValueChange,
      options,
      placeholder,
      children,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    }

    return (
      <select
        ref={ref}
        value={value ?? ''}
        onChange={handleChange}
        className={cn(
          'flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs',
          'focus:outline-none focus:ring-1 focus:ring-blue-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          className
        )}
        {...props}
      >
        {placeholder != null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options != null
          ? options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))
          : children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export { Select }
