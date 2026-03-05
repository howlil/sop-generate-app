/**
 * Data dan derived list untuk Daftar SOP (Tim Penyusun).
 * State: sopList (initial dari seed); mergedSopList, eligibleSopsForEvaluasi, filteredList.
 */

import { useState, useEffect, useMemo } from 'react'
import { mergeSopStatus, subscribeSopStatus } from '@/lib/stores/sop-status-store'
import { getActiveCaseForSop } from '@/lib/stores/evaluasi-store'
import { canAjukanEvaluasiSOP, type SOPDaftarItem } from '@/lib/types/sop'
import { SEED_SOP_DAFTAR } from '@/lib/seed/sop-daftar'
import type { DaftarSOPFiltersState } from '@/hooks/useDaftarSOPFilters'

export function useDaftarSOPData(filters: DaftarSOPFiltersState) {
  const [sopList, setSopList] = useState<SOPDaftarItem[]>(() => [...SEED_SOP_DAFTAR])

  useEffect(() => {
    return subscribeSopStatus(() => {
      setSopList((prev) => [...prev])
    })
  }, [])

  const mergedSopList = useMemo(() => mergeSopStatus(sopList), [sopList])

  const eligibleSopsForEvaluasi = useMemo(
    () => mergedSopList.filter((sop) => canAjukanEvaluasiSOP(sop.status) && !getActiveCaseForSop(sop.id)),
    [mergedSopList]
  )

  const filteredList = useMemo(() => {
    return mergedSopList.filter((sop) => {
      const matchSearch =
        sop.judul.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        sop.nomorSOP.toLowerCase().includes(filters.searchQuery.toLowerCase())
      const matchStatus = filters.filterStatus === 'all' || sop.status === filters.filterStatus
      const matchPeraturan = filters.filterPeraturan === 'all' || sop.peraturanId === filters.filterPeraturan
      let matchTanggal = true
      if (filters.filterTanggalDari && filters.filterTanggalSampai) {
        const tanggalSOP = new Date(sop.terakhirDiperbarui)
        const dari = new Date(filters.filterTanggalDari)
        const sampai = new Date(filters.filterTanggalSampai)
        matchTanggal = tanggalSOP >= dari && tanggalSOP <= sampai
      }
      return matchSearch && matchStatus && matchPeraturan && matchTanggal
    })
  }, [mergedSopList, filters.searchQuery, filters.filterStatus, filters.filterPeraturan, filters.filterTanggalDari, filters.filterTanggalSampai])

  return {
    sopList,
    setSopList,
    mergedSopList,
    eligibleSopsForEvaluasi,
    filteredList,
  }
}
