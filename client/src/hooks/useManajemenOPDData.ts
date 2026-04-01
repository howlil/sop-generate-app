import { useState, useCallback, useMemo } from 'react'
import type { OPD, KepalaOPD } from '@/lib/data/opd'

export interface UseManajemenOPDDataOptions {
  opdList: OPD[]
  kepalaList: KepalaOPD[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchUserQuery: string
  setSearchUserQuery: (query: string) => void
}

/**
 * Hook to manage Manajemen OPD data
 * @deprecated Use API instead
 */
export function useManajemenOPDData({
  opdList,
  kepalaList,
  searchQuery,
  setSearchQuery,
  searchUserQuery,
  setSearchUserQuery,
}: UseManajemenOPDDataOptions) {
  const [filteredOpd, setFilteredOpd] = useState<OPD[]>([])
  const [filteredPersons, setFilteredPersons] = useState<KepalaOPD[]>([])

  const getRiwayatForUser = useCallback(
    (userId: string) => {
      return kepalaList.filter((k) => k.userId === userId)
    },
    [kepalaList]
  )

  return useMemo(
    () => ({
      filteredOpd,
      setFilteredOpd,
      filteredPersons,
      setFilteredPersons,
      getRiwayatForUser,
    }),
    [filteredOpd, filteredPersons, getRiwayatForUser]
  )
}
