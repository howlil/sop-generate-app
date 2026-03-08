/**
 * Domain: aturan bisnis evaluation case (request evaluasi SOP).
 * Validasi dan generate ID dipusatkan di sini; store hanya update state.
 */
import type { EvaluationCase, EvaluationCaseStatus } from '@/lib/types/evaluasi'

const ACTIVE_STATUSES: EvaluationCaseStatus[] = ['Draft', 'Assigned', 'In Progress']

function isSopInActiveCase(sopId: string, c: EvaluationCase): boolean {
  return ACTIVE_STATUSES.includes(c.status) && c.sopIds.includes(sopId)
}

/** Validasi: tidak ada SOP di payload yang sudah masuk dalam evaluasi aktif. */
export function validateSopIdsNotInActiveCase(
  sopIds: string[],
  cases: EvaluationCase[]
): void {
  for (const sopId of sopIds) {
    const conflict = cases.some((c) => isSopInActiveCase(sopId, c))
    if (conflict) {
      throw new Error('SOP sudah dalam evaluasi aktif. Satu SOP hanya satu case.')
    }
  }
}

/** Generate ID case berikutnya (format EV-YYYY-NNN). */
export function generateNextEvaluationCaseId(cases: EvaluationCase[]): string {
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
  return `EV-${year}-${String(nextNum).padStart(3, '0')}`
}
