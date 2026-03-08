/**
 * Seed data awal untuk evaluation case (store evaluasi).
 * Data dari data/evaluasi-cases.json (bentuk = response API evaluasi/cases).
 */
import type { EvaluationCase } from '@/lib/types/evaluasi'
import evaluasiCasesJson from './data/evaluasi-cases.json'

export const SEED_EVALUATION_CASES: EvaluationCase[] = evaluasiCasesJson as EvaluationCase[]
