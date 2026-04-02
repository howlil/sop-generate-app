/**
 * useAuditLog Hook
 * Provides audit log entries for a SOP detail via auditApi.
 * Note: Audit logs are created server-side automatically on edits.
 * logAction is a no-op kept for backward compatibility.
 */

import { useState, useCallback } from 'react'
import { auditApi } from '@/services/audit.api'
import type { LogEditSOP } from '@/services/audit.api'

export function useAuditLog() {
  const [entries, setEntries] = useState<LogEditSOP[]>([])

  const loadEntriesForSop = useCallback(async (sopDetailId: string) => {
    try {
      const data = await auditApi.findBySopDetail(sopDetailId)
      setEntries(data)
      return data
    } catch (error) {
      console.error('Failed to load audit entries:', error)
      return []
    }
  }, [])

  // No-op: audit logs are created server-side automatically
  const logAction = useCallback((_payload: any) => {}, [])

  const getEntriesForSop = useCallback((sopDetailId: string): LogEditSOP[] => {
    return entries.filter((e) => e.sopDetailId === sopDetailId)
  }, [entries])

  return {
    entries,
    loadEntriesForSop,
    logAction,
    getEntriesForSop,
  }
}
