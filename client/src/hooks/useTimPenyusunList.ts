import { useState, useEffect } from 'react'
import type { TimPenyusun } from '@/lib/types/tim'
import {
  getTimPenyusunList,
  subscribeTimPenyusun,
} from '@/lib/stores/tim-penyusun-store'
import { initTimPenyusunFromSeed } from '@/lib/data/tim-penyusun'

/** Hook: list tim penyusun reaktif. Init dari seed bila kosong, subscribe ke store. */
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
