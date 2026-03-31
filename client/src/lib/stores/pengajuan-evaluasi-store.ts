/**
 * Store Pengajuan Evaluasi per ERD-DESKRIPSI.md — Zustand
 * 
 * PengajuanEvaluasi menggantikan konsep "VerifikasiBatch" / "Terjadwal Evaluasi"
 * 
 * Constraint per SCHEMA-CONSTRAINTS.md:
 * - Maks 1 pengajuan aktif per OPD per jenis (di-enforce di service layer)
 * - Optimistic locking via field version
 */
import { create } from 'zustand'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'

interface PengajuanEvaluasiState {
  list: PengajuanEvaluasi[]
  setList: (next: PengajuanEvaluasi[]) => void
  add: (p: PengajuanEvaluasi) => void
  update: (id: string, patch: Partial<PengajuanEvaluasi>) => void
  getById: (id: string) => PengajuanEvaluasi | undefined
  getByOpdId: (opdId: string) => PengajuanEvaluasi[]
}

export const usePengajuanEvaluasiStore = create<PengajuanEvaluasiState>()((set, get) => ({
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
  getByOpdId: (opdId) => get().list.filter((p) => p.opdId === opdId),
}))

export function getPengajuanEvaluasiList(): PengajuanEvaluasi[] {
  return usePengajuanEvaluasiStore.getState().list
}

export function getPengajuanEvaluasiById(id: string): PengajuanEvaluasi | undefined {
  return usePengajuanEvaluasiStore.getState().getById(id)
}

export function getPengajuanEvaluasiByOpdId(opdId: string): PengajuanEvaluasi[] {
  return usePengajuanEvaluasiStore.getState().getByOpdId(opdId)
}

export function setPengajuanEvaluasiList(next: PengajuanEvaluasi[]) {
  usePengajuanEvaluasiStore.getState().setList(next)
}

export function updatePengajuanEvaluasi(id: string, patch: Partial<PengajuanEvaluasi>) {
  usePengajuanEvaluasiStore.getState().update(id, patch)
}

export function subscribePengajuanEvaluasi(cb: () => void): () => void {
  return usePengajuanEvaluasiStore.subscribe(cb)
}
