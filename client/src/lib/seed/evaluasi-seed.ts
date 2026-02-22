/**
 * Seed data awal untuk evaluation case (store evaluasi).
 */
import type { EvaluationCase } from '@/lib/types/evaluasi'

export const SEED_EVALUATION_CASES: EvaluationCase[] = [
  {
    id: 'EV-2026-001',
    source_type: 'BIRO_INITIATIVE',
    source_ref: '1',
    status: 'In Progress',
    sopIds: ['3'],
    timEvaluator: 'Tim Evaluasi Pelayanan Publik',
    opd: 'Dinas Pendidikan',
    createdAt: '2026-02-01',
  },
]
