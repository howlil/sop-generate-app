/**
 * Store audit log SOP — Zustand + persist.
 * Mencatat setiap perubahan status SOP: siapa, role apa, dari status apa, ke status apa, kapan.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuditLogEntry, AuditAction } from '@/lib/types/audit'
import type { StatusSOP } from '@/lib/types/sop'
import { generateId } from '@/utils/generate-id'

interface AuditLogState {
  entries: AuditLogEntry[]
  addEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void
  getEntriesForSop: (sopId: string) => AuditLogEntry[]
}

export const useAuditLogStore = create<AuditLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => {
        const newEntry: AuditLogEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }
        set((s) => ({ entries: [newEntry, ...s.entries] }))
      },
      getEntriesForSop: (sopId) =>
        get().entries.filter((e) => e.sopId === sopId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    }),
    { name: 'sop-audit-log', storage: createJSONStorage(() => localStorage) }
  )
)

export function addAuditEntry(params: {
  sopId: string
  action: AuditAction
  aktorNama: string
  aktorRole: string
  statusSebelum?: StatusSOP
  statusSesudah: StatusSOP
  keterangan?: string
}): void {
  useAuditLogStore.getState().addEntry(params)
}
