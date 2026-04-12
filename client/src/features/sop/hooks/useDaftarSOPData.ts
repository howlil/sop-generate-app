/**
 * useDaftarSOPData Hook - SOP List with business logic
 * Handles filtering, batch logic, and evaluation eligibility
 *
 * Note: All state is derived from TanStack Query (single source of truth)
 * For optimistic updates, use useSop() mutations directly
 */

import { useMemo } from 'react'
import { useSop } from '@/features/sop/hooks/useSop'

interface UseDaftarSopDataParams {
  searchQuery: string
  filterStatus: string | null
  filterPeraturan: string | null
  filterTanggalDari: string | null
  filterTanggalSampai: string | null
  isFilterOpen: boolean
}

export function useDaftarSopData(params: UseDaftarSopDataParams) {
  const { list: sopList = [] } = useSop()

  // Filter SOPs eligible for evaluation (SIAP_DIEVALUASI or REVISI_DARI_TIM_EVALUASI)
  // DRAFT is NOT eligible - it's still being composed
  const eligibleSopsForEvaluasi = useMemo(() => {
    return sopList.filter(
      (sop) => sop.status === 'SIAP_DIEVALUASI' || sop.status === 'REVISI_DARI_TIM_EVALUASI'
    )
  }, [sopList])

  // Apply filters - all derived state, no local state needed
  const filteredList = useMemo(() => {
    let result = sopList

    // Search query filter
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase()
      result = result.filter(
        (sop) =>
          sop.judul.toLowerCase().includes(q) ||
          (sop.nomorSOP ?? '').toLowerCase().includes(q) ||
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
      result = result.filter((sop) => (sop.tanggal ?? '') >= params.filterTanggalDari!)
    }
    if (params.filterTanggalSampai) {
      result = result.filter((sop) => (sop.tanggal ?? '') <= params.filterTanggalSampai!)
    }

    return result
  }, [sopList, params.searchQuery, params.filterStatus, params.filterPeraturan, params.filterTanggalDari, params.filterTanggalSampai])

  return {
    eligibleSopsForEvaluasi,
    filteredList,
  }
}
