/**
 * Store evaluasi (evaluation case) — Zustand.
 * Validasi dan generate ID ada di lib/domain/evaluasi-case; store hanya state.
 */
import { create } from 'zustand'
import type { EvaluationCase, EvaluationCaseStatus } from '@/lib/types/evaluasi'
import { SEED_EVALUATION_CASES } from '@/lib/seed/evaluasi-seed'

const ACTIVE_STATUSES: EvaluationCaseStatus[] = ['Draft', 'Assigned', 'In Progress']

interface EvaluationCaseState {
  cases: EvaluationCase[]
  setCases: (next: EvaluationCase[]) => void
  /** Menambah case (id & createdAt sudah diisi pemanggil). */
  addCase: (case_: EvaluationCase) => EvaluationCase
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
  addCase: (newCase) => {
    const { cases } = get()
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
