/**
 * EvaluationCase: satu SOP hanya boleh punya 1 case evaluasi aktif pada satu waktu.
 * Status aktif = Draft | Assigned | In Progress.
 */

export type EvaluationCaseSourceType = 'OPD_REQUEST' | 'BIRO_INITIATIVE'

export type EvaluationCaseStatus =
  | 'Draft'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Verified'

export interface EvaluationCase {
  id: string
  source_type: EvaluationCaseSourceType
  source_ref: string
  status: EvaluationCaseStatus
  sopIds: string[]
  timEvaluator?: string
  opd?: string
  createdAt: string
}

const ACTIVE_STATUSES: EvaluationCaseStatus[] = ['Draft', 'Assigned', 'In Progress']

let cases: EvaluationCase[] = [
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

export function getEvaluationCases(): EvaluationCase[] {
  return [...cases]
}

export function getCaseById(id: string): EvaluationCase | undefined {
  return cases.find((c) => c.id === id)
}

export function getActiveCaseForSop(sopId: string): EvaluationCase | undefined {
  return cases.find(
    (c) => ACTIVE_STATUSES.includes(c.status) && c.sopIds.includes(sopId)
  )
}

export function isSopInActiveCase(sopId: string): boolean {
  return getActiveCaseForSop(sopId) !== undefined
}

/** Riwayat evaluasi untuk satu SOP: case yang sudah selesai (Completed/Verified) dan memuat sopId ini. */
export function getRiwayatEvaluasiForSop(sopId: string): EvaluationCase[] {
  return cases.filter(
    (c) =>
      c.sopIds.includes(sopId) &&
      (c.status === 'Completed' || c.status === 'Verified')
  )
}

export function addEvaluationCase(
  payload: Omit<EvaluationCase, 'id' | 'createdAt'>
): EvaluationCase {
  const conflict = payload.sopIds.find((sopId) => getActiveCaseForSop(sopId))
  if (conflict) {
    throw new Error(
      `SOP ${conflict} sudah dalam evaluasi aktif. Satu SOP hanya satu case.`
    )
  }
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
  cases = [...cases, newCase]
  return newCase
}

export function updateCaseStatus(
  id: string,
  status: EvaluationCaseStatus
): EvaluationCase | undefined {
  const idx = cases.findIndex((c) => c.id === id)
  if (idx === -1) return undefined
  cases = cases.map((c) => (c.id === id ? { ...c, status } : c))
  return cases[idx]
}
