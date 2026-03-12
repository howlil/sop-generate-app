/**
 * Data layer: evaluasi case — inisialisasi store dari JSON.
 */
import type { EvaluationCase } from '@/lib/types/evaluasi'
import evaluasiCasesJson from '../seed/evaluasi-cases.json'

const EVALUATION_CASES: EvaluationCase[] = evaluasiCasesJson as EvaluationCase[]

export function getInitialEvaluationCases(): EvaluationCase[] {
  return [...EVALUATION_CASES]
}
