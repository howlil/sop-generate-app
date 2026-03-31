/**
 * Hook akses terjadwal evaluasi — satu titik akses untuk UI.
 * "VerifikasiBatch" tetap dipakai sebagai nama type, tapi UI menyebutnya "Terjadwal Evaluasi".
 */
import { useState, useEffect, useCallback } from 'react'
import {
  getVerifikasiBatchById,
  getVerifikasiBatchList,
  subscribeVerifikasiBatch,
  updateVerifikasiBatch as updateVerifikasiBatchStore,
} from '@/lib/stores/terjadwal-evaluasi-store'
import type { VerifikasiBatch } from '@/lib/types/terjadwal-evaluasi'
import { initTerjadwalEvaluasiFromSeed } from '@/lib/data/terjadwal-evaluasi-data'

export function useVerifikasiBatchDetail(id: string | undefined) {
  const [batch, setBatch] = useState<VerifikasiBatch | null>(() =>
    id ? getVerifikasiBatchById(id) ?? null : null
  )

  useEffect(() => {
    if (!id) return
    const unsub = subscribeVerifikasiBatch(() => setBatch(getVerifikasiBatchById(id) ?? null))
    return unsub
  }, [id])

  const updateBatch = useCallback((patch: Partial<VerifikasiBatch>) => {
    if (!batch) return
    updateVerifikasiBatchStore(batch.id, patch)
  }, [batch])

  return { batch, updateBatch }
}

export function useVerifikasiBatchList() {
  const [list, setList] = useState<VerifikasiBatch[]>(() => getVerifikasiBatchList())

  useEffect(() => {
    initVerifikasiBatchFromSeed()
    const unsub = subscribeVerifikasiBatch(() => setList(getVerifikasiBatchList()))
    return unsub
  }, [])

  const updateBatch = useCallback((id: string, patch: Partial<VerifikasiBatch>) => {
    updateVerifikasiBatchStore(id, patch)
  }, [])

  return { list, updateBatch }
}
