/**
 * Hook akses evaluasi (evaluation case) — satu titik akses untuk UI.
 * Validasi dan generate ID dari domain; store hanya menyimpan state.
 */
import { useCallback } from 'react'
import { useEvaluationCaseStore } from '@/lib/stores/evaluasi-store'
import { validateSopIdsNotInActiveCase, generateNextEvaluationCaseId, ACTIVE_STATUSES } from '@/lib/domain/evaluasi-case'
import type { EvaluationCase } from '@/lib/types/evaluasi'

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
    (payload: Omit<EvaluationCase, 'id' | 'createdAt'>) => {
      validateSopIdsNotInActiveCase(payload.sopIds, cases)
      const id = generateNextEvaluationCaseId(cases)
      const createdAt = new Date().toISOString().slice(0, 10)
      const newCase: EvaluationCase = { ...payload, id, createdAt }
      return addCase(newCase)
    },
    [cases, addCase]
  )

  return {
    getRiwayatEvaluasiForSop,
    getActiveCaseForSop,
    addEvaluationCase,
  }
}
