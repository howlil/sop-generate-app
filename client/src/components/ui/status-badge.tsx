import { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { StatusSOP, StatusHasilEvaluasi } from '@/lib/types/sop'
import type { StatusDomain } from '@/lib/constants/status-domains'

interface StatusBadgeProps {
  status: string
  domain: StatusDomain
  className?: string
  /** Optional custom label; if not provided, label is derived from status/domain */
  label?: ReactNode
}

/** Warna badge untuk status SOP (sumber: @/lib/types/sop). */
const sopStatusClasses: Record<StatusSOP | StatusHasilEvaluasi, string> = {
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

function getClassFor(domain: StatusDomain, status: string): string {
  switch (domain) {
    case 'sop':
      return sopStatusClasses[status as StatusSOP | StatusHasilEvaluasi] ?? 'bg-gray-100 text-gray-700'
    case 'penugasan-evaluasi':
      return penugasanEvaluasiClasses[status] ?? 'bg-gray-100 text-gray-700'
    case 'evaluasi-biro':
      return evaluasiBiroClasses[status] ?? 'bg-gray-100 text-gray-700'
    case 'tim-penyusun':
      return timStatusClasses[status] ?? 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const penugasanLabels: Record<string, string> = {
  assigned: 'Ditugaskan',
  'in-progress': 'Dalam Pelaksanaan',
  completed: 'Selesai (Hasil Evaluasi)',
}

export function StatusBadge({ status, domain, className, label }: StatusBadgeProps) {
  const baseClass =
    'inline-flex h-4 px-1.5 items-center rounded text-xs border-0 align-middle'
  const colorClass = getClassFor(domain, status)

  let finalLabel: ReactNode = label ?? status
  if (!label && domain === 'penugasan-evaluasi') {
    finalLabel = penugasanLabels[status] ?? status
  }

  return (
    <Badge className={cn(baseClass, colorClass, className)}>
      {finalLabel}
    </Badge>
  )
}

