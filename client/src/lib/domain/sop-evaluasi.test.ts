import { describe, expect, it } from 'vitest'
import {
  STATUS_SOP_CAN_REQUEST_EVALUASI,
  canAjukanEvaluasiSOP,
  canSelectSOPForEvaluasi,
  isSopInEvaluasiList,
} from './sop-evaluasi'

describe('domain/sop-evaluasi', () => {
  it('hanya status Siap Dievaluasi yang bisa diajukan evaluasi', () => {
    expect(STATUS_SOP_CAN_REQUEST_EVALUASI).toEqual(['Siap Dievaluasi'])
    expect(canAjukanEvaluasiSOP('Siap Dievaluasi')).toBe(true)
    expect(canAjukanEvaluasiSOP('Draft')).toBe(false)
    expect(canAjukanEvaluasiSOP('Sedang Disusun')).toBe(false)
    expect(canAjukanEvaluasiSOP('Revisi dari Tim Evaluasi')).toBe(false)
  })

  it('status list evaluasi dan selectable konsisten dengan rule', () => {
    expect(canSelectSOPForEvaluasi('Diajukan Evaluasi')).toBe(true)
    expect(canSelectSOPForEvaluasi('Sedang Dievaluasi')).toBe(true)
    expect(canSelectSOPForEvaluasi('Siap Dievaluasi')).toBe(false)

    expect(isSopInEvaluasiList('Diajukan Evaluasi')).toBe(true)
    expect(isSopInEvaluasiList('Sedang Dievaluasi')).toBe(true)
    expect(isSopInEvaluasiList('Draft')).toBe(false)
    expect(isSopInEvaluasiList('Siap Dievaluasi')).toBe(false)
  })
})
