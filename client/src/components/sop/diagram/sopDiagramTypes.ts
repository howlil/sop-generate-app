/** Re-export dari domain SOP agar diagram dan seed pakai satu sumber. */
export type { ProsedurStepType, ProsedurRow } from '@/lib/types/sop'

import type { ProsedurRow as ProsedurRowType } from '@/lib/types/sop'

export interface LayoutConfig {
  widthKegiatan?: number
  widthKelengkapan?: number
  widthWaktu?: number
  widthOutput?: number
  widthKeterangan?: number
  firstPageSteps?: number
  nextPageSteps?: number
}

export interface Implementer {
  id: string
  name: string
}

export interface SOPStep {
  seq_number: number
  name: string
  type: string
  id_implementer?: string
  /** Step id for BPMN (e.g. row id or 'start-terminator' / 'end-terminator') */
  id_step?: string
  /** Row id for next step when decision answer is Yes */
  id_next_step_if_yes?: string
  /** Row id for next step when decision answer is No */
  id_next_step_if_no?: string
}

/** Single point for arrow path (start, end, or bend) */
export interface ArrowPathPoint {
  x: number
  y: number
}

/** Persisted arrow path config per connection (source of truth when present) */
export interface ArrowConnectionConfig {
  sSide: 'top' | 'bottom' | 'left' | 'right'
  eSide: 'top' | 'bottom' | 'left' | 'right'
  startPoint: ArrowPathPoint
  endPoint: ArrowPathPoint
  bendPoints: ArrowPathPoint[]
}

/** Map connectionId → persisted path config. Parent stores; child uses for manual priority. */
export type ArrowConfig = Record<string, ArrowConnectionConfig>

/** Label position for arrow label or BPMN decision text */
export interface LabelPosition {
  x: number
  y: number
}

/** Custom labels for decision branches; key e.g. "step-3-yes" | "step-3-no" */
export type CustomLabels = Record<string, string>

/** Positions for labels; key = connectionId (arrow) or "step-{seq}" (BPMN decision text) */
export type LabelPositions = Record<string, LabelPosition>

/** Label config: custom text + persisted positions */
export interface LabelConfig {
  custom_labels?: CustomLabels
  positions?: LabelPositions
}

export function getFullTimeUnit(unit: string): string {
  const map: Record<string, string> = {
    h: 'Jam',
    m: 'Menit',
    d: 'Hari',
    w: 'Minggu',
    mo: 'Bulan',
    y: 'Tahun',
  }
  return map[unit] ?? unit
}

/** Konversi ProsedurRow[] + implementers → SOPStep[] untuk diagram Flowchart/BPMN. */
export function rowsToSteps(
  rows: ProsedurRowType[],
  implementers: Implementer[]
): SOPStep[] {
  return rows.map((row) => {
    const implementerId = Object.keys(row.pelaksana).find(
      (key) => row.pelaksana[key] && row.pelaksana[key] !== ''
    )
    const type =
      row.type ??
      (row.no === 1 || row.no === rows.length ? 'terminator' : 'task')
    return {
      seq_number: row.no,
      name: row.kegiatan,
      type,
      id_implementer: implementerId || implementers[0]?.id,
      id_step: row.id,
      id_next_step_if_yes: row.id_next_step_if_yes,
      id_next_step_if_no: row.id_next_step_if_no,
    }
  })
}
