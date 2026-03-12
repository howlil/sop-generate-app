/**
 * Konfigurasi tampilan badge per status SOP.
 * Dipakai oleh StatusBadge; daftar status mengacu ke STATUS_SOP_ALL (lib/types/sop) — single source of truth.
 */
import type { StatusSOP } from '@/lib/types/sop'
import { STATUS_SOP_ALL } from '@/lib/types/sop'

const DEFAULT_CLASS = 'bg-gray-100 text-gray-700'

/**
 * Kelas warna per status SOP. Harus 1:1 dengan StatusSOP di lib/types/sop (STATUS_SOP_ALL).
 * Hanya status berikut yang dianggap berlaku.
 */
const sopStatusStyleOverrides: Partial<Record<StatusSOP, string>> = {
  Draft: 'bg-gray-100 text-gray-700',
  'Sedang Disusun': 'bg-slate-100 text-slate-700',
  'Siap Dievaluasi': 'bg-sky-100 text-sky-700',
  'Diajukan Evaluasi': 'bg-amber-100 text-amber-700',
  'Sedang Dievaluasi': 'bg-violet-100 text-violet-700',
  'Revisi dari Tim Evaluasi': 'bg-orange-100 text-orange-700',
  'Siap Diverifikasi': 'bg-teal-100 text-teal-700',
  'Diverifikasi Biro Organisasi': 'bg-teal-100 text-teal-700',
  Berlaku: 'bg-emerald-100 text-emerald-700',
  Dicabut: 'bg-red-100 text-red-700',
}

/** Map final: STATUS_SOP_ALL + overrides. Semua StatusSOP terjamin punya kelas. */
const sopStatusClasses: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const s of STATUS_SOP_ALL) {
    map[s] = sopStatusStyleOverrides[s] ?? DEFAULT_CLASS
  }
  return map
})()

export interface StatusBadgeConfig {
  label: string
  className: string
}

/** Mapping status → config (label + class). Untuk status di luar SOP, pakai DEFAULT_CLASS. */
export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  const className = sopStatusClasses[status] ?? DEFAULT_CLASS
  const label = status
  return { label, className }
}
