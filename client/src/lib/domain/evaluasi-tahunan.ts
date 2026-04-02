/**
 * Evaluasi Tahunan Stubs
 */

export interface DetailOpdPerTahun {
  opdId: string
  opdNama: string
  tahun: number
  jumlahSop: number
  skor: number
}

export function getDataGrafikEvaluasiTahunan(_tahun: number): DetailOpdPerTahun[] {
  return []
}

export function getDetailOpdPerTahun(_tahun: number, _opdId: string): DetailOpdPerTahun | null {
  return null
}
