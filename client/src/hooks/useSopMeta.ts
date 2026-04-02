/**
 * useSopMeta Hook
 * Local state for SOP metadata overlay (e.g., who last edited)
 */

import { useState, useCallback } from 'react'
import type { SopDetail } from '@/services/sop.api'

export function useSopMeta() {
  const [meta, setMeta] = useState<Partial<SopDetail> | null>(null)

  const setSopMeta = useCallback((_sopId: string, metadata: Partial<SopDetail>) => {
    setMeta(metadata)
  }, [])

  return {
    meta,
    setSopMeta,
  }
}
