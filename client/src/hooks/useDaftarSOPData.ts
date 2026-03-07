/**
 * Data dan derived list untuk Daftar SOP (Tim Penyusun).
 * State: sopList (initial dari seed); mergedSopList, eligibleSopsForEvaluasi, filteredList.
 */

import { useState, useMemo } from 'react'
import { useSopStatus } from '@/hooks/useSopStatus'
import { useEvaluasi } from '@/hooks/useEvaluasi'
import { canAjukanEvaluasiSOP, type SOPDaftarItem } from '@/lib/types/sop'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import type { DaftarSOPFiltersState } from '@/hooks/useDaftarSOPFilters'

export function useDaftarSOPData(filters: DaftarSOPFiltersState) {
  const { mergeSopStatus } = useSopStatus()
  const { getActiveCaseForSop } = useEvaluasi()
  const [sopList, setSopList] = useState<SOPDaftarItem[]>(() => getInitialSopDaftarList())

  const mergedSopList = useMemo(() => mergeSopStatus(sopList), [sopList, mergeSopStatus])

  const eligibleSopsForEvaluasi = useMemo(
    () => mergedSopList.filter((sop) => canAjukanEvaluasiSOP(sop.status) && !getActiveCaseForSop(sop.id)),
    [mergedSopList, getActiveCaseForSop]
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
