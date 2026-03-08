/**
 * Store evaluasi (evaluation case) — Zustand.
 */
import { create } from 'zustand'
import type { EvaluationCase, EvaluationCaseStatus } from '@/lib/types/evaluasi'
import { SEED_EVALUATION_CASES } from '@/lib/seed/evaluasi-seed'

const ACTIVE_STATUSES: EvaluationCaseStatus[] = ['Draft', 'Assigned', 'In Progress']

interface EvaluationCaseState {
  cases: EvaluationCase[]
  setCases: (next: EvaluationCase[]) => void
  addCase: (payload: Omit<EvaluationCase, 'id' | 'createdAt'>) => EvaluationCase
  updateCaseStatus: (id: string, status: EvaluationCaseStatus) => EvaluationCase | undefined
  getActiveCaseForSop: (sopId: string) => EvaluationCase | undefined
  getRiwayatEvaluasiForSop: (sopId: string) => EvaluationCase[]
  getCaseById: (id: string) => EvaluationCase | undefined
}

export const useEvaluationCaseStore = create<EvaluationCaseState>()((set, get) => ({
  cases: [...SEED_EVALUATION_CASES],
  setCases: (next) => set({ cases: [...next] }),
  getCaseById: (id) => get().cases.find((c) => c.id === id),
  getActiveCaseForSop: (sopId) =>
    get().cases.find((c) => ACTIVE_STATUSES.includes(c.status) && c.sopIds.includes(sopId)),
  getRiwayatEvaluasiForSop: (sopId) =>
    get().cases.filter(
      (c) => c.sopIds.includes(sopId) && (c.status === 'Completed' || c.status === 'Verified')
    ),
  addCase: (payload) => {
    const { cases, getActiveCaseForSop } = get()
    const conflict = payload.sopIds.find((sopId) => getActiveCaseForSop(sopId))
    if (conflict) throw new Error('SOP sudah dalam evaluasi aktif. Satu SOP hanya satu case.')
    const nextNum =
      cases.length > 0
        ? Math.max(
            ...cases.map((c) => {
              const m = c.id.match(/EV-\d+-(\d+)/)
              return m ? parseInt(m[1], 10) : 0
            })
          ) + 1
        : 1
    const year = new Date().getFullYear()
    const id = `EV-${year}-${String(nextNum).padStart(3, '0')}`
    const createdAt = new Date().toISOString().slice(0, 10)
    const newCase: EvaluationCase = { ...payload, id, createdAt }
    set({ cases: [...cases, newCase] })
    return newCase
  },
  updateCaseStatus: (id, status) => {
    const { cases } = get()
    const idx = cases.findIndex((c) => c.id === id)
    if (idx === -1) return undefined
    const next = cases.map((c) => (c.id === id ? { ...c, status } : c)) as EvaluationCase[]
    set({ cases: next })
    return next[idx]
  },
}))
