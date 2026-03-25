/**
 * Notifikasi alur kerja (prototype): persist di localStorage untuk simulasi antar-role.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateId } from '@/utils/generate-id'
import type { RoleKey } from '@/lib/constants/roles'

export interface PipelineNotification {
  id: string
  title: string
  body: string
  /** Role yang sebaiknya melihat notifikasi ini */
  targetRole?: RoleKey
  createdAt: string
  read: boolean
}

interface State {
  items: PipelineNotification[]
  push: (n: Omit<PipelineNotification, 'id' | 'createdAt' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: () => void
}

export const usePipelineNotificationStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      push: (n) => {
        const item: PipelineNotification = {
          ...n,
          id: generateId(),
          createdAt: new Date().toISOString(),
          read: false,
        }
        set((s) => ({ items: [item, ...s.items].slice(0, 100) }))
      },
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'pipeline-notifications', storage: createJSONStorage(() => localStorage) }
  )
)

export function pushPipelineNotification(
  payload: Omit<PipelineNotification, 'id' | 'createdAt' | 'read'>
): void {
  usePipelineNotificationStore.getState().push(payload)
}
