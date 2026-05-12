import { useNavigate } from '@tanstack/react-router'
import { useEvaluasi } from '@/api/evaluasi'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { FileText, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import type { PengajuanEvaluasi } from '@/types/dto/evaluasi.dto'

const BERITA_ACARA_KOORDINATOR_STATUS_IN = [
  'DIVERIFIKASI_PJ_EVALUATOR',
  'DITANDATANGANI_PJ_PENYUSUN',
] as const satisfies readonly PengajuanEvaluasi['status'][]

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

  const { list: pengajuanList, isLoading, error } = useEvaluasi({
    statusIn: [...BERITA_ACARA_KOORDINATOR_STATUS_IN],
  })

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'PJ Penyusun' }, { label: 'Berita Acara' }]}
      title="Berita Acara Evaluasi"
      description="Daftar evaluasi yang perlu ditandatangani atau sudah ditandatangani"
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

        {!error && isLoading && (
          <Table.Card>
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <Table.BodyRow key={i}>
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <Table.Td key={c}>
                        <div className="h-3 animate-pulse rounded bg-gray-200" />
                      </Table.Td>
                    ))}
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          </Table.Card>
        )}

        {!error && !isLoading && pengajuanList.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 py-12">
            <FileText className="mb-3 h-12 w-12 text-gray-400" />
            <p className="mb-1 text-xs text-gray-700">Belum ada Berita Acara Evaluasi</p>
            <p className="text-[10px] text-gray-400">
              Berita Acara akan muncul setelah evaluasi selesai diverifikasi
            </p>
          </div>
        )}

        {!error && !isLoading && pengajuanList.length > 0 && (
          <Table.Paginated data={pengajuanList} pageSize={15} label="berita acara">
            {(pageData) => (
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
                  {pageData.map((pengajuan) => (
                    <Table.BodyRow key={pengajuan.id}>
                        <Table.Td className="max-w-[200px]">
                          <span className="font-medium text-gray-900">
                            {pengajuan.opdNama ?? pengajuan.opd?.nama ?? '—'}
                          </span>
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge status={pengajuan.status} />
                        </Table.Td>
                        <Table.Td>
                          <span className="font-mono text-gray-900">{pengajuan.nomorBA?.trim() || '—'}</span>
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
                  ))}
                </tbody>
              </Table.Table>
            )}
          </Table.Paginated>
        )}
      </div>
    </ListPageLayout>
  )
}
