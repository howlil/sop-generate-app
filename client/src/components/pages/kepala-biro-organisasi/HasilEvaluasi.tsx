import { useState, useEffect } from 'react'
import { FileCheck, Eye, Download, CheckCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface HasilEvaluasiItem {
  id: string
  batchName: string
  opd: string
  evaluator: string
  tanggalEvaluasi: string
  sopList: Array<{
    nama: string
    nomor: string
    status: 'Sesuai' | 'Perlu Perbaikan' | 'Tidak Sesuai'
    catatan: string
    rekomendasi: string
  }>
  isVerified: boolean
  nomorBA?: string
  tanggalVerifikasi?: string
  kepalaBiro?: string
}

export function HasilEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isBAOpen, setIsBAOpen] = useState(false)
  const [selectedHasil, setSelectedHasil] = useState<HasilEvaluasiItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [hasilList, setHasilList] = useState<HasilEvaluasiItem[]>([
    {
      id: '1',
      batchName: 'Evaluasi Q1 2026 - Dinas Pendidikan',
      opd: 'Dinas Pendidikan',
      evaluator: 'Dra. Siti Aminah, M.Si',
      tanggalEvaluasi: '2026-02-05',
      sopList: [
        {
          nama: 'SOP Penerimaan Siswa Baru',
          nomor: 'SOP-DISDIK-001/2026',
          status: 'Sesuai',
          catatan: 'Proses berjalan lancar, sistem pendaftaran online efektif.',
          rekomendasi: 'Tingkatkan kapasitas server untuk mengantisipasi lonjakan akses.',
        },
        {
          nama: 'SOP Ujian Sekolah',
          nomor: 'SOP-DISDIK-005/2026',
          status: 'Sesuai',
          catatan: 'Prosedur ujian sesuai standar, pengawasan ketat.',
          rekomendasi: 'Pertahankan standar pengawasan.',
        },
      ],
      isVerified: true,
      nomorBA: 'BA/BIRO/001/II/2026',
      tanggalVerifikasi: '2026-02-06',
      kepalaBiro: 'Dr. H. Muhammad Ridwan, M.Si',
    },
    {
      id: '2',
      batchName: 'Evaluasi Request - DPMPTSP',
      opd: 'DPMPTSP',
      evaluator: 'Dr. Bambang Suryanto',
      tanggalEvaluasi: '2026-02-04',
      sopList: [
        {
          nama: 'SOP Perizinan Usaha Mikro',
          nomor: 'SOP-DPMPTSP-005/2026',
          status: 'Perlu Perbaikan',
          catatan: 'Beberapa tahapan tidak konsisten, dokumentasi kurang lengkap.',
          rekomendasi: 'Perbaiki konsistensi prosedur dan lengkapi dokumentasi.',
        },
      ],
      isVerified: false,
    },
    {
      id: '3',
      batchName: 'Evaluasi Q1 2026 - Dinas Kesehatan',
      opd: 'Dinas Kesehatan',
      evaluator: 'Ir. Dewi Kusumawati, MT',
      tanggalEvaluasi: '2026-02-03',
      sopList: [
        {
          nama: 'SOP Pelayanan Kesehatan Dasar',
          nomor: 'SOP-DINKES-012/2026',
          status: 'Sesuai',
          catatan: 'Pelayanan berjalan baik, waktu tunggu sesuai standar.',
          rekomendasi: 'Pertahankan kualitas pelayanan.',
        },
        {
          nama: 'SOP Imunisasi',
          nomor: 'SOP-DINKES-018/2026',
          status: 'Sesuai',
          catatan: 'Program imunisasi berjalan sesuai jadwal.',
          rekomendasi: 'Tingkatkan sosialisasi ke masyarakat.',
        },
        {
          nama: 'SOP Rujukan Pasien',
          nomor: 'SOP-DINKES-022/2026',
          status: 'Sesuai',
          catatan: 'Sistem rujukan efektif, koordinasi antar fasilitas baik.',
          rekomendasi: 'Pertahankan koordinasi.',
        },
      ],
      isVerified: false,
    },
  ])

  const filteredHasil = hasilList.filter(
    (item) =>
      item.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.opd.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openDetailDialog = (hasil: HasilEvaluasiItem) => {
    setSelectedHasil(hasil)
    setIsDetailOpen(true)
  }

  const openBADialog = (hasil: HasilEvaluasiItem) => {
    setSelectedHasil(hasil)
    setIsBAOpen(true)
  }

  const handleVerifikasi = (id: string) => {
    const batchNumber = `BA/BIRO/${String(
      hasilList.filter((h) => h.isVerified).length + 1
    ).padStart(3, '0')}/II/2026`
    setHasilList(
      hasilList.map((h) =>
        h.id === id
          ? {
              ...h,
              isVerified: true,
              nomorBA: batchNumber,
              tanggalVerifikasi: new Date().toISOString().split('T')[0],
              kepalaBiro: 'Dr. H. Muhammad Ridwan, M.Si',
            }
          : h
      )
    )
    setToastMessage('Batch evaluasi berhasil diverifikasi. Berita Acara telah dibuat.')
    setIsDetailOpen(false)
  }

  const canVerify = (hasil: HasilEvaluasiItem) => {
    return hasil.sopList.every((sop) => sop.status === 'Sesuai') && !hasil.isVerified
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sesuai':
        return 'bg-green-100 text-green-700'
      case 'Perlu Perbaikan':
        return 'bg-yellow-100 text-yellow-700'
      case 'Tidak Sesuai':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Hasil Evaluasi' }]}
        title="Hasil Evaluasi"
        description="Verifikasi dan arsip hasil evaluasi SOP"
      />
      {toastMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-md">
          {toastMessage}
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-1">
          <SearchInput
            placeholder="Cari hasil evaluasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredHasil.map((hasil) => (
          <div key={hasil.id} className="bg-white rounded-md border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-900 mb-1">{hasil.batchName}</h3>
                <p className="text-xs text-gray-500">{hasil.opd}</p>
              </div>
              {hasil.isVerified && (
                <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 mb-3">
              <p className="text-xs text-gray-600">
                <strong>Evaluator:</strong> {hasil.evaluator}
              </p>
              <p className="text-xs text-gray-600">
                <strong>Tanggal:</strong>{' '}
                {new Date(hasil.tanggalEvaluasi).toLocaleDateString('id-ID')}
              </p>
              <p className="text-xs text-gray-600">
                <strong>Jumlah SOP:</strong> {hasil.sopList.length}
              </p>
              <div className="flex gap-1 flex-wrap">
                {hasil.sopList.map((sop, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex h-5 px-1.5 items-center rounded text-xs ${getStatusColor(sop.status)}`}
                  >
                    {sop.status}
                  </span>
                ))}
              </div>

              {hasil.isVerified && hasil.nomorBA && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => openBADialog(hasil)}
                    className="w-full p-2 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">
                          Terlampir Berita Acara
                        </span>
                      </div>
                      <Eye className="w-3 h-3 text-blue-600" />
                    </div>
                    <p className="text-xs text-blue-600 mt-0.5 text-left">{hasil.nomorBA}</p>
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => openDetailDialog(hasil)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Detail
              </Button>
              {canVerify(hasil) && (
                <Button
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => handleVerifikasi(hasil.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verifikasi
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Detail Hasil Evaluasi</DialogTitle>
          </DialogHeader>
          {selectedHasil && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{selectedHasil.batchName}</h3>
                    <p className="text-xs text-gray-500">{selectedHasil.opd}</p>
                  </div>
                  {selectedHasil.isVerified && (
                    <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Evaluator:</span>
                    <span className="ml-2 font-medium">{selectedHasil.evaluator}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tanggal:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedHasil.tanggalEvaluasi).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold">
                  SOP yang Dievaluasi ({selectedHasil.sopList.length})
                </h4>
                {selectedHasil.sopList.map((sop, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded-md space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{sop.nama}</p>
                        <p className="text-xs text-gray-500">{sop.nomor}</p>
                      </div>
                      <span
                        className={`inline-flex h-5 px-1.5 items-center rounded text-xs ${getStatusColor(sop.status)}`}
                      >
                        {sop.status}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2 bg-blue-50 rounded border border-blue-100">
                        <p className="text-xs text-gray-600">
                          <strong>Catatan:</strong> {sop.catatan}
                        </p>
                      </div>
                      <div className="p-2 bg-green-50 rounded border border-green-100">
                        <p className="text-xs text-gray-600">
                          <strong>Rekomendasi:</strong> {sop.rekomendasi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {canVerify(selectedHasil) && (
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <p className="text-xs text-gray-700 mb-2">
                    <strong>Semua SOP dalam batch ini berstatus "Sesuai".</strong> Batch evaluasi ini
                    dapat diverifikasi oleh Kepala Biro untuk menghasilkan Berita Acara.
                  </p>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => handleVerifikasi(selectedHasil.id)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verifikasi Batch Ini
                  </Button>
                </div>
              )}

              {selectedHasil.isVerified && selectedHasil.nomorBA && (
                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Berita Acara Tersedia
                      </p>
                      <p className="text-xs text-blue-700">{selectedHasil.nomorBA}</p>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => openBADialog(selectedHasil)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Lihat BA
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBAOpen} onOpenChange={setIsBAOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Berita Acara Verifikasi Evaluasi SOP
            </DialogTitle>
          </DialogHeader>
          {selectedHasil && selectedHasil.nomorBA && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-sm font-semibold mb-1">BERITA ACARA</h2>
                <h3 className="text-sm font-semibold mb-2">
                  VERIFIKASI MONITORING DAN EVALUASI SOP
                </h3>
                <p className="text-xs">Nomor: {selectedHasil.nomorBA}</p>
              </div>

              <div className="space-y-3 text-xs">
                <p className="leading-relaxed">
                  Pada hari ini,{' '}
                  <strong>
                    {selectedHasil.tanggalVerifikasi &&
                      new Date(selectedHasil.tanggalVerifikasi).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                  </strong>
                  , telah dilaksanakan verifikasi hasil monitoring dan evaluasi SOP batch:{' '}
                  <strong>{selectedHasil.batchName}</strong>
                </p>

                <div className="p-3 bg-gray-50 rounded-md">
                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="py-1 w-1/4">Batch Evaluasi</td>
                        <td className="py-1">: {selectedHasil.batchName}</td>
                      </tr>
                      <tr>
                        <td className="py-1">OPD</td>
                        <td className="py-1">: {selectedHasil.opd}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Evaluator</td>
                        <td className="py-1">: {selectedHasil.evaluator}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Tanggal Evaluasi</td>
                        <td className="py-1">
                          :{' '}
                          {new Date(selectedHasil.tanggalEvaluasi).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">Jumlah SOP</td>
                        <td className="py-1">: {selectedHasil.sopList.length} SOP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Daftar SOP yang Dievaluasi:</h4>
                  <div className="space-y-2">
                    {selectedHasil.sopList.map((sop, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-green-50 rounded-md border border-green-100"
                      >
                        <p className="font-semibold">
                          {idx + 1}. {sop.nama}
                        </p>
                        <p className="text-gray-600 mb-2">{sop.nomor}</p>
                        <p className="mb-1">
                          <strong>Catatan:</strong> {sop.catatan}
                        </p>
                        <p>
                          <strong>Rekomendasi:</strong> {sop.rekomendasi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Kesimpulan:</h4>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="leading-relaxed">
                      Berdasarkan hasil monitoring dan evaluasi,{' '}
                      <strong>seluruh {selectedHasil.sopList.length} SOP</strong> dalam batch ini
                      dinyatakan <strong className="text-green-700">SESUAI</strong> dengan standar
                      yang telah ditetapkan dan dapat terus diimplementasikan.
                    </p>
                  </div>
                </div>

                <p className="leading-relaxed">
                  Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan
                  sebagaimana mestinya.
                </p>

                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="text-center">
                    <p className="mb-16">Evaluator,</p>
                    <p className="font-semibold">{selectedHasil.evaluator}</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-16">Kepala Biro Organisasi,</p>
                    <p className="font-semibold">{selectedHasil.kepalaBiro}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsBAOpen(false)}
            >
              Tutup
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => window.print()}
            >
              <Download className="w-3.5 h-3.5" />
              Unduh PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
