import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useEvaluasi } from '@/features/evaluasi'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import type { PengajuanEvaluasi } from '@/features/evaluasi/types/evaluasi'

const STATUS_LABEL: Record<string, string> = {
  DIAJUKAN: 'Diajukan',
  SEDANG_DIEVALUASI: 'Sedang Dievaluasi',
  SELESAI_DIEVALUASI: 'Selesai Dievaluasi',
  DIVERIFIKASI_BIRO: 'Diverifikasi Biro',
  DITANDATANGANI_KOORDINATOR: 'Ditandatangani Koordinator',
  DISETUJAI: 'Disetujui',
  DITOLAK: 'Ditolak',
}

const STATUS_CONFIG: Record<string, { className: string }> = {
  DIVERIFIKASI_BIRO: { className: 'h-4 border-0 bg-orange-100 text-orange-700' },
  DITANDATANGANI_KOORDINATOR: { className: 'h-4 border-0 bg-green-100 text-green-700' },
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function BeritaAcaraKoordinatorPage() {
  const navigate = useNavigate()

  const { list: pengajuanList, isLoading, error } = useEvaluasi({})

  // Filter: show only evaluations that are ready for signature or already signed
  const filteredPengajuan = useMemo(() => {
    if (!pengajuanList) return []
    return pengajuanList.filter((p) => {
      return p.status === 'DIVERIFIKASI_BIRO' || p.status === 'DITANDATANGANI_KOORDINATOR'
    })
  }, [pengajuanList])

  const pendingCount = filteredPengajuan.filter((p) => p.status === 'DIVERIFIKASI_BIRO').length
  const signedCount = filteredPengajuan.filter((p) => p.status === 'DITANDATANGANI_KOORDINATOR').length

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Koordinator Tim Penyusun' }, { label: 'Berita Acara' }]}
      title="Berita Acara Evaluasi"
      description="Daftar evaluasi yang perlu ditandatangani atau sudah ditandatangani"
    >
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-orange-700" />
              <h3 className="text-xs text-gray-700">Menunggu Tanda Tangan</h3>
            </div>
            <p className="text-xl text-gray-900">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600" />
              <h3 className="text-xs text-gray-700">Sudah Ditandatangani</h3>
            </div>
            <p className="text-xl text-gray-900">{signedCount}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12 text-center">
            <AlertCircle className="mb-3 h-12 w-12 text-red-600" />
            <h3 className="mb-1 text-sm text-gray-900">
              Gagal Memuat Data
            </h3>
            <p className="mb-4 max-w-md text-xs text-gray-500">
              Terjadi kesalahan saat mengambil data berita acara. Periksa koneksi Anda dan coba lagi.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Data List */}
        {!error && (
          <div className="space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredPengajuan.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 py-12">
                <FileText className="mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-1 text-xs text-gray-700">
                  Belum ada Berita Acara Evaluasi
                </p>
                <p className="text-[10px] text-gray-400">
                  Berita Acara akan muncul setelah evaluasi selesai diverifikasi
                </p>
              </div>
            )}

            {!isLoading && filteredPengajuan.length > 0 && (
              <div className="space-y-2">
                {filteredPengajuan.map((pengajuan) => (
                  <div
                    key={pengajuan.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs text-gray-900">
                            {pengajuan.opdNama ?? pengajuan.opd?.nama ?? '-'}
                          </h3>
                          <Badge className={STATUS_CONFIG[pengajuan.status]?.className}>
                            {STATUS_LABEL[pengajuan.status] ?? pengajuan.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="text-xs text-gray-500">
                            Nomor BA:{' '}
                            <span className="font-mono text-gray-900">
                              {pengajuan.nomorBA ?? '-'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Tanggal Evaluasi:{' '}
                            <span className="text-gray-700">
                              {formatDate(pengajuan.tanggalVerifikasi)}
                            </span>
                          </div>
                          {pengajuan.timEvaluasi && (
                            <div className="col-span-2 text-xs text-gray-500">
                              Tim Evaluasi:{' '}
                              <span className="text-gray-700">{pengajuan.timEvaluasi}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate({
                            to: '/tim-penyusun/koordinator/berita-acara/$id',
                            params: { id: pengajuan.id },
                          })
                        }
                        className="h-8 px-3 text-xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ListPageLayout>
  )
}
