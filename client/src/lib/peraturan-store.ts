/**
 * Store untuk database peraturan (shared).
 * Termasuk action: setPeraturanDicabut(id) untuk menandai peraturan dicabut.
 */

export type StatusPeraturan = 'Berlaku' | 'Dicabut'

export interface Peraturan {
  id: string
  jenisPeraturan: string
  nomor: string
  tahun: string
  tentang: string
  tanggalTerbit: string
  status: StatusPeraturan
  digunakan: number
  fileUrl?: string
  createdBy: string
  version: number
}

const STORAGE_KEY = 'peraturan_list'

let list: Peraturan[] = []
const listeners = new Set<() => void>()

function load(): Peraturan[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Peraturan[]
  } catch {
    // ignore
  }
  return []
}

function save(next: Peraturan[]) {
  list = [...next]
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // ignore
    }
  }
  listeners.forEach((cb) => cb())
}

function notify() {
  listeners.forEach((cb) => cb())
}

/** Inisialisasi: gunakan data dari localStorage jika ada, else pakai seed. */
export function initPeraturanList(seed: Peraturan[]) {
  const fromStorage = load()
  if (fromStorage.length > 0) {
    list = fromStorage
  } else {
    list = [...seed]
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      } catch {
        // ignore
      }
    }
  }
  notify()
}

export function getPeraturanList(): Peraturan[] {
  if (list.length === 0 && typeof window !== 'undefined') {
    const fromStorage = load()
    if (fromStorage.length > 0) list = fromStorage
  }
  return [...list]
}

export function getPeraturanById(id: string): Peraturan | undefined {
  const all = list.length ? list : getPeraturanList()
  return all.find((p) => p.id === id)
}

/** Daftar peraturan dengan status Dicabut. */
export function getPeraturanDicabut(): Peraturan[] {
  return getPeraturanList().filter((p) => p.status === 'Dicabut')
}

export function setPeraturanList(next: Peraturan[]) {
  save(next)
}

export function addPeraturan(p: Peraturan) {
  save([...list, p])
}

export function updatePeraturan(id: string, patch: Partial<Peraturan>) {
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return
  save(list.map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

/**
 * Action: tandai peraturan sebagai Dicabut.
 * Jika sudah Dicabut, ubah kembali ke Berlaku (toggle).
 */
export function setPeraturanDicabut(id: string): boolean {
  const p = list.find((x) => x.id === id)
  if (!p) return false
  const nextStatus: StatusPeraturan = p.status === 'Berlaku' ? 'Dicabut' : 'Berlaku'
  updatePeraturan(id, { status: nextStatus })
  return true
}

/**
 * Action: set status peraturan ke Dicabut (hanya sekali arah).
 * Tidak mengubah jika sudah Dicabut.
 */
export function cabutPeraturan(id: string): boolean {
  const p = list.find((x) => x.id === id)
  if (!p || p.status === 'Dicabut') return false
  updatePeraturan(id, { status: 'Dicabut' })
  return true
}

export function removePeraturan(id: string) {
  save(list.filter((p) => p.id !== id))
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
