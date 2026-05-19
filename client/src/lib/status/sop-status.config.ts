import type { StatusSOP } from '@/types/dto/sop.dto'
import type { StatusBadgeColors } from './status-badge.types'
import { STATUS_BADGE_COLORS_DEFAULT } from './status-badge.types'

/** Warna badge per nilai status dokumen (label dari server). */
export const SOP_STATUS_BADGE_COLORS: Record<string, StatusBadgeColors> = {
  DRAFT: { color: 'text-gray-700', bgColor: 'bg-gray-100' },
  SEDANG_DISUSUN: { color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  SIAP_DIEVALUASI: { color: 'text-cyan-800', bgColor: 'bg-cyan-100' },
  DIAJUKAN_EVALUASI: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  SEDANG_DIEVALUASI: { color: 'text-amber-800', bgColor: 'bg-amber-100' },
  REVISI_DARI_EVALUATOR: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  SIAP_DIVERIFIKASI: { color: 'text-teal-800', bgColor: 'bg-teal-100' },
  DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI: {
    color: 'text-violet-800',
    bgColor: 'bg-violet-100',
  },
  BERLAKU: { color: 'text-emerald-800', bgColor: 'bg-emerald-100' },
  DIGANTIKAN: { color: 'text-slate-700', bgColor: 'bg-slate-100' },
  DICABUT: { color: 'text-rose-800', bgColor: 'bg-rose-100' },
}

const SOP_STATUS_FILTER_VALUES = [
  'DRAFT',
  'SEDANG_DISUSUN',
  'SIAP_DIEVALUASI',
  'DIAJUKAN_EVALUASI',
  'SEDANG_DIEVALUASI',
  'REVISI_DARI_EVALUATOR',
  'SIAP_DIVERIFIKASI',
  'DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI',
  'BERLAKU',
  'DICABUT',
] as const satisfies readonly StatusSOP[]

export function getSopStatusColors(status: string): StatusBadgeColors {
  return SOP_STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS_DEFAULT
}

/** Opsi filter — label placeholder; halaman filter memakai label dari API bila tersedia. */
export const SOP_STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: 'Semua Status' },
  ...SOP_STATUS_FILTER_VALUES.map((value) => ({
    value,
    label: value.replaceAll('_', ' '),
  })),
] as const
