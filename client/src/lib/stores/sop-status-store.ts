/**
 * Store override status SOP per id — Zustand + persist.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StatusSOP } from '@/lib/types/sop'

interface SopStatusState {
  overrides: Record<string, StatusSOP>
  setSopStatusOverride: (sopId: string, status: StatusSOP) => void
  getSopStatusOverride: (sopId: string) => StatusSOP | undefined
}

export const useSopStatusStore = create<SopStatusState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setSopStatusOverride: (sopId, status) =>
        set((s) => ({ overrides: { ...s.overrides, [sopId]: status } })),
      getSopStatusOverride: (sopId) => get().overrides[sopId],
    }),
    { name: 'sop-status-override', storage: createJSONStorage(() => localStorage) }
  )
)

export function mergeSopStatus<T extends { id: string; status: StatusSOP }>(list: T[]): T[] {
  const overrides = useSopStatusStore.getState().overrides
  return list.map((item) => {
    const override = overrides[item.id]
    if (override !== undefined) return { ...item, status: override }
    return item
  })
}

export function getSopStatusOverride(sopId: string): StatusSOP | undefined {
  return useSopStatusStore.getState().getSopStatusOverride(sopId)
}

export function setSopStatusOverride(sopId: string, status: StatusSOP): void {
  useSopStatusStore.getState().setSopStatusOverride(sopId, status)
}
