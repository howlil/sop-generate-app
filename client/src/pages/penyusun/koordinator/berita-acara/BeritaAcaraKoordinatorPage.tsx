import { useNavigate } from '@tanstack/react-router'
import { useBeritaAcaraPjPenyusun } from '@/api/evaluasi'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { EmptyState } from '@/components/ui/empty-state'
import { PengajuanStatusBadge } from '@/components/status/pengajuan-status-badge'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import type { PengajuanEvaluasi } from '@/types/dto/evaluasi.dto'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function BeritaAcaraKoordinatorPage() {
  const navigate = useNavigate()
  const { perluTindakan, riwayat, isLoading, error } = useBeritaAcaraPjPenyusun()

  const renderBeritaAcaraTable = (
    data: PengajuanEvaluasi[],
    emptyTitle: string,
    emptyDescription: string,
  ) => (
    <Table.Paginated data={data} pageSize={15} label="berita acara">
      {(pageData) => (
        <Table.Root>
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>OPD</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Nomor BA</Table.Th>
                <Table.Th>Tanggal Evaluasi</Table.Th>
                <Table.Th>Evaluator</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array.from({ length: 5 }).keys()].map((row) => (
                  <Table.BodyRow key={`sk-${row}`}>
                    {[...Array.from({ length: 6 }).keys()].map((col) => (
                      <Table.Td key={`sk-${row}-${col}`}>
                        <div className="h-3 animate-pulse rounded bg-gray-200" />
                      </Table.Td>
                    ))}
                  </Table.BodyRow>
                ))
              ) : pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={6}
                  icon={<FileText />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                pageData.map((pengajuan) => (
                  <Table.BodyRow key={pengajuan.id}>
                    <Table.Td className="max-w-[200px]">
                      <span className="font-medium text-gray-900">
                        {pengajuan.opdNama ?? pengajuan.opd?.nama ?? '—'}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <PengajuanStatusBadge
                        status={pengajuan.status}
                        label={pengajuan.statusLabel ?? pengajuan.status}
                        showDomain={false}
                      />
                    </Table.Td>
                    <Table.Td>
                      <span className="font-mono text-gray-900">
                        {pengajuan.nomorBA?.trim() || '—'}
                      </span>
                    </Table.Td>
                    <Table.Td className="whitespace-nowrap text-gray-700">
                      {formatDate(pengajuan.tanggalVerifikasi)}
                    </Table.Td>
                    <Table.Td className="max-w-[280px] text-gray-700">
                      {pengajuan.timEvaluasi ?? '—'}
                    </Table.Td>
                    <Table.Td className="text-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate({
                            to: ROUTES.PENYUSUN.DETAIL_BERITA_ACARA,
                            params: { id: pengajuan.id },
                          })
                        }
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Lihat Detail Berita Acara"
                        title="Lihat Detail"
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        </Table.Root>
      )}
    </Table.Paginated>
  )

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'PJ Penyusun' }, { label: 'Berita Acara' }]}
      title="Berita Acara Evaluasi"
      description="Kelola tanda tangan Berita Acara dan akses arsip pengajuan evaluasi yang sudah selesai."
    >
      <div className="space-y-4">
        {error && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
            <AlertCircle className="mb-3 h-12 w-12 text-red-600" />
            <h3 className="mb-1 text-sm text-gray-900">Gagal Memuat Data</h3>
            <p className="mb-4 max-w-md text-xs text-gray-500">
              Terjadi kesalahan saat mengambil data berita acara. Periksa koneksi Anda dan coba lagi.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        )}

        {!error && (
          <Tabs defaultValue="perlu" className="space-y-3">
            <TabsList className="h-9 w-full grid grid-cols-2">
              <TabsTrigger value="perlu" className="text-xs w-full">
                Perlu Tanda Tangan ({perluTindakan.length})
              </TabsTrigger>
              <TabsTrigger value="riwayat" className="text-xs w-full">
                Riwayat ({riwayat.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="perlu" className="mt-0">
              {renderBeritaAcaraTable(
                perluTindakan,
                'Belum ada BA menunggu tanda tangan',
                'Berita Acara akan muncul setelah PJ Evaluator memverifikasi evaluasi.',
              )}
            </TabsContent>
            <TabsContent value="riwayat" className="mt-0">
              {renderBeritaAcaraTable(
                riwayat,
                'Belum ada riwayat Berita Acara',
                'BA yang sudah Anda tandatangani atau pengajuan evaluasi yang sudah selesai total akan tampil di sini.',
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ListPageLayout>
  )
}
