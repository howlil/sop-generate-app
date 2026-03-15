/**
 * Store override metadata SOP (lastEditedBy, lastEditedAt) per sopId — Zustand + persist.
 * Dipakai untuk mencatat siapa terakhir mengedit SOP pada shared editing Tim Penyusun.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SopMetaEntry {
  lastEditedBy: string
  lastEditedAt: string
}

interface SopMetaState {
  metas: Record<string, SopMetaEntry>
  setSopMeta: (sopId: string, entry: SopMetaEntry) => void
  getSopMeta: (sopId: string) => SopMetaEntry | undefined
}

export const useSopMetaStore = create<SopMetaState>()(
  persist(
    (set, get) => ({
      metas: {},
      setSopMeta: (sopId, entry) =>
        set((s) => ({ metas: { ...s.metas, [sopId]: entry } })),
      getSopMeta: (sopId) => get().metas[sopId],
    }),
    { name: 'sop-meta-override', storage: createJSONStorage(() => localStorage) }
  )
)

export function setSopMeta(sopId: string, entry: SopMetaEntry): void {
  useSopMetaStore.getState().setSopMeta(sopId, entry)
}

export function getSopMeta(sopId: string): SopMetaEntry | undefined {
  return useSopMetaStore.getState().getSopMeta(sopId)
}

export function mergeSopMeta<T extends { id: string; lastEditedBy?: string; lastEditedAt?: string }>(list: T[]): T[] {
  const metas = useSopMetaStore.getState().metas
  return list.map((item) => {
    const meta = metas[item.id]
    if (!meta) return item
    return { ...item, lastEditedBy: meta.lastEditedBy, lastEditedAt: meta.lastEditedAt }
  })
}
