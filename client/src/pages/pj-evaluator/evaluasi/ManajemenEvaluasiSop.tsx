import { useEffect, useMemo, useState } from 'react'
import { Building2, ChevronDown, ChevronRight, Eye } from 'lucide-react'
import {
  STATUS_PENGAJUAN_SIAP_TTD_PJ_EVALUATOR,
  STATUS_RIWAYAT_FINAL_EVALUASI,
  usePengajuanEvaluasiRingkas,
} from '@/api/evaluasi'
import type { PengajuanEvaluasiRingkasRow } from '@/types/dto/evaluasi.dto'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { PengajuanStatusBadge } from '@/components/status/pengajuan-status-badge'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { readPaginationMeta } from '@/lib/api/pagination'
import { ROUTES, IA, DEFAULT_PAGE_SIZE } from '@/utils/constants'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatDateId } from '@/utils/format-date'

type FilterTab = 'pengajuan' | 'riwayat'
type PengajuanGroupByOpd = {
  opdId: string
  opdNama: string
  rows: PengajuanEvaluasiRingkasRow[]
  latestRequestAt: number
}

function labelJenis(jenis: string): string {
  if (jenis === 'TERJADWAL') return 'Terjadwal'
  if (jenis === 'MANDIRI') return 'Mandiri'
  return jenis
}

export function ManajemenEvaluasiSop() {
  useDocumentTitle(`${IA.NAV_BIRO_EVALUASI_TERJADWAL} — PJ Evaluator`)
  const [page, setPage] = useState(1)
  const [filterTab, setFilterTab] = useState<FilterTab>('pengajuan')
  const [expandedOpdIds, setExpandedOpdIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)

  const ringkasParams = useMemo(() => {
    const search =
      debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined
    const base = { page, limit: DEFAULT_PAGE_SIZE, search }
    if (filterTab === 'pengajuan') {
      return { ...base, statusIn: [...STATUS_PENGAJUAN_SIAP_TTD_PJ_EVALUATOR] }
    }
    return { ...base, statusIn: [...STATUS_RIWAYAT_FINAL_EVALUASI] }
  }, [page, debouncedSearch, filterTab])

  const { data, isLoading } = usePengajuanEvaluasiRingkas(ringkasParams)

  useEffect(() => {
    setPage(1)
  }, [filterTab, debouncedSearch])

  const items = data?.items ?? []
  const pagination = readPaginationMeta(data)
  const totalItems = pagination?.totalItems ?? 0

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'pengajuan', label: 'Pengajuan' },
    { id: 'riwayat', label: 'Riwayat' },
  ]

  const groupedByOpd = useMemo<PengajuanGroupByOpd[]>(() => {
    const map = new Map<string, PengajuanGroupByOpd>()
    for (const row of items) {
      const candidateDate = row.createdAt || row.tanggalEvaluasi || ''
      const requestAt = Date.parse(candidateDate)
      const requestTs = Number.isNaN(requestAt) ? 0 : requestAt
      const existing = map.get(row.opdId)
      if (!existing) {
        map.set(row.opdId, {
          opdId: row.opdId,
          opdNama: row.opdNama,
          rows: [row],
          latestRequestAt: requestTs,
        })
        continue
      }
      existing.rows.push(row)
      if (requestTs > existing.latestRequestAt) {
        existing.latestRequestAt = requestTs
      }
    }
    const groups = [...map.values()]
    for (const group of groups) {
      group.rows.sort((a, b) => {
        const aTs = Date.parse(a.createdAt || a.tanggalEvaluasi || '')
        const bTs = Date.parse(b.createdAt || b.tanggalEvaluasi || '')
        return (Number.isNaN(bTs) ? 0 : bTs) - (Number.isNaN(aTs) ? 0 : aTs)
      })
    }
    groups.sort((a, b) => b.latestRequestAt - a.latestRequestAt)
    return groups
  }, [items])

  useEffect(() => {
    setExpandedOpdIds((prev) => {
      const prevSet = new Set(prev)
      const existingIds = groupedByOpd.map((g) => g.opdId)
      const persisted = existingIds.filter((id) => prevSet.has(id))
      if (persisted.length > 0) {
        return persisted
      }
      return existingIds
    })
  }, [groupedByOpd])

  const toggleOpd = (opdId: string) => {
    setExpandedOpdIds((prev) =>
      prev.includes(opdId)
        ? prev.filter((id) => id !== opdId)
        : [...prev, opdId],
    )
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: IA.NAV_BIRO_BATCH_BA }]}
      title={IA.NAV_BIRO_BATCH_BA}
      description={`${IA.PENGAJUAN_EVALUASI_OPD} per OPD. Buka detail untuk ${IA.VERIFIKASI_BA_BIRO} pada dokumen ${IA.BERITA_ACARA}.`}
      toolbar={
        <div className="flex flex-col gap-3 w-full">
          <SearchToolbar
            searchPlaceholder="Cari OPD..."
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="w-full">
            <Tabs
              className="w-full"
              value={filterTab}
              onValueChange={(value) => setFilterTab(value as FilterTab)}
            >
              <TabsList className="h-8 p-0.5 w-full grid grid-cols-2">
                {filterTabs.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="h-7 text-xs">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table.Table>
              <tbody>
                <EmptyState
                  asTableRow
                  colSpan={6}
                  icon={<Building2 />}
                  title="Memuat data..."
                  description="Mohon tunggu."
                />
              </tbody>
            </Table.Table>
          </div>
        ) : groupedByOpd.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table.Table>
              <tbody>
                <EmptyState
                  asTableRow
                  colSpan={6}
                  icon={<Building2 />}
                  title="Tidak ada pengajuan"
                  description="Sesuaikan filter atau kata kunci pencarian."
                />
              </tbody>
            </Table.Table>
          </div>
        ) : (
          groupedByOpd.map((group) => {
            const isExpanded = expandedOpdIds.includes(group.opdId)
            return (
              <div
                key={group.opdId}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 border-b border-gray-100 bg-gray-50/70 hover:bg-gray-100/70 transition-colors"
                  onClick={() => toggleOpd(group.opdId)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <span className="font-semibold text-sm text-gray-900 truncate">
                        {group.opdNama}
                      </span>
                      <Badge variant="default" className="text-[11px] font-medium shrink-0">
                        {group.rows.length} pengajuan
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      Request terbaru{' '}
                      {group.latestRequestAt > 0
                        ? formatDateId(new Date(group.latestRequestAt).toISOString())
                        : '-'}
                    </span>
                  </div>
                </button>
                {isExpanded ? (
                  <Table.Table>
                    <thead>
                      <Table.HeadRow>
                        <Table.Th>Jenis</Table.Th>
                        <Table.Th>Status pengajuan</Table.Th>
                        <Table.Th>Tanggal</Table.Th>
                        <Table.Th>Progres</Table.Th>
                        <Table.Th align="center">Aksi</Table.Th>
                      </Table.HeadRow>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => (
                        <Table.BodyRow key={row.pengajuanEvaluasiId}>
                          <Table.Td className="text-gray-700">
                            {labelJenis(row.jenis)}
                          </Table.Td>
                          <Table.Td>
                            <PengajuanStatusBadge
                              status={row.status}
                              label={row.statusLabel}
                              showDomain={false}
                            />
                          </Table.Td>
                          <Table.Td className="text-gray-600 whitespace-nowrap">
                            {row.createdAt
                              ? formatDateId(row.createdAt)
                              : row.tanggalEvaluasi
                                ? formatDateId(row.tanggalEvaluasi)
                                : '-'}
                          </Table.Td>
                          <Table.Td className="text-gray-700">
                            <span className="tabular-nums">
                              {row.jumlahSudahDinilai} / {row.jumlahSop}
                            </span>{' '}
                            <span className="text-gray-500">SOP dinilai</span>
                          </Table.Td>
                          <Table.Td className="text-center">
                            <IconActionButton
                              icon={Eye}
                              to={ROUTES.PJ_EVALUATOR.DETAIL_EVALUASI}
                              params={{ id: row.pengajuanEvaluasiId }}
                              title="Detail evaluasi"
                              variant="outline"
                            />
                          </Table.Td>
                        </Table.BodyRow>
                      ))}
                    </tbody>
                  </Table.Table>
                ) : null}
              </div>
            )
          })
        )}
        {pagination ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <Pagination
              totalItems={totalItems}
              currentPage={pagination.page}
              onPageChange={setPage}
              pageSize={pagination.limit}
              label="pengajuan"
            />
          </div>
        ) : null}
      </div>
    </ListPageLayout>
  )
}
