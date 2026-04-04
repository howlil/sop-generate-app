/**
 * useEvaluasiSopByOpd hook - Fetch SOPs for evaluation by OPD
 */

import { useMemo } from 'react'
import { useDetailSop } from '@/features/sop'
import { useEvaluasi } from '@/features/evaluasi'
import type { StatusSOP } from '@/types/common'
import type { SopDetail } from '@/features/sop'

/** Status that indicate SOP is in evaluation workflow (server enum values) */
const EVALUASI_STATUS: StatusSOP[] = [
  'DIAJUKAN_EVALUASI',
  'SEDANG_DIEVALUASI',
  'SIAP_DIVERIFIKASI',
  'REVISI_DARI_TIM_EVALUASI',
]

/**
 * Hook to fetch SOPs that need evaluation for a specific OPD.
 * Combines detail SOP list with evaluation pengajuan data.
 */
export function useEvaluasiSopByOpd(opdId: string) {
  const { data: sopDetails = [], isLoading: isLoadingSop } = useDetailSop({ opdId })
  const { list: pengajuanList = [], isLoading: isLoadingEvaluasi } = useEvaluasi()

  /** Find pengajuan that matches this OPD */
  const pengajuanOpd = useMemo(() => {
    return pengajuanList.find((p) => p.opdId === opdId)
  }, [pengajuanList, opdId])

  /** Filter SOPs that are in evaluation workflow */
  const sopList = useMemo(() => {
    return (sopDetails as SopDetail[])
      .filter((sop: SopDetail) => EVALUASI_STATUS.includes(sop.status))
      .map((sop: SopDetail) => ({
        id: sop.id,
        judul: sop.namaLembaga,
        nomorSOP: sop.nomorSOP,
        status: sop.status,
        unitTerkait: sop.namaLembaga,
      }))
  }, [sopDetails])

  return {
    sopList,
    pengajuan: pengajuanOpd ?? null,
    isLoading: isLoadingSop || isLoadingEvaluasi,
  }
}

/**
 * Interface for evaluation history entry
 */
export interface RiwayatEvaluasiEntry {
  tanggal: string
  evaluator: string
  hasil?: string
  catatan?: string
  nilaiOPD?: number
}

/**
 * Hook to fetch evaluation history for a specific SOP.
 * NOTE: Requires server endpoint GET /evaluasi/riwayat/sop/:sopDetailId
 * Currently returns empty array until endpoint is implemented.
 */
export function useRiwayatEvaluasiSop(_sopDetailId: string): { data: RiwayatEvaluasiEntry[]; isLoading: boolean } {
  // TODO: Implement when server endpoint exists
  // const { data, isLoading } = useQuery({
  //   queryKey: queryKeys.riwayatEvaluasiSop(sopDetailId),
  //   queryFn: () => evaluasiApi.findRiwayatSop(sopDetailId),
  // })
  return { data: [], isLoading: false }
}

/**
 * Hook to fetch evaluation history for a specific OPD.
 * NOTE: Requires server endpoint GET /evaluasi/riwayat/opd/:opdId
 * Currently returns empty array until endpoint is implemented.
 */
export function useRiwayatEvaluasiOpd(_opdId: string): { data: RiwayatEvaluasiEntry[]; isLoading: boolean } {
  // TODO: Implement when server endpoint exists
  return { data: [], isLoading: false }
}
