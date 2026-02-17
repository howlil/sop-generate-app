export type ProsedurStepType = 'terminator' | 'task' | 'decision'

export interface ProsedurRow {
  id: string
  no: number
  kegiatan: string
  pelaksana: Record<string, string>
  mutu_kelengkapan: string
  mutu_waktu: string
  output: string
  keterangan: string
  time?: number
  time_unit?: string
  /** Override step type for diagram (default: terminator for first/last, else task) */
  type?: ProsedurStepType
  /** Row id for next step when decision answer is Yes */
  id_next_step_if_yes?: string
  /** Row id for next step when decision answer is No */
  id_next_step_if_no?: string
}

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
