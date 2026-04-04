/**
 * usePengajuanEvaluasiAktif Hook
 * Finds the active evaluation submission (SEDANG_DIEVALUASI) for an OPD
 */

import { useMemo } from 'react'
import { useEvaluasi } from './useEvaluasi'
import type { NilaiEvaluasi } from '../types/evaluasi'

export interface UsePengajuanEvaluasiAktifReturn {
  /** Pengajuan ID (null if no active pengajuan) */
  pengajuanId: string | null
  /** Full pengajuan data */
  pengajuan: {
    id: string
    status: string
    nilaiEvaluasi: NilaiEvaluasi[]
  } | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Get current version for a SOP detail */
  getCurrentVersion: (sopDetailId: string) => number
}

/**
 * Hook to find active evaluation submission for an OPD
 * @param opdId - OPD ID to find active pengajuan for
 */
export function usePengajuanEvaluasiAktif(opdId?: string): UsePengajuanEvaluasiAktifReturn {
  const {
    list: pengajuanList,
    isLoading,
    error,
  } = useEvaluasi({
    opdId,
    status: 'SEDANG_DIEVALUASI',
  })

  // Find the first active pengajuan
  const activePengajuan = useMemo(() => {
    if (!pengajuanList || pengajuanList.length === 0) return null
    return pengajuanList.find(p => p.status === 'SEDANG_DIEVALUASI') ?? null
  }, [pengajuanList])

  // Helper to get current version for optimistic locking
  const getCurrentVersion = (sopDetailId: string): number => {
    if (!activePengajuan?.nilaiEvaluasi) return 0
    const nilai = activePengajuan.nilaiEvaluasi.find(n => n.sopDetailId === sopDetailId)
    return nilai?.version ?? 0
  }

  return {
    pengajuanId: activePengajuan?.id ?? null,
    pengajuan: activePengajuan
      ? {
          id: activePengajuan.id,
          status: activePengajuan.status,
          nilaiEvaluasi: activePengajuan.nilaiEvaluasi ?? [],
        }
      : null,
    isLoading,
    error,
    getCurrentVersion,
  }
}
