/**
 * useDaftarSOPData Hook - SOP List with business logic
 * Handles filtering, batch logic, and evaluation eligibility
 */

import { useState, useMemo, useCallback } from 'react'
import { useSop } from '@/hooks/sop/useSop'
import { useAuditBySopDetail } from '@/hooks/audit/useAudit'
import type { SOPDaftarItem } from '@/components/sop/types'

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
  const [localSopList, setLocalSopList] = useState<SOPDaftarItem[]>([])

  // Use local list if set, otherwise use API list
  const effectiveSopList = localSopList.length > 0 ? localSopList : sopList

  // Filter SOPs eligible for evaluation (DRAFT or REVISI_DARI_TIM_EVALUASI)
  const eligibleSopsForEvaluasi = useMemo(() => {
    return effectiveSopList.filter(
      (sop) => sop.status === 'DRAFT' || sop.status === 'REVISI_DARI_TIM_EVALUASI'
    )
  }, [effectiveSopList])

  // Check for active batch
  const hasActiveBatch = false
  const activeBatchCount = 0

  // Apply filters
  const filteredList = useMemo(() => {
    let result = effectiveSopList

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
  }, [effectiveSopList, params])

  const setSopList = useCallback(
    (updater: SOPDaftarItem[] | ((prev: SOPDaftarItem[]) => SOPDaftarItem[])) => {
      if (typeof updater === 'function') {
        setLocalSopList((prev) => updater(prev as SOPDaftarItem[]) as SOPDaftarItem[])
      } else {
        setLocalSopList(updater)
      }
    },
    []
  )

  return {
    setSopList,
    eligibleSopsForEvaluasi,
    filteredList,
    hasActiveBatch,
    activeBatchCount,
  }
}
