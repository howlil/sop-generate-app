/**
 * useDaftarSOPFilters Hook - Real API Implementation
 */

import { useState, useCallback } from 'react'

export interface DaftarSOPFilters {
  searchQuery: string
  statusFilter: string | null
}

export function useDaftarSOPFilters() {
  const [filters, setFilters] = useState<DaftarSOPFilters>({
    searchQuery: '',
    statusFilter: null,
  })

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }))
  }, [])

  const setStatusFilter = useCallback((status: string | null) => {
    setFilters((prev) => ({ ...prev, statusFilter: status }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      statusFilter: null,
    })
  }, [])

  return {
    filters,
    setSearchQuery,
    setStatusFilter,
    clearFilters,
  }
}
