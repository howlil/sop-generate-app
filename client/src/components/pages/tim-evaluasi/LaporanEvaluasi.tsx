import { useState } from 'react'
import {
  FileText,
  Eye,
  Download,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/layout/PageHeader'

interface Laporan {
  id: string
  kodeLaporan: string
  kodePenugasan: string
  sop: string
  opd: string
  tanggalEvaluasi: string
  tanggalLaporan: string
  status: 'Sesuai' | 'Tidak Sesuai'
  jumlahTemuan: number
}

const laporanList: Laporan[] = [
  {
    id: '1',
    kodeLaporan: 'LAP-EVL-012/2026',
    kodePenugasan: 'TUG-EVL-012/2026',
    sop: 'SOP Penerimaan Siswa Baru 2026',
    opd: 'Dinas Pendidikan',
    tanggalEvaluasi: '2026-01-28',
    tanggalLaporan: '2026-01-29',
    status: 'Tidak Sesuai',
    jumlahTemuan: 3,
  },
  {
    id: '2',
    kodeLaporan: 'LAP-EVL-010/2026',
    kodePenugasan: 'TUG-EVL-010/2026',
    sop: 'SOP Ujian Akhir Semester',
    opd: 'Dinas Pendidikan',
    tanggalEvaluasi: '2026-01-15',
    tanggalLaporan: '2026-01-16',
    status: 'Sesuai',
    jumlahTemuan: 0,
  },
  {
    id: '3',
    kodeLaporan: 'LAP-EVL-008/2025',
    kodePenugasan: 'TUG-EVL-008/2025',
    sop: 'SOP Pelayanan Perpustakaan',
    opd: 'Dinas Pendidikan',
    tanggalEvaluasi: '2025-12-20',
    tanggalLaporan: '2025-12-21',
    status: 'Sesuai',
    jumlahTemuan: 0,
  },
]

const laporanDetail: Record<
  string,
  {
    kesimpulan: string
    metodologi: string
    temuan: Array<{
      bagian: string
      kategori: string
      temuan: string
      referensi: string
      rekomendasi: string
    }>
    rekomendasi: string
  }
> = {
  '1': {
    kesimpulan:
      'Evaluasi terhadap SOP Penerimaan Siswa Baru 2026 menunjukkan bahwa secara umum prosedur sudah cukup baik, namun masih terdapat beberapa aspek yang perlu diperbaiki, terutama terkait waktu proses dan kejelasan diagram alir.',
    metodologi:
      'Evaluasi dilakukan melalui review dokumen SOP, observasi proses pendaftaran, dan wawancara dengan petugas pelaksana. Evaluasi dilaksanakan pada tanggal 28 Januari 2026.',
    temuan: [
      {
        bagian: '6. Prosedur Kerja',
        kategori: 'Major',
        temuan:
          'Waktu verifikasi dokumen yang tercantum (7 hari kerja) tidak sesuai dengan standar pelayanan minimal yang ditetapkan dalam Permendikbud',
        referensi: 'Permendikbud No. 1/2021 Pasal 12 ayat 3',
        rekomendasi: 'Revisi waktu verifikasi menjadi maksimal 3 hari kerja sesuai regulasi',
      },
      {
        bagian: '7. Diagram Alir',
        kategori: 'Minor',
        temuan:
          'Diagram alir belum menjelaskan secara detail alur penanganan jika dokumen tidak lengkap atau tidak valid',
        referensi: '-',
        rekomendasi:
          'Tambahkan decision point yang lebih rinci untuk kasus dokumen tidak lengkap dengan prosedur klarifikasi',
      },
      {
        bagian: '8. Lampiran',
        kategori: 'Minor',
        temuan:
          'Belum ada formulir mekanisme pengaduan yang dilampirkan sebagai bagian dari SOP',
        referensi: 'Permenpan RB No. 35/2012 tentang Pedoman Penyusunan SOP',
        rekomendasi:
          'Tambahkan lampiran formulir pengaduan dan prosedur penyelesaian keluhan masyarakat',
      },
    ],
    rekomendasi:
      'Segera lakukan revisi SOP dengan fokus pada penyesuaian waktu proses sesuai regulasi, penyempurnaan diagram alir untuk kasus exceptional, dan penambahan mekanisme pengaduan. Sosialisasi ulang diperlukan setelah revisi selesai.',
  },
}

export function LaporanEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null)

  const filteredLaporan = laporanList.filter((laporan) => {
    const matchSearch =
      laporan.sop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laporan.kodeLaporan.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || laporan.status === filterStatus
    return matchSearch && matchStatus
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      Sesuai: 'bg-green-100 text-green-700',
      'Tidak Sesuai': 'bg-red-100 text-red-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Laporan Evaluasi' }]}
        title="Laporan Evaluasi"
        description="Riwayat laporan hasil evaluasi SOP"
      />
      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            placeholder="Cari laporan evaluasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="h-8 w-[160px] rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Sesuai">Sesuai</option>
            <option value="Tidak Sesuai">Tidak Sesuai</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-900">Riwayat Laporan Evaluasi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Kode Laporan</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">SOP</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLaporan.map((laporan) => (
                <tr
                  key={laporan.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="py-2.5 px-3 font-mono text-gray-900 text-[11px]">{laporan.kodeLaporan}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{laporan.sop}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={`${getStatusBadge(laporan.status)} text-xs border-0`}>
                      {laporan.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setSelectedLaporan(laporan)
                          setIsPreviewOpen(true)
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setSelectedLaporan(laporan)
                          setIsPreviewOpen(true)
                        }}
                        title="Preview lalu gunakan Unduh PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Laporan Hasil Evaluasi</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedLaporan?.kodeLaporan} - {selectedLaporan?.sop}
            </DialogDescription>
          </DialogHeader>
          {selectedLaporan && (
            <div className="space-y-3">
              {laporanDetail[selectedLaporan.id] ? (
              <>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-0.5">Kode Laporan</p>
                    <p className="font-mono font-medium">{selectedLaporan.kodeLaporan}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">Tanggal Laporan</p>
                    <p className="font-medium">
                      {new Date(selectedLaporan.tanggalLaporan).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">OPD</p>
                    <p className="font-medium">{selectedLaporan.opd}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-0.5">SOP</p>
                    <p className="font-medium">{selectedLaporan.sop}</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-md ${
                  selectedLaporan.status === 'Sesuai'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedLaporan.status === 'Sesuai' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      selectedLaporan.status === 'Sesuai' ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    Status Hasil Evaluasi: {selectedLaporan.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Metodologi Evaluasi</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {laporanDetail[selectedLaporan.id].metodologi}
                </p>
              </div>

              <div className="p-3 bg-white border border-gray-200 rounded-md">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Kesimpulan</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {laporanDetail[selectedLaporan.id].kesimpulan}
                </p>
              </div>

              {laporanDetail[selectedLaporan.id].temuan.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3">
                    Temuan ({laporanDetail[selectedLaporan.id].temuan.length})
                  </h3>
                  <div className="space-y-3">
                    {laporanDetail[selectedLaporan.id].temuan.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            #{idx + 1}
                          </Badge>
                          <Badge
                            className={`text-xs border-0 ${
                              item.kategori === 'Critical'
                                ? 'bg-red-100 text-red-700'
                                : item.kategori === 'Major'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {item.kategori}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.bagian}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-900 mb-1">
                          <strong>Temuan:</strong> {item.temuan}
                        </p>
                        {item.referensi !== '-' && (
                          <p className="text-xs text-gray-700 mb-1">
                            <strong>Referensi:</strong> {item.referensi}
                          </p>
                        )}
                        <p className="text-xs text-gray-700">
                          <strong>Rekomendasi:</strong> {item.rekomendasi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Rekomendasi Umum</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {laporanDetail[selectedLaporan.id].rekomendasi}
                </p>
              </div>
              </>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-xs text-gray-500">
                  Detail laporan tidak tersedia untuk laporan ini.
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => window.print()}
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => setIsPreviewOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
