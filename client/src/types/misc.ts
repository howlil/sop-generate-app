/**
 * Diagram types
 */

export type DiagramType = 'FLOWCHART' | 'BPMN'
export type LangkahType = 'TERMINATOR' | 'TASK' | 'DECISION'

export interface DiagramNode {
  id: string
  type: LangkahType
  x: number
  y: number
  label: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: string
}

/**
 * Komentar types
 */

export type StatusKomentar = 'OPEN' | 'RESOLVED'

export interface Komentar {
  id: string
  sopDetailId: string
  userId: string
  isi: string
  status: StatusKomentar
  createdAt: string
}

/**
 * Manajemen OPD Form Types
 */

export interface KepalaFormState {
  name: string
  nip: string
  email: string
  phone: string
}

export interface FormTambahKepalaState {
  opdId: string
  name: string
  nip: string
  email: string
}

export interface PindahFormState {
  opdId: string
}

export interface PindahDialogPerson {
  name: string
  nip?: string
  email: string
}

export interface RiwayatDialogPerson {
  name: string
  nip?: string
}
