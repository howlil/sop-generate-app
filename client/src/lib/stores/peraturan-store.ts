/**
 * Store peraturan — Zustand + persist.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Peraturan, StatusPeraturan } from '@/lib/types/peraturan'

interface PeraturanState {
  list: Peraturan[]
  setList: (next: Peraturan[]) => void
  add: (p: Peraturan) => void
  update: (id: string, patch: Partial<Peraturan>) => void
  remove: (id: string) => void
  getById: (id: string) => Peraturan | undefined
  setDicabut: (id: string) => boolean
  cabut: (id: string) => boolean
}

export const usePeraturanStore = create<PeraturanState>()(
  persist(
    (set, get) => ({
      list: [],
      setList: (next) => set({ list: [...next] }),
      add: (p) => set((s) => ({ list: [...s.list, p] })),
      update: (id, patch) =>
        set((s) => {
          const idx = s.list.findIndex((p) => p.id === id)
          if (idx === -1) return s
          return { list: s.list.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
        }),
      remove: (id) => set((s) => ({ list: s.list.filter((p) => p.id !== id) })),
      getById: (id) => get().list.find((p) => p.id === id),
      setDicabut: (id) => {
        const p = get().list.find((x) => x.id === id)
        if (!p) return false
        get().update(id, { status: p.status === 'Berlaku' ? 'Dicabut' : 'Berlaku' })
        return true
      },
      cabut: (id) => {
        const p = get().list.find((x) => x.id === id)
        if (!p || p.status === 'Dicabut') return false
        get().update(id, { status: 'Dicabut' })
        return true
      },
    }),
    { name: 'peraturan_list', storage: createJSONStorage(() => localStorage) }
  )
)

export function getPeraturanList(): Peraturan[] {
  return usePeraturanStore.getState().list
}

export function getPeraturanById(id: string): Peraturan | undefined {
  return usePeraturanStore.getState().getById(id)
}

export function setPeraturanList(next: Peraturan[]): void {
  usePeraturanStore.getState().setList(next)
}

export function addPeraturan(p: Peraturan): void {
  usePeraturanStore.getState().add(p)
}

export function updatePeraturan(id: string, patch: Partial<Peraturan>): void {
  usePeraturanStore.getState().update(id, patch)
}

export function removePeraturan(id: string): void {
  usePeraturanStore.getState().remove(id)
}

export function initPeraturanList(seed: Peraturan[]): void {
  if (usePeraturanStore.getState().list.length === 0) {
    usePeraturanStore.getState().setList([...seed])
  }
}

export function setPeraturanDicabut(id: string): boolean {
  return usePeraturanStore.getState().setDicabut(id)
}

export function cabutPeraturan(id: string): boolean {
  return usePeraturanStore.getState().cabut(id)
}

export function getPeraturanDicabut(): Peraturan[] {
  return getPeraturanList().filter((p) => p.status === 'Dicabut')
}

export function subscribe(cb: () => void): () => void {
  return usePeraturanStore.subscribe(cb)
}
