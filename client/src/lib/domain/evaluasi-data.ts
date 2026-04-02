/**
 * Evaluasi Data Stubs
 * These are stubs for backward compatibility - use hooks for real data
 */

export interface RiwayatEvaluasiSOPItem {
  sopId: string
  judul: string
  tanggal: string
  hasil: string
}

export interface RiwayatEvaluasiOPDItem {
  opdId: string
  opdNama: string
  tanggal: string
  hasil: string
}

export function getRiwayatEvaluasiSop(): RiwayatEvaluasiSOPItem[] {
  return []
}

export function getRiwayatEvaluasiOpd(): RiwayatEvaluasiOPDItem[] {
  return []
}

export function getLastEvaluatedByInitial(): Record<string, { evaluatorName: string; date: string }> {
  return {}
}
