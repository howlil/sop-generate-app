/**
 * Store tim penyusun per OPD — satu OPD punya banyak tim penyusun.
 */
import { create } from 'zustand'
import type { TimPenyusun } from '@/lib/types/tim'

interface TimPenyusunState {
  list: TimPenyusun[]
  setList: (next: TimPenyusun[]) => void
  add: (t: TimPenyusun) => void
  update: (id: string, patch: Partial<TimPenyusun>) => void
  remove: (id: string) => void
  getByOpdId: (opdId: string) => TimPenyusun[]
}

export const useTimPenyusunStore = create<TimPenyusunState>()((set, get) => ({
  list: [],
  setList: (next) => set({ list: [...next] }),
  add: (t) => set((s) => ({ list: [...s.list, t] })),
  update: (id, patch) =>
    set((s) => ({
      list: s.list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  remove: (id) => set((s) => ({ list: s.list.filter((t) => t.id !== id) })),
  getByOpdId: (opdId) => get().list.filter((t) => t.opdId === opdId),
}))

export function getTimPenyusunList(): TimPenyusun[] {
  return useTimPenyusunStore.getState().list
}

export function getTimPenyusunByOpdId(opdId: string): TimPenyusun[] {
  return useTimPenyusunStore.getState().getByOpdId(opdId)
}

export function setTimPenyusunList(next: TimPenyusun[]) {
  useTimPenyusunStore.getState().setList(next)
}

export function addTimPenyusun(t: TimPenyusun) {
  useTimPenyusunStore.getState().add(t)
}

export function updateTimPenyusun(id: string, patch: Partial<TimPenyusun>) {
  useTimPenyusunStore.getState().update(id, patch)
}

export function removeTimPenyusun(id: string) {
  useTimPenyusunStore.getState().remove(id)
}

export function subscribeTimPenyusun(cb: () => void): () => void {
  return useTimPenyusunStore.subscribe(cb)
}
