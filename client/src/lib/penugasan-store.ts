/**
 * Store untuk daftar penugasan evaluasi SOP (shared antara list dan halaman edit).
 */

export type StatusEvaluasi = 'Belum Ditugaskan' | 'Sudah Ditugaskan' | 'Selesai' | 'Terverifikasi'

export interface SOPItem {
  id: string
  nama: string
  nomor: string
  status?: 'Sesuai' | 'Perlu Perbaikan' | 'Tidak Sesuai'
  catatan?: string
  rekomendasi?: string
}

export interface Penugasan {
  id: string
  jenis: 'Inisiasi Biro' | 'Request OPD'
  tanggalRequest?: string
  opd: string
  sopList: SOPItem[]
  timMonev?: string
  status: StatusEvaluasi
  catatan: string
  evaluationCaseId?: string
  tanggalEvaluasi?: string
  isVerified?: boolean
  nomorBA?: string
  tanggalVerifikasi?: string
  kepalaBiro?: string
}

let list: Penugasan[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((cb) => cb())
}

export function getPenugasanList(): Penugasan[] {
  return [...list]
}

export function getPenugasanById(id: string): Penugasan | undefined {
  return list.find((p) => p.id === id)
}

export function setPenugasanList(next: Penugasan[]) {
  list = [...next]
  notify()
}

export function addPenugasan(p: Penugasan) {
  list = [...list, p]
  notify()
}

export function updatePenugasan(id: string, patch: Partial<Penugasan>) {
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return
  list = list.map((p) => (p.id === id ? { ...p, ...patch } : p))
  notify()
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
