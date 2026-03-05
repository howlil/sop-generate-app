/**
 * Hook: state "terakhir evaluasi per SOP" (date + evaluatorName), merge dengan seed, persist ke localStorage.
 */
import { useState, useEffect } from 'react'
import { EVALUASI_STORAGE_KEY } from '@/lib/constants/evaluasi'
import { SEED_LAST_EVALUATED_BY } from '@/lib/seed/penugasan-evaluasi-seed'

export type EvaluasiRecord = { date: string; evaluatorName: string }
export type EvaluasiRecordMap = Record<string, EvaluasiRecord>

function parseFromStorage(raw: string): EvaluasiRecordMap {
  const parsed = JSON.parse(raw) as Record<string, { date?: string; evaluatorName?: string }>
  return Object.fromEntries(
    Object.entries(parsed).filter(
      ([, v]) => v && typeof v.date === 'string' && typeof v.evaluatorName === 'string'
    )
  ) as EvaluasiRecordMap
}

function loadEvaluasiRecordMap(): EvaluasiRecordMap {
  const fromSeed = { ...SEED_LAST_EVALUATED_BY }
  if (typeof window === 'undefined') return fromSeed
  try {
    const raw = localStorage.getItem(EVALUASI_STORAGE_KEY)
    if (!raw) return fromSeed
    const fromStorage = parseFromStorage(raw)
    // Seed sebagai sumber kebenaran untuk SOP yang ada di seed; storage hanya menambah submission baru (id yang tidak di seed)
    const merged: EvaluasiRecordMap = { ...fromSeed }
    for (const [id, v] of Object.entries(fromStorage)) {
      if (!(id in fromSeed)) merged[id] = v
    }
    return merged
  } catch {
    return fromSeed
  }
}

export function useEvaluasiLastBy(): [EvaluasiRecordMap, React.Dispatch<React.SetStateAction<EvaluasiRecordMap>>] {
  const [lastEvaluatedBy, setLastEvaluatedBy] = useState(loadEvaluasiRecordMap)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Hanya persist submission user (id yang tidak di seed); seed tetap dipakai untuk tampilan demo
    const toPersist = Object.fromEntries(
      Object.entries(lastEvaluatedBy).filter(([id]) => !(id in SEED_LAST_EVALUATED_BY))
    )
    localStorage.setItem(EVALUASI_STORAGE_KEY, JSON.stringify(toPersist))
  }, [lastEvaluatedBy])

  return [lastEvaluatedBy, setLastEvaluatedBy]
}
