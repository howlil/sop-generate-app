import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface ArsipSearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  id: string
}

export function ArsipSearchField({ value, onChange, placeholder, id }: ArsipSearchFieldProps) {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-10 text-base"
        aria-label={placeholder}
      />
    </div>
  )
}
