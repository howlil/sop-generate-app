/**
 * Store peraturan — Zustand + persist.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Peraturan } from '@/lib/types/peraturan'

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
