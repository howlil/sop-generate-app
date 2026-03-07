/**
 * Hook akses evaluasi (evaluation case) — satu titik akses untuk UI.
 * Menggantikan import langsung dari evaluasi-store.
 */
import { useCallback } from 'react'
import { useEvaluationCaseStore } from '@/lib/stores/evaluasi-store'
import type { EvaluationCase, EvaluationCaseStatus } from '@/lib/types/evaluasi'

const ACTIVE_STATUSES: EvaluationCaseStatus[] = ['Draft', 'Assigned', 'In Progress']

export function useEvaluasi() {
  const cases = useEvaluationCaseStore((s) => s.cases)
  const addCase = useEvaluationCaseStore((s) => s.addCase)

  const getRiwayatEvaluasiForSop = useCallback(
    (sopId: string): EvaluationCase[] =>
      cases.filter(
        (c) => c.sopIds.includes(sopId) && (c.status === 'Completed' || c.status === 'Verified')
      ),
    [cases]
  )

  const getActiveCaseForSop = useCallback(
    (sopId: string): EvaluationCase | undefined =>
      cases.find((c) => ACTIVE_STATUSES.includes(c.status) && c.sopIds.includes(sopId)),
    [cases]
  )

  const addEvaluationCase = useCallback(
    (payload: Omit<EvaluationCase, 'id' | 'createdAt'>) => addCase(payload),
    [addCase]
  )

  return {
    getRiwayatEvaluasiForSop,
    getActiveCaseForSop,
    addEvaluationCase,
  }
}
