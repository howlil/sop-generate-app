import { useState, useCallback } from 'react'

export interface DaftarSOPFiltersState {
  searchQuery: string
  filterStatus: string
  filterPeraturan: string
  filterTanggalDari: string
  filterTanggalSampai: string
  isFilterOpen: boolean
}

export function useDaftarSOPFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeraturan, setFilterPeraturan] = useState<string>('all')
  const [filterTanggalDari, setFilterTanggalDari] = useState('')
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const clearFilters = useCallback(() => {
    setFilterStatus('all')
    setFilterPeraturan('all')
    setFilterTanggalDari('')
    setFilterTanggalSampai('')
  }, [])

  const activeFilterCount = [
    filterStatus !== 'all',
    filterPeraturan !== 'all',
    !!(filterTanggalDari && filterTanggalSampai),
  ].filter(Boolean).length

  return {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterPeraturan,
    setFilterPeraturan,
    filterTanggalDari,
    setFilterTanggalDari,
    filterTanggalSampai,
    setFilterTanggalSampai,
    isFilterOpen,
    setIsFilterOpen,
    clearFilters,
    activeFilterCount,
  }
}
