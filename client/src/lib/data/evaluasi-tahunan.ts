/**
 * Agregasi data penilaian OPD per tahun untuk grafik Biro Organisasi.
 * Satu OPD dalam satu tahun bisa punya lebih dari satu evaluasi.
 */
import { getRiwayatEvaluasiOpd } from './evaluasi-data'

export interface DataTahunEvaluasi {
  tahun: string
  jumlahPenilaianOpd: number
  /** Jumlah OPD unik yang dievaluasi di tahun ini. */
  jumlahOpdTerevaluasi: number
  rataRataSkorOpd: number
}

export interface DetailOpdPerTahun {
  tahun: string
  opdId: string
  opdNama: string
  jumlahEvaluasi: number
  rataRataSkor: number
}

function yearFromDate(dateStr: string | undefined): string | null {
  if (!dateStr || !dateStr.slice(0, 4)) return null
  return dateStr.slice(0, 4)
}

/**
 * Konversi skor 0–100 ke skala 1–5 (untuk analitik tahunan).
 * 0 atau nilai tidak valid dianggap 0 (belum ada skor).
 */
function toFiveScale(score100: number | undefined): number {
  if (typeof score100 !== 'number' || !Number.isFinite(score100) || score100 <= 0) {
    return 0
  }
  const scaled = 1 + (score100 / 100) * 4
  return Math.round(scaled * 10) / 10
}

/**
 * Ringkasan per tahun + detail per OPD per tahun.
 */
export function getDataGrafikEvaluasiTahunan(): DataTahunEvaluasi[] {
  const riwayatOpd = getRiwayatEvaluasiOpd()

  const byYear: Record<
    string,
    { opd: number; totalSkor: number; countSkor: number; opdIds: Set<string> }
  > = {}

  function ensureYear(tahun: string) {
    if (!byYear[tahun]) {
      byYear[tahun] = { opd: 0, totalSkor: 0, countSkor: 0, opdIds: new Set() }
    }
  }

  for (const opdId of Object.keys(riwayatOpd)) {
    const items = riwayatOpd[opdId] ?? []
    for (const item of items) {
      const tahun = yearFromDate(item.date)
      if (tahun) {
        ensureYear(tahun)
        byYear[tahun].opd += 1
        byYear[tahun].opdIds.add(opdId)
        const skor5 = toFiveScale(item.skor)
        if (skor5 > 0) {
          byYear[tahun].totalSkor += skor5
          byYear[tahun].countSkor += 1
        }
      }
    }
  }

  const years = Object.keys(byYear).sort()
  return years.map((tahun) => {
    const d = byYear[tahun]
    const rataRataSkorOpd =
      d.countSkor > 0 ? Math.round((d.totalSkor / d.countSkor) * 10) / 10 : 0
    return {
      tahun,
      jumlahPenilaianOpd: d.opd,
      jumlahOpdTerevaluasi: d.opdIds.size,
      rataRataSkorOpd,
    }
  })
}

/**
 * Detail per OPD per tahun: dalam satu tahun, OPD mana saja yang dievaluasi dan berapa kali.
 */
export function getDetailOpdPerTahun(): DetailOpdPerTahun[] {
  const riwayatOpd = getRiwayatEvaluasiOpd()

  const byTahunOpd: Record<
    string,
    Record<string, { count: number; totalSkor: number }>
  > = {}

  for (const opdId of Object.keys(riwayatOpd)) {
    const items = riwayatOpd[opdId] ?? []
    for (const item of items) {
      const tahun = yearFromDate(item.date)
      if (!tahun) continue
      if (!byTahunOpd[tahun]) byTahunOpd[tahun] = {}
      if (!byTahunOpd[tahun][opdId]) {
        byTahunOpd[tahun][opdId] = { count: 0, totalSkor: 0 }
      }
      byTahunOpd[tahun][opdId].count += 1
      const skor5 = toFiveScale(item.skor)
      if (skor5 > 0) byTahunOpd[tahun][opdId].totalSkor += skor5
    }
  }

  const out: DetailOpdPerTahun[] = []
  const years = Object.keys(byTahunOpd).sort()
  for (const tahun of years) {
    const opds = byTahunOpd[tahun]
    for (const opdId of Object.keys(opds)) {
      const d = opds[opdId]
      const rataRataSkor =
        d.count > 0 ? Math.round((d.totalSkor / d.count) * 10) / 10 : 0
      out.push({
        tahun,
        opdId,
        opdNama: opdId,
        jumlahEvaluasi: d.count,
        rataRataSkor,
      })
    }
  }
  return out.sort((a, b) => a.tahun.localeCompare(b.tahun) || a.opdNama.localeCompare(b.opdNama))
}
