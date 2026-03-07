/**
 * Hook akses penugasan — satu titik akses untuk UI.
 * Menggantikan import langsung dari penugasan-store.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  getPenugasanById,
  getPenugasanList,
  subscribePenugasan,
  updatePenugasan as updatePenugasanStore,
} from '@/lib/stores/penugasan-store'
import type { Penugasan } from '@/lib/types/penugasan'
import { initPenugasanFromSeed } from '@/lib/data/penugasan'

export function usePenugasanDetail(id: string | undefined) {
  const [penugasan, setPenugasan] = useState<Penugasan | null>(() =>
    id ? getPenugasanById(id) ?? null : null
  )

  useEffect(() => {
    if (!id) return
    const unsub = subscribePenugasan(() => setPenugasan(getPenugasanById(id) ?? null))
    return unsub
  }, [id])

  const updatePenugasan = useCallback((patch: Partial<Penugasan>) => {
    if (!penugasan) return
    updatePenugasanStore(penugasan.id, patch)
  }, [penugasan])

  return { penugasan, updatePenugasan }
}

export function usePenugasanList() {
  const [list, setList] = useState<Penugasan[]>(() => getPenugasanList())

  useEffect(() => {
    initPenugasanFromSeed()
    const unsub = subscribePenugasan(() => setList(getPenugasanList()))
    return unsub
  }, [])

  const updatePenugasan = useCallback((id: string, patch: Partial<Penugasan>) => {
    updatePenugasanStore(id, patch)
  }, [])

  return { list, updatePenugasan }
}
