/**
 * Store pelaksana SOP — Zustand + persist.
 * Dipakai di Kelola Pelaksana SOP (CRUD) dan di edit SOP (dropdown pelaksana).
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PelaksanaSOP } from '@/lib/types/sop'

interface PelaksanaState {
  list: PelaksanaSOP[]
  setList: (next: PelaksanaSOP[]) => void
  add: (p: PelaksanaSOP) => void
  update: (id: string, patch: Partial<PelaksanaSOP>) => void
  remove: (id: string) => void
  getById: (id: string) => PelaksanaSOP | undefined
}

export const usePelaksanaStore = create<PelaksanaState>()(
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
    }),
    { name: 'pelaksana_sop_list', storage: createJSONStorage(() => localStorage) }
  )
)
