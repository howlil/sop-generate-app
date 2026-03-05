/**
 * Data layer: Tim Penyusun.
 * Sumber data = store + seed (inisialisasi). Page tidak import seed langsung.
 */
import { useState, useEffect } from 'react'
import type { TimPenyusun } from '@/lib/types/tim'
import {
  getTimPenyusunList,
  setTimPenyusunList,
  subscribeTimPenyusun,
  addTimPenyusun,
  updateTimPenyusun,
  removeTimPenyusun,
} from '@/lib/stores/tim-penyusun-store'
import { SEED_TIM_PENYUSUN_LIST } from '@/lib/seed/tim-penyusun-seed'

export { addTimPenyusun, updateTimPenyusun, removeTimPenyusun }

/** Inisialisasi list tim penyusun dari seed bila store masih kosong. */
export function initTimPenyusunFromSeed(): void {
  if (getTimPenyusunList().length === 0) {
    setTimPenyusunList(SEED_TIM_PENYUSUN_LIST)
  }
}

/**
 * Hook: list tim penyusun reaktif. Init dari seed bila kosong, subscribe ke store.
 */
export function useTimPenyusunList(): TimPenyusun[] {
  const [list, setList] = useState<TimPenyusun[]>(() => getTimPenyusunList())

  useEffect(() => {
    initTimPenyusunFromSeed()
    setList(getTimPenyusunList())
    const unsub = subscribeTimPenyusun(() => setList(getTimPenyusunList()))
    return unsub
  }, [])

  return list
}
