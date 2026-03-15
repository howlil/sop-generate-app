import { useCallback } from 'react'
import { useAuditLogStore, addAuditEntry } from '@/lib/stores/audit-log-store'
import type { AuditAction } from '@/lib/types/audit'
import type { StatusSOP } from '@/lib/types/sop'

export function useAuditLog() {
  const entries = useAuditLogStore((s) => s.entries)

  const logAction = useCallback(
    (params: {
      sopId: string
      action: AuditAction
      aktorNama: string
      aktorRole: string
      statusSebelum?: StatusSOP
      statusSesudah: StatusSOP
      keterangan?: string
    }) => {
      addAuditEntry(params)
    },
    []
  )

  const getEntriesForSop = useCallback(
    (sopId: string) =>
      entries
        .filter((e) => e.sopId === sopId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [entries]
  )

  return { logAction, getEntriesForSop }
}
