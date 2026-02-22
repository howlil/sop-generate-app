/**
 * Types evaluasi (case evaluasi SOP).
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
