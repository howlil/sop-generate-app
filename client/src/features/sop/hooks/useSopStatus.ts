import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SopItem } from '@/types/common'

const STORAGE_KEY = 'sop_status_overrides'

export interface SopStatusOverride {
  [sopId: string]: string
}

/**
 * Hook to manage SOP status overrides (localStorage-based)
 * Used for workflow simulation before backend integration
 */
export function useSopStatus() {
  const [overrides, setOverrides] = useState<SopStatusOverride>({})

  // Load overrides from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setOverrides(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load SOP status overrides:', error)
    }
  }, [])

  // Save override to localStorage
  const setSopStatusOverride = useCallback((sopId: string, status: string) => {
    setOverrides((prev) => {
      const updated = { ...prev, [sopId]: status }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save SOP status override:', error)
      }
      return updated
    })
  }, [])

  // Get override for specific SOP
  const getSopStatusOverride = useCallback(
    (sopId: string): string | undefined => {
      return overrides[sopId]
    },
    [overrides]
  )

  // Merge SOP list with status overrides
  const mergeSopStatus = useCallback(
    (sopList: SopItem[]): SopItem[] => {
      return sopList.map((sop) => ({
        ...sop,
        status: overrides[sop.id] || sop.status,
      }))
    },
    [overrides]
  )

  // Clear override for specific SOP
  const clearSopStatusOverride = useCallback((sopId: string) => {
    setOverrides((prev) => {
      const { [sopId]: _, ...rest } = prev
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
      } catch (error) {
        console.error('Failed to clear SOP status override:', error)
      }
      return rest
    })
  }, [])

  // Clear all overrides
  const clearAllOverrides = useCallback(() => {
    setOverrides({})
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear all SOP status overrides:', error)
    }
  }, [])

  return useMemo(
    () => ({
      overrides,
      setSopStatusOverride,
      getSopStatusOverride,
      mergeSopStatus,
      clearSopStatusOverride,
      clearAllOverrides,
    }),
    [
      overrides,
      setSopStatusOverride,
      getSopStatusOverride,
      mergeSopStatus,
      clearSopStatusOverride,
      clearAllOverrides,
    ]
  )
}
