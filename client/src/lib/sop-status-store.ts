/**
 * Store status SOP per id (single source of truth untuk nilai status).
 * Digunakan oleh Daftar SOP, SOP Saya, Detail SOP (penyusun & kepala OPD) agar perubahan status konsisten.
 */

import type { StatusSOP } from '@/lib/sop-status'

const storageKey = 'sop-status-override'

function loadOverrides(): Record<string, StatusSOP> {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed as Record<string, StatusSOP>
  } catch {
    return {}
  }
}

function saveOverrides(m: Record<string, StatusSOP>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(m))
  } catch {
    // ignore
  }
}

let overrides: Record<string, StatusSOP> = loadOverrides()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((cb) => cb())
}

export function getSopStatusOverride(sopId: string): StatusSOP | undefined {
  return overrides[sopId]
}

export function setSopStatusOverride(sopId: string, status: StatusSOP) {
  overrides[sopId] = status
  saveOverrides(overrides)
  notify()
}

/** Gabungkan status dari daftar dengan override dari store (override menang). */
export function mergeSopStatus<T extends { id: string; status: StatusSOP }>(list: T[]): T[] {
  return list.map((item) => {
    const override = getSopStatusOverride(item.id)
    if (override !== undefined) return { ...item, status: override }
    return item
  })
}

export function subscribeSopStatus(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
