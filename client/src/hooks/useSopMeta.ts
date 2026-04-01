import { useState, useCallback, useMemo } from 'react'

export interface SopMeta {
  judul?: string
  nomor?: string
  tahun?: number
  tentang?: string
  opdId?: string
}

const STORAGE_KEY = 'sop_meta'

/**
 * Hook to manage SOP metadata
 * @deprecated Use API instead
 */
export function useSopMeta() {
  const [sopMeta, setSopMetaState] = useState<SopMeta>({})

  const setSopMeta = useCallback((meta: SopMeta) => {
    setSopMetaState(meta)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meta))
    } catch (error) {
      console.error('Failed to save SOP meta:', error)
    }
  }, [])

  const clearSopMeta = useCallback(() => {
    setSopMetaState({})
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear SOP meta:', error)
    }
  }, [])

  return useMemo(
    () => ({
      sopMeta,
      setSopMeta,
      clearSopMeta,
    }),
    [sopMeta, setSopMeta, clearSopMeta]
  )
}
