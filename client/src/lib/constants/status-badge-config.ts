/**
 * Konfigurasi tampilan badge per domain & status.
 * Dipakai oleh StatusBadge agar komponen UI tetap agnostik; mapping domain/status → style/label di sini.
 */
import type { StatusDomain } from '@/lib/constants/status-domains'

const DEFAULT_CLASS = 'bg-gray-100 text-gray-700'

/** Kelas warna per status SOP / hasil evaluasi. */
const sopStatusClasses: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  'Sedang Disusun': 'bg-slate-100 text-slate-700',
  'Diperiksa Kepala OPD': 'bg-blue-100 text-blue-700',
  'Revisi dari Kepala OPD': 'bg-amber-100 text-amber-700',
  'Siap Dievaluasi': 'bg-sky-100 text-sky-700',
  Berlaku: 'bg-emerald-100 text-emerald-700',
  'Diajukan Evaluasi': 'bg-amber-100 text-amber-700',
  'Sedang Dievaluasi': 'bg-blue-100 text-blue-700',
  'Selesai Evaluasi': 'bg-emerald-100 text-emerald-700',
  'Dievaluasi Tim Evaluasi': 'bg-violet-100 text-violet-700',
  'Revisi dari Tim Evaluasi': 'bg-orange-100 text-orange-700',
  'Terverifikasi dari Biro Organisasi': 'bg-teal-100 text-teal-700',
  Dicabut: 'bg-red-100 text-red-700',
  Batal: 'bg-gray-200 text-gray-600',
  Sesuai: 'bg-green-100 text-green-700',
  'Perlu Perbaikan': 'bg-amber-100 text-amber-700',
  'Revisi Biro': 'bg-amber-100 text-amber-700',
}

const penugasanEvaluasiClasses: Record<string, string> = {
  assigned: 'bg-purple-100 text-purple-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const evaluasiBiroClasses: Record<string, string> = {
  'Sudah Ditugaskan': 'bg-green-100 text-green-700',
  'Belum Ditugaskan': 'bg-yellow-100 text-yellow-700',
  Selesai: 'bg-blue-100 text-blue-700',
  Terverifikasi: 'bg-indigo-100 text-indigo-700',
}

const timStatusClasses: Record<string, string> = {
  Aktif: 'bg-green-100 text-green-700',
  Nonaktif: 'bg-gray-100 text-gray-700',
}

/** Label tampilan per status (jika berbeda dari nilai status). */
const penugasanLabels: Record<string, string> = {
  assigned: 'Ditugaskan',
  'in-progress': 'Dalam Pelaksanaan',
  completed: 'Selesai (Hasil Evaluasi)',
}

export interface StatusBadgeConfig {
  label: string
  className: string
}

export function getStatusBadgeConfig(domain: StatusDomain, status: string): StatusBadgeConfig {
  let className = DEFAULT_CLASS
  switch (domain) {
    case 'sop':
      className = sopStatusClasses[status] ?? DEFAULT_CLASS
      break
    case 'penugasan-evaluasi':
      className = penugasanEvaluasiClasses[status] ?? DEFAULT_CLASS
      break
    case 'evaluasi-biro':
      className = evaluasiBiroClasses[status] ?? DEFAULT_CLASS
      break
    case 'tim-penyusun':
      className = timStatusClasses[status] ?? DEFAULT_CLASS
      break
    default:
      break
  }

  let label = status
  if (domain === 'penugasan-evaluasi' && penugasanLabels[status]) {
    label = penugasanLabels[status]
  }

  return { label, className }
}
