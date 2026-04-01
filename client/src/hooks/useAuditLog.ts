import { useState, useCallback, useMemo } from 'react'

export interface AuditLogEntry {
  id: string
  sopId: string
  action: string
  userId: string
  userName: string
  timestamp: string
  details?: string
}

const STORAGE_KEY = 'audit_log'

/**
 * Hook to manage audit log
 * @deprecated Use API instead
 */
export function useAuditLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])

  const logAction = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
      const newEntry: AuditLogEntry = {
        ...entry,
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
      setEntries((prev) => [...prev, newEntry])
      console.log('Audit log:', newEntry)
    },
    []
  )

  const getEntriesForSop = useCallback(
    (sopId: string): AuditLogEntry[] => {
      return entries.filter((e) => e.sopId === sopId)
    },
    [entries]
  )

  const clearEntries = useCallback(() => {
    setEntries([])
  }, [])

  return useMemo(
    () => ({
      entries,
      logAction,
      getEntriesForSop,
      clearEntries,
    }),
    [entries, logAction, getEntriesForSop, clearEntries]
  )
}
