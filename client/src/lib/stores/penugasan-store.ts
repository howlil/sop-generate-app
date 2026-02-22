/**
 * Store penugasan evaluasi — Zustand.
 */
import { create } from 'zustand'
import type { Penugasan } from '@/lib/types/penugasan'

interface PenugasanState {
  list: Penugasan[]
  setList: (next: Penugasan[]) => void
  add: (p: Penugasan) => void
  update: (id: string, patch: Partial<Penugasan>) => void
  getById: (id: string) => Penugasan | undefined
}

export const usePenugasanStore = create<PenugasanState>()((set, get) => ({
  list: [],
  setList: (next) => set({ list: [...next] }),
  add: (p) => set((s) => ({ list: [...s.list, p] })),
  update: (id, patch) =>
    set((s) => {
      const idx = s.list.findIndex((p) => p.id === id)
      if (idx === -1) return s
      return {
        list: s.list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }
    }),
  getById: (id) => get().list.find((p) => p.id === id),
}))

export function getPenugasanList(): Penugasan[] {
  return usePenugasanStore.getState().list
}

export function getPenugasanById(id: string): Penugasan | undefined {
  return usePenugasanStore.getState().getById(id)
}

export function setPenugasanList(next: Penugasan[]) {
  usePenugasanStore.getState().setList(next)
}

export function addPenugasan(p: Penugasan) {
  usePenugasanStore.getState().add(p)
}

export function updatePenugasan(id: string, patch: Partial<Penugasan>) {
  usePenugasanStore.getState().update(id, patch)
}

export function subscribe(cb: () => void): () => void {
  return usePenugasanStore.subscribe(cb)
}
