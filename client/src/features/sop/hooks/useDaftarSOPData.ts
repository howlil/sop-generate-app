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

/**
 * Parse Indonesian date format (e.g., "01 Jan 2025", "15 Feb 2025") to ISO string (YYYY-MM-DD)
 * Also handles ISO strings and Date objects for backward compatibility
 */
function parseIndonesianDateToISO(dateStr: string | null | undefined): string {
  if (!dateStr) return ''

  // Already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10)
  }

  // Indonesian format: "DD MMM YYYY" (e.g., "01 Jan 2025", "15 Feb 2025")
  const monthMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', Mei: '05', Jun: '06',
    Jul: '07', Agu: '08', Sep: '09', Okt: '10', Nov: '11', Des: '12',
  }

  const match = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/)
  if (match) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[2]]
    const year = match[3]
    if (month) {
      return `${year}-${month}-${day}`
    }
  }

  // Fallback: try parsing as Date
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return d.toISOString().substring(0, 10)
  }

  return ''
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

    // Date range filter - convert Indonesian dates to ISO for proper comparison
    if (params.filterTanggalDari) {
      result = result.filter((sop) => {
        const sopDate = parseIndonesianDateToISO(sop.tanggal)
        return sopDate >= params.filterTanggalDari!
      })
    }
    if (params.filterTanggalSampai) {
      result = result.filter((sop) => {
        const sopDate = parseIndonesianDateToISO(sop.tanggal)
        return sopDate <= params.filterTanggalSampai!
      })
    }

    return result
  }, [sopList, params.searchQuery, params.filterStatus, params.filterPeraturan, params.filterTanggalDari, params.filterTanggalSampai])

  return {
    eligibleSopsForEvaluasi,
    filteredList,
  }
}
