import { useMemo, useState, useEffect } from 'react'
import { BarChart3, ChevronDown, ChevronRight, Building2, Filter } from 'lucide-react'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { Select } from '@/components/ui/select'
import {
  getDataGrafikEvaluasiTahunan,
  getDetailOpdPerTahun,
  type DetailOpdPerTahun,
} from '@/lib/data/evaluasi-tahunan'
import { getOpdListEvaluasi } from '@/lib/data/evaluasi-data'

export function GrafikEvaluasiTahunan() {
  const summary = useMemo(() => getDataGrafikEvaluasiTahunan(), [])
  const detail = useMemo(() => getDetailOpdPerTahun(), [])
  const opdList = useMemo(() => getOpdListEvaluasi(), [])
  const [expandedYears, setExpandedYears] = useState<Set<string>>(() => new Set())
  const [filterTahun, setFilterTahun] = useState<string>('')
  const [filterOpdId, setFilterOpdId] = useState<string>('')

  useEffect(() => {
    if (summary.length > 0) {
      setExpandedYears((prev) => {
        const years = summary.map((s) => s.tahun)
        if (prev.size === 0 && years.length > 0) return new Set(years)
        return prev
      })
    }
  }, [summary])

  useEffect(() => {
    if (summary.length > 0 && !filterTahun) {
      const latest = summary[summary.length - 1]?.tahun ?? ''
      setFilterTahun(latest)
    }
  }, [summary, filterTahun])

  const detailByTahun = useMemo(() => {
    const map: Record<string, DetailOpdPerTahun[]> = {}
    for (const row of detail) {
      if (!map[row.tahun]) map[row.tahun] = []
      map[row.tahun].push(row)
    }
    for (const tahun of Object.keys(map)) {
      map[tahun].sort((a, b) => b.jumlahEvaluasi - a.jumlahEvaluasi)
    }
    return map
  }, [detail])

  const barChartData = useMemo(() => {
    if (!filterTahun) return []
    const rows = detailByTahun[filterTahun] ?? []

    // Map hasil evaluasi per OPD (untuk tahun terpilih)
    const byOpd = new Map<string, DetailOpdPerTahun>()
    for (const row of rows) {
      byOpd.set(row.opdId, row)
    }

    // Pastikan semua OPD (52) muncul di grafik:
    // - Jika ada riwayat evaluasi → pakai data asli
    // - Jika belum pernah dievaluasi → jumlahEvaluasi = 0, skor = 0
    const allRows: DetailOpdPerTahun[] = opdList.map((opd) => {
      const existing = byOpd.get(opd.id)
      if (existing) return existing
      return {
        tahun: filterTahun,
        opdId: opd.id,
        opdNama: opd.nama,
        jumlahEvaluasi: 0,
        rataRataSkor: 0,
      }
    })

    if (filterOpdId) {
      return allRows.filter((r) => r.opdId === filterOpdId)
    }
    return allRows
  }, [filterTahun, filterOpdId, detailByTahun, opdList])

  const maxBarEvaluasi = useMemo(
    () => Math.max(1, ...barChartData.map((r) => r.jumlahEvaluasi)),
    [barChartData]
  )

  const toggleYear = (tahun: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      if (next.has(tahun)) next.delete(tahun)
      else next.add(tahun)
      return next
    })
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Grafik Evaluasi Tahunan' }]}
      title="Grafik Evaluasi Tahunan"
      description="Data penilaian OPD per tahun. Satu OPD dapat dievaluasi lebih dari sekali dalam setahun."
    >
      <div className="space-y-3">
        {summary.length === 0 ? (
          <div className="p-4 text-center text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <BarChart3 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-medium text-gray-600">Belum ada data penilaian OPD</p>
            <p className="text-xs text-gray-500 mt-0.5">Data akan muncul setelah ada riwayat penilaian OPD.</p>
          </div>
        ) : (
          <>
            {/* Card: header (title + filter satu baris) + grafik */}
            <section className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600 shrink-0" />
                  <h2 className="text-sm font-semibold text-gray-900">Jumlah Penilaian OPD per Tahun</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <Select
                    value={filterTahun}
                    onValueChange={setFilterTahun}
                    options={summary.map((s) => ({ value: s.tahun, label: s.tahun }))}
                    placeholder="Tahun"
                    className="w-24 h-8 text-xs"
                  />
                  <Select
                    value={filterOpdId}
                    onValueChange={setFilterOpdId}
                    options={[
                      { value: '', label: 'Semua OPD' },
                      ...opdList.map((o) => ({ value: o.id, label: o.nama })),
                    ]}
                    placeholder="OPD"
                    className="w-[160px] h-8 text-xs"
                  />
                </div>
              </div>

              {filterTahun && (
                <>
                  {barChartData.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-500 rounded-md border border-dashed border-gray-200 bg-gray-50">
                      Tidak ada data untuk filter yang dipilih.
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-1">
                      <div className="flex items-end gap-2 pl-1" style={{ height: 120, minWidth: 'min-content' }}>
                        {barChartData.map((row) => {
                          const hPct = (row.jumlahEvaluasi / maxBarEvaluasi) * 100
                          const barHeight = Math.max((hPct / 100) * 120, 12)
                          return (
                            <div
                              key={`${row.tahun}-${row.opdId}`}
                              className="flex flex-col items-center gap-1 shrink-0"
                              style={{ minWidth: 56 }}
                            >
                              <div
                                className="w-10 min-w-[40px] rounded-t bg-blue-500 hover:bg-blue-600 transition-colors"
                                style={{ height: barHeight }}
                                title={`${row.opdNama}: ${row.jumlahEvaluasi} evaluasi, skor ∅ ${row.rataRataSkor.toFixed(1)}`}
                              />
                              <span className="text-[10px] font-medium text-gray-700 text-center line-clamp-2 max-w-[56px]" title={row.opdNama}>
                                {row.opdNama}
                              </span>
                              <span className="text-[10px] tabular-nums text-blue-600 font-medium">{row.jumlahEvaluasi}×</span>
                              {row.rataRataSkor > 0 && (
                                <span className="text-[10px] text-gray-500">∅ {row.rataRataSkor}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Ringkasan: satu baris inline */}
            <section className="flex flex-wrap gap-1.5">
              {summary.map((d) => (
                <div
                  key={d.tahun}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-2.5 py-1.5 text-xs hover:shadow-sm transition-all"
                >
                  <span className="font-semibold text-gray-900">{d.tahun}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-blue-600 font-medium">{d.jumlahPenilaianOpd}</span>
                  <span className="text-gray-500">penilaian</span>
                  <span className="text-gray-400">·</span>
                  <span className="font-medium text-gray-700">{d.jumlahOpdTerevaluasi}</span>
                  <span className="text-gray-500">OPD</span>
                </div>
              ))}
            </section>

            {/* Detail per OPD */}
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all">
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                <h2 className="text-sm font-semibold text-gray-900">Detail per OPD per Tahun</h2>
                <span className="text-xs text-gray-500">— klik tahun untuk breakdown</span>
              </div>
              <div className="divide-y divide-gray-100">
                {summary.map((d) => {
                  const rows = detailByTahun[d.tahun] ?? []
                  const isExpanded = expandedYears.has(d.tahun)
                  const maxEval = Math.max(1, ...rows.map((r) => r.jumlahEvaluasi))
                  return (
                    <div key={d.tahun} className="bg-white">
                      <button
                        type="button"
                        onClick={() => toggleYear(d.tahun)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-all text-xs"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        )}
                        <span className="font-semibold text-gray-900">{d.tahun}</span>
                        <span className="text-gray-500">{rows.length} OPD · {d.jumlahPenilaianOpd} penilaian</span>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="rounded-md border border-gray-200 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="text-left py-1.5 px-2 text-gray-700 font-semibold">OPD</th>
                                  <th className="w-24 py-1.5 px-2 text-gray-700 font-semibold">Jumlah</th>
                                  <th className="text-right py-1.5 px-2 text-gray-700 font-semibold w-16">Skor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row) => {
                                  const barW = (row.jumlahEvaluasi / maxEval) * 100
                                  return (
                                    <tr key={`${row.tahun}-${row.opdId}`} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                      <td className="py-1.5 px-2 font-medium text-gray-900">{row.opdNama}</td>
                                      <td className="py-1.5 px-2">
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden min-w-[40px]">
                                            <div
                                              className="h-full rounded bg-blue-500"
                                              style={{ width: `${Math.max(barW, 10)}%`, minWidth: 4 }}
                                            />
                                          </div>
                                          <span className="text-gray-600 tabular-nums w-3">{row.jumlahEvaluasi}</span>
                                        </div>
                                      </td>
                                      <td className="py-1.5 px-2 text-right">
                                        <span className="inline-flex h-4 px-1.5 items-center justify-center rounded text-xs font-medium bg-blue-100 text-blue-700 min-w-[1.75rem]">
                                          {row.rataRataSkor > 0 ? row.rataRataSkor.toFixed(1) : '—'}
                                        </span>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </ListPageLayout>
  )
}
