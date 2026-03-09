/**
 * Store verifikasi batch (batch evaluasi per OPD) — Zustand.
 */
import { create } from 'zustand'
import type { VerifikasiBatch } from '@/lib/types/verifikasi-batch'

interface VerifikasiBatchState {
  list: VerifikasiBatch[]
  setList: (next: VerifikasiBatch[]) => void
  add: (p: VerifikasiBatch) => void
  update: (id: string, patch: Partial<VerifikasiBatch>) => void
  getById: (id: string) => VerifikasiBatch | undefined
}

export const useVerifikasiBatchStore = create<VerifikasiBatchState>()((set, get) => ({
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

export function getVerifikasiBatchList(): VerifikasiBatch[] {
  return useVerifikasiBatchStore.getState().list
}

export function getVerifikasiBatchById(id: string): VerifikasiBatch | undefined {
  return useVerifikasiBatchStore.getState().getById(id)
}

export function setVerifikasiBatchList(next: VerifikasiBatch[]) {
  useVerifikasiBatchStore.getState().setList(next)
}

export function updateVerifikasiBatch(id: string, patch: Partial<VerifikasiBatch>) {
  useVerifikasiBatchStore.getState().update(id, patch)
}

export function subscribeVerifikasiBatch(cb: () => void): () => void {
  return useVerifikasiBatchStore.subscribe(cb)
}
