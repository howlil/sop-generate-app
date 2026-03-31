/**
 * Hook akses Pengajuan Evaluasi — satu titik akses untuk UI.
 * Per ERD-DESKRIPSI.md: PengajuanEvaluasi menggantikan konsep "VerifikasiBatch" / "Terjadwal Evaluasi"
 */
import { useState, useEffect, useCallback } from 'react'
import {
  getPengajuanEvaluasiById,
  getPengajuanEvaluasiList,
  subscribePengajuanEvaluasi,
  updatePengajuanEvaluasi as updatePengajuanEvaluasiStore,
} from '@/lib/stores/pengajuan-evaluasi-store'
import type { PengajuanEvaluasi } from '@/lib/types/pengajuan-evaluasi'

export function usePengajuanEvaluasiDetail(id: string | undefined) {
  const [pengajuan, setPengajuan] = useState<PengajuanEvaluasi | null>(() =>
    id ? getPengajuanEvaluasiById(id) ?? null : null
  )

  useEffect(() => {
    if (!id) return
    const unsub = subscribePengajuanEvaluasi(() => setPengajuan(getPengajuanEvaluasiById(id) ?? null))
    return unsub
  }, [id])

  const updatePengajuan = useCallback((patch: Partial<PengajuanEvaluasi>) => {
    if (!pengajuan) return
    updatePengajuanEvaluasiStore(pengajuan.id, patch)
  }, [pengajuan])

  return { pengajuan, updatePengajuan }
}

export function usePengajuanEvaluasiList() {
  const [list, setList] = useState<PengajuanEvaluasi[]>(() => getPengajuanEvaluasiList())

  useEffect(() => {
    const unsub = subscribePengajuanEvaluasi(() => setList(getPengajuanEvaluasiList()))
    return unsub
  }, [])

  const updatePengajuan = useCallback((id: string, patch: Partial<PengajuanEvaluasi>) => {
    updatePengajuanEvaluasiStore(id, patch)
  }, [])

  return { list, updatePengajuan }
}
