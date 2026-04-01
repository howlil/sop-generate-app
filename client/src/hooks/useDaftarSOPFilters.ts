import { useState, useCallback, useMemo } from 'react'

export interface DaftarSOPFilters {
  searchQuery: string
  statusFilter: string
  opdFilter?: string
}

/**
 * Hook to manage SOP list filters
 * @deprecated Use API query params instead
 */
export function useDaftarSOPFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [opdFilter, setOpdFilter] = useState<string | undefined>(undefined)

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setOpdFilter(undefined)
  }, [])

  return useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      opdFilter,
      setOpdFilter,
      resetFilters,
    }),
    [searchQuery, statusFilter, opdFilter, resetFilters]
  )
}
