/**
 * Hook akses override status SOP — satu titik akses untuk UI.
 * Menggantikan import langsung dari sop-status-store.
 */
import { useCallback } from 'react'
import { useSopStatusStore } from '@/lib/stores/sop-status-store'
import { mergeSopStatus as mergeSopStatusFromStore, setSopStatusOverride as setOverride } from '@/lib/stores/sop-status-store'
import type { StatusSOP } from '@/lib/types/sop'

export function useSopStatus() {
  const overrides = useSopStatusStore((s) => s.overrides)

  const setSopStatusOverride = useCallback((sopId: string, status: StatusSOP) => {
    setOverride(sopId, status)
  }, [])

  const getSopStatusOverride = useCallback(
    (sopId: string): StatusSOP | undefined => overrides[sopId],
    [overrides]
  )

  const mergeSopStatus = <T extends { id: string; status: StatusSOP }>(list: T[]): T[] =>
    mergeSopStatusFromStore(list)

  return {
    setSopStatusOverride,
    getSopStatusOverride,
    mergeSopStatus,
  }
}
