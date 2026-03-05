/**
 * Data layer: penugasan evaluasi.
 * Sumber data = store + seed (fallback). UI/pages tidak import seed atau store langsung.
 */
import { useState, useEffect } from 'react'
import type { Penugasan } from '@/lib/types/penugasan'
import {
  getPenugasanList,
  setPenugasanList,
  subscribePenugasan,
} from '@/lib/stores/penugasan-store'
import { SEED_PENUGASAN_INITIAL } from '@/lib/seed/penugasan-evaluasi-seed'

/** Inisialisasi list penugasan dari seed bila store masih kosong. */
export function initPenugasanFromSeed(): void {
  if (getPenugasanList().length === 0) {
    setPenugasanList(SEED_PENUGASAN_INITIAL)
  }
}

/**
 * Hook: list penugasan reaktif. Init dari seed bila kosong, subscribe ke store.
 * Untuk halaman yang hanya baca list (mis. Manajemen Evaluasi SOP).
 */
export function usePenugasanList(): Penugasan[] {
  const [list, setList] = useState<Penugasan[]>(() => getPenugasanList())

  useEffect(() => {
    initPenugasanFromSeed()
    const unsub = subscribePenugasan(() => setList(getPenugasanList()))
    return unsub
  }, [])

  return list
}
