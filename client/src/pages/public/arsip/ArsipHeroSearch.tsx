import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface ArsipHeroSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ArsipHeroSearch({ value, onChange }: ArsipHeroSearchProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="arsip-global-search" className="sr-only">
        Cari judul, nomor SOP, atau nama OPD
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          id="arsip-global-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari judul, nomor SOP, atau nama OPD…"
          className="h-12 rounded-xl border-slate-200 pl-12 text-base shadow-sm"
          autoComplete="off"
        />
      </div>
      <p className="text-sm text-slate-500">
        Contoh: Dinas Kesehatan, 001/SOP/2024 — hasil bisa dibaca langsung di panel kanan tanpa pindah halaman.
      </p>
    </div>
  )
}
