import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/cn'

export interface FormFieldProps {
  /** Teks atau konten label (bisa string atau ReactNode untuk label dengan inline style) */
  label: ReactNode
  /** Field wajib diisi → tampil " *" di label */
  required?: boolean
  /** Kontrol (Input, Select, Textarea, dll.) */
  children: React.ReactNode
  className?: string
  /** Id elemen kontrol untuk a11y (htmlFor pada label) */
  htmlFor?: string
  /** Label secondary/muted (gray-500) */
  variant?: 'default' | 'muted'
}

/**
 * Satu baris form: label + kontrol. Spacing konsisten (space-y-1.5).
 * Gunakan untuk form filter, dialog, form wizard.
 */
export function FormField({
  label,
  required,
  children,
  className,
  htmlFor,
  variant = 'default',
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label required={required} variant={variant} htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
    </div>
  )
}
