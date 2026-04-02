/**
 * useDaftarSOPData Hook - SOP List with business logic
 * Handles filtering, batch logic, and evaluation eligibility
 * 
 * Note: All state is derived from TanStack Query (single source of truth)
 * For optimistic updates, use useSop() mutations directly
 */

import { useMemo } from 'react'
import { useSop, useSopStatus } from '@/features/sop'
import type { SOPDaftarItem } from '@/features/sop'

interface UseDaftarSOPDataParams {
  searchQuery: string
  filterStatus: string | null
  filterPeraturan: string | null
  filterTanggalDari: string | null
  filterTanggalSampai: string | null
  isFilterOpen: boolean
}

export function useDaftarSOPData(params: UseDaftarSOPDataParams) {
  const { list: sopList = [] } = useSop()

  // Filter SOPs eligible for evaluation (DRAFT or REVISI_DARI_TIM_EVALUASI)
  const eligibleSopsForEvaluasi = useMemo(() => {
    return sopList.filter(
      (sop) => sop.status === 'DRAFT' || sop.status === 'REVISI_DARI_TIM_EVALUASI'
    )
  }, [sopList])

  // Check for active batch
  const hasActiveBatch = false
  const activeBatchCount = 0

  // Apply filters - all derived state, no local state needed
  const filteredList = useMemo(() => {
    let result = sopList

    // Search query filter
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase()
      result = result.filter(
        (sop) =>
          sop.judul.toLowerCase().includes(q) ||
          sop.nomorSOP.toLowerCase().includes(q) ||
          (sop.author && sop.author.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (params.filterStatus) {
      result = result.filter((sop) => sop.status === params.filterStatus)
    }

    // Peraturan filter
    if (params.filterPeraturan) {
      result = result.filter((sop) => sop.peraturanId === params.filterPeraturan)
    }

    // Date range filter
    if (params.filterTanggalDari) {
      result = result.filter((sop) => sop.tanggal >= params.filterTanggalDari!)
    }
    if (params.filterTanggalSampai) {
      result = result.filter((sop) => sop.tanggal <= params.filterTanggalSampai!)
    }

    return result
  }, [sopList, params.searchQuery, params.filterStatus, params.filterPeraturan, params.filterTanggalDari, params.filterTanggalSampai])

  return {
    eligibleSopsForEvaluasi,
    filteredList,
    hasActiveBatch,
    activeBatchCount,
  }
}
