/**
 * Cell components for DetailSOPProsedurEditor table
 * Extracted to improve readability and testability
 */

import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import type { ProsedurRow } from '@/components/sop/types'

// ==================== Kegiatan Cell ====================

export interface KegiatanCellProps {
  value: string
  onChange: (value: string) => void
}

export function KegiatanCell({ value, onChange }: KegiatanCellProps) {
  return (
    <Textarea
      className="text-xs min-h-[40px] px-1.5 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ==================== Type Cell ====================

export interface TypeCellProps {
  row: ProsedurRow
  index: number
  totalRows: number
  onTypeChange: (type: ProsedurRow['type']) => void
}

export function TypeCell({ row, index, totalRows, onTypeChange }: TypeCellProps) {
  const isDecision = row.type === 'decision'
  const yesIndex = row.id_next_step_if_yes
    ? row.id_next_step_if_yes
    : -1
  const noIndex = row.id_next_step_if_no
    ? row.id_next_step_if_no
    : -1
  const hasDecisionTarget = yesIndex !== -1 || noIndex !== -1
  
  const defaultType = index === 0 || index === totalRows - 1 ? 'terminator' : 'task'
  const displayType = row.type || defaultType

  return (
    <div className="space-y-1">
      <select
        className="w-full h-8 rounded-md border border-gray-200 px-0.5 text-xs"
        value={displayType}
        onChange={(e) => onTypeChange(e.target.value as ProsedurRow['type'])}
      >
        <option value="task">Task</option>
        <option value="decision">Decision</option>
        <option value="terminator">
          {index === 0 ? 'Start' : index === totalRows - 1 ? 'End' : 'Terminator'}
        </option>
      </select>
      {isDecision && (
        <p className="text-[10px] text-gray-500">
          {!hasDecisionTarget
            ? 'Belum diatur cabang Ya/Tidak.'
            : [yesIndex !== -1 ? `Ya → ${yesIndex + 1}` : null, noIndex !== -1 ? `Tidak → ${noIndex + 1}` : null]
                .filter(Boolean)
                .join(' • ')}
        </p>
      )}
    </div>
  )
}

// ==================== Implementer Cell ====================

export interface ImplementerCellProps {
  row: ProsedurRow
  implementers: { id: string; name: string }[]
  onImplementerChange: (implementerId: string) => void
}

export function ImplementerCell({ row, implementers, onImplementerChange }: ImplementerCellProps) {
  const selectedId = Object.keys(row.pelaksana).find((k) => row.pelaksana[k]) || implementers[0]?.id || ''

  return (
    <select
      className="w-full h-8 rounded-md border border-gray-200 px-0.5 text-xs"
      value={selectedId}
      onChange={(e) => onImplementerChange(e.target.value)}
    >
      {implementers.map((impl) => (
        <option key={impl.id} value={impl.id}>
          {impl.name}
        </option>
      ))}
    </select>
  )
}

// ==================== Mutu Kelengkapan Cell ====================

export interface MutuKelengkapanCellProps {
  value: string
  onChange: (value: string) => void
}

export function MutuKelengkapanCell({ value, onChange }: MutuKelengkapanCellProps) {
  return (
    <Textarea
      className="text-xs min-h-[36px] px-1.5 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ==================== Mutu Waktu Cell ====================

export interface MutuWaktuCellProps {
  value: string
  onChange: (amount: string, unit: string) => void
}

export function MutuWaktuCell({ value, onChange }: MutuWaktuCellProps) {
  const match = (value || '').match(/^(\d+)\s*(\w+)?/i)
  const amount = match ? match[1] : ''
  const rawUnit = match && match[2] ? match[2].toLowerCase() : ''
  
  const unit = rawUnit.startsWith('menit')
    ? 'm'
    : rawUnit.startsWith('jam')
      ? 'h'
      : rawUnit.startsWith('hari')
        ? 'd'
        : rawUnit.startsWith('minggu')
          ? 'w'
          : rawUnit.startsWith('bulan')
            ? 'mo'
            : 'm'

  const unitLabelMap: Record<string, string> = {
    m: 'Menit',
    h: 'Jam',
    d: 'Hari',
    w: 'Minggu',
    mo: 'Bulan',
  }

  return (
    <div className="flex items-center gap-0 rounded-md border border-gray-200 [&_input]:rounded-r-none [&_input]:border-r-0 [&_input]:focus-visible:ring-0 [&_input]:focus-visible:ring-offset-0">
      <Input
        type="number"
        min={0}
        className="h-8 text-xs w-10 rounded-l-md"
        value={amount}
        onChange={(e) => onChange(e.target.value, unit)}
      />
      <select
        className="h-8 w-16 min-w-0 rounded-r-md border-0 border-l border-gray-200 bg-transparent pl-1 pr-5 text-xs outline-none focus:ring-0 focus:ring-offset-0"
        value={unit}
        onChange={(e) => onChange(amount, e.target.value)}
      >
        <option value="m">Menit</option>
        <option value="h">Jam</option>
        <option value="d">Hari</option>
        <option value="w">Minggu</option>
        <option value="mo">Bulan</option>
      </select>
    </div>
  )
}

// ==================== Output Cell ====================

export interface OutputCellProps {
  value: string
  onChange: (value: string) => void
}

export function OutputCell({ value, onChange }: OutputCellProps) {
  return (
    <Textarea
      className="text-xs min-h-[36px] px-1.5 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ==================== Keterangan Cell ====================

export interface KeteranganCellProps {
  value: string
  onChange: (value: string) => void
}

export function KeteranganCell({ value, onChange }: KeteranganCellProps) {
  return (
    <Textarea
      className="text-xs min-h-[36px] px-1.5 py-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
