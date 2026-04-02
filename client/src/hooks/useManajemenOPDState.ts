/**
 * Types for Manajemen OPD state management
 * Used by dialog components in kepala-biro-organisasi/manajemen-opd/
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
