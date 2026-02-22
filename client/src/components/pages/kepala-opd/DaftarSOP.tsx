import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Filter,
  Eye,
  Send,
  Plus,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toast } from '@/components/ui/toast'
import { StatusBadge } from '@/components/ui/status-badge'
import { getActiveCaseForSop, getRiwayatEvaluasiForSop, addEvaluationCase } from '@/lib/evaluation-case'
import type { EvaluationCaseSourceType } from '@/lib/evaluation-case'
import { STATUS_SOP_ALL, canAjukanEvaluasiSOP, type StatusSOP } from '@/lib/sop-status'
import { mergeSopStatus, setSopStatusOverride } from '@/lib/sop-status-store'

interface SOP {
  id: string
  /** Nomor SOP (sama dengan field inisiasi) */
  nomorSOP: string
  judul: string
  deskripsi: string
  /** Waktu penugasan: otomatis terbuat ketika proyek diinisiasi */
  waktuPenugasan: string
  /** Terakhir diperbarui ketika ada update detail */
  terakhirDiperbarui: string
  /** Tim penyusun yang ditugaskan */
  timPenyusun: string
  /** Unit terkait */
  unitTerkait: string
  peraturan: string
  peraturanId: string
  status: StatusSOP
  versi: string
  kategori: string
  /** Id EvaluationCase aktif (satu SOP hanya satu case aktif). Kosong = boleh diajukan. */
  evaluationCaseId?: string | null
}

export function DaftarSOP() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPeraturan, setFilterPeraturan] = useState<string>('all')
  const [filterTanggalDari, setFilterTanggalDari] = useState('')
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [isRequestEvaluasiDialogOpen, setIsRequestEvaluasiDialogOpen] = useState(false)
  const [selectedSopIdsForAjukan, setSelectedSopIdsForAjukan] = useState<Set<string>>(new Set())

  const [sopList, setSopList] = useState<SOP[]>([
    {
      id: '1',
      nomorSOP: 'SOP/DISDIK/PLY/2026/001',
      judul: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027',
      deskripsi: 'Tata cara penerimaan siswa baru dan verifikasi berkas pendaftaran.',
      waktuPenugasan: '2025-12-01',
      terakhirDiperbarui: '2026-01-15',
      timPenyusun: 'Tim Penyusun A',
      unitTerkait: 'Bidang Pendidikan Dasar',
      peraturan: 'Permendikbud No. 1/2026',
      peraturanId: 'p1',
      status: 'Berlaku',
      versi: '3.0',
      kategori: 'Pelayanan',
    },
    {
      id: '2',
      nomorSOP: 'SOP/DISDIK/PLY/2026/005',
      judul: 'SOP Pelaksanaan Ujian Akhir Sekolah',
      deskripsi: 'Prosedur pelaksanaan UAS dan pengawasan ujian.',
      waktuPenugasan: '2025-11-15',
      terakhirDiperbarui: '2026-02-01',
      timPenyusun: 'Tim Penyusun A',
      unitTerkait: 'Bidang Pendidikan Dasar',
      peraturan: 'Permendikbud No. 1/2026',
      peraturanId: 'p1',
      status: 'Terverifikasi dari Kepala Biro',
      versi: '2.1',
      kategori: 'Pelayanan',
    },
    {
      id: '3',
      nomorSOP: 'SOP/DISDIK/ADM/2026/003',
      judul: 'SOP Pengelolaan Data Kepegawaian Guru',
      deskripsi: 'Pengelolaan data guru dan update NUP/NIP.',
      waktuPenugasan: '2025-12-10',
      terakhirDiperbarui: '2026-02-05',
      timPenyusun: 'Tim Penyusun B',
      unitTerkait: 'Bidang SDM',
      peraturan: 'Permendikbud No. 5/2025',
      peraturanId: 'p2',
      status: 'Dievaluasi Tim Evaluasi',
      versi: '1.0',
      kategori: 'Administrasi',
      evaluationCaseId: 'EV-2026-001',
    },
    {
      id: '4',
      nomorSOP: 'SOP/DISDIK/PLY/2026/008',
      judul: 'SOP Pemberian Beasiswa Siswa Berprestasi',
      deskripsi: 'Syarat dan tata cara pemberian beasiswa bagi siswa berprestasi.',
      waktuPenugasan: '2025-11-20',
      terakhirDiperbarui: '2026-01-28',
      timPenyusun: 'Tim Penyusun C',
      unitTerkait: 'Bidang Pendidikan Dasar',
      peraturan: 'Perda No. 3/2025',
      peraturanId: 'p3',
      status: 'Revisi dari Tim Evaluasi',
      versi: '1.2',
      kategori: 'Pelayanan',
    },
    {
      id: '5',
      nomorSOP: 'SOP/DISDIK/ADM/2026/011',
      judul: 'SOP Pelaporan Keuangan Sekolah',
      deskripsi: 'Alur pelaporan keuangan dan pertanggungjawaban dana BOS.',
      waktuPenugasan: '2025-12-05',
      terakhirDiperbarui: '2026-02-10',
      timPenyusun: 'Tim Penyusun A',
      unitTerkait: 'Bidang Keuangan',
      peraturan: 'Permendikbud No. 8/2025',
      peraturanId: 'p4',
      status: 'Diperiksa Kepala OPD',
      versi: '1.0',
      kategori: 'Administrasi',
    },
    {
      id: '6',
      nomorSOP: 'SOP/DISDIK/PLY/2026/012',
      judul: 'SOP Pelayanan Mutasi Siswa Antar Sekolah',
      deskripsi: 'Prosedur mutasi siswa dan penerbitan surat pindah.',
      waktuPenugasan: '2026-01-08',
      terakhirDiperbarui: '2026-02-11',
      timPenyusun: 'Tim Penyusun B',
      unitTerkait: 'Bidang Pendidikan Dasar',
      peraturan: 'Permendikbud No. 1/2026',
      peraturanId: 'p1',
      status: 'Draft',
      versi: '0.5',
      kategori: 'Pelayanan',
    },
    {
      id: '7',
      nomorSOP: 'SOP/DISDIK/PLY/2026/013',
      judul: 'SOP Pengaduan Masyarakat di Bidang Pendidikan',
      deskripsi: 'Penanganan pengaduan dan respon waktu tanggap.',
      waktuPenugasan: '2025-11-01',
      terakhirDiperbarui: '2026-02-08',
      timPenyusun: 'Tim Penyusun C',
      unitTerkait: 'Bidang Pelayanan',
      peraturan: 'Perda No. 3/2025',
      peraturanId: 'p3',
      status: 'Siap Dievaluasi',
      versi: '2.0',
      kategori: 'Pelayanan',
    },
    {
      id: '8',
      nomorSOP: 'SOP/DISDIK/ADM/2026/015',
      judul: 'SOP Monitoring dan Evaluasi Program Pendidikan',
      deskripsi: 'Monitoring program dan evaluasi capaian indikator.',
      waktuPenugasan: '2025-12-15',
      terakhirDiperbarui: '2026-02-09',
      timPenyusun: 'Tim Penyusun A',
      unitTerkait: 'Bidang Program',
      peraturan: 'Permendikbud No. 5/2025',
      peraturanId: 'p2',
      status: 'Diajukan Evaluasi',
      versi: '1.1',
      kategori: 'Administrasi',
    },
  ])

  const peraturanList = [
    { id: 'p1', nama: 'Permendikbud No. 1/2026' },
    { id: 'p2', nama: 'Permendikbud No. 5/2025' },
    { id: 'p3', nama: 'Perda No. 3/2025' },
    { id: 'p4', nama: 'Permendikbud No. 8/2025' },
  ]

  const mergedSopList = mergeSopStatus(sopList)

  /** Daftar SOP yang eligible untuk diajukan evaluasi: hanya Siap Dievaluasi dan Berlaku (belum dalam evaluasi aktif). */
  const eligibleSopsForEvaluasi = mergedSopList.filter(
    (sop) => canAjukanEvaluasiSOP(sop.status) && !getActiveCaseForSop(sop.id)
  )

  const toggleSopSelectionForAjukan = (sopId: string) => {
    setSelectedSopIdsForAjukan((prev) => {
      const next = new Set(prev)
      if (next.has(sopId)) next.delete(sopId)
      else next.add(sopId)
      return next
    })
  }

  const confirmAjukanEvaluasiBulk = () => {
    if (selectedSopIdsForAjukan.size === 0) {
      setToastMessage('Pilih minimal satu SOP untuk diajukan.')
      return
    }
    const ids = Array.from(selectedSopIdsForAjukan)
    try {
      const newCase = addEvaluationCase({
        source_type: 'OPD_REQUEST' as EvaluationCaseSourceType,
        source_ref: 'kepala-opd',
        status: 'Draft',
        sopIds: ids,
      })
      setSopList((prev) =>
        prev.map((p) => {
          if (!ids.includes(p.id)) return p
          setSopStatusOverride(p.id, 'Diajukan Evaluasi')
          return { ...p, status: 'Diajukan Evaluasi' as StatusSOP }
        })
      )
      setToastMessage(`${ids.length} SOP berhasil diajukan untuk evaluasi (${newCase.id})`)
      setIsRequestEvaluasiDialogOpen(false)
      setSelectedSopIdsForAjukan(new Set())
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : 'Gagal mengajukan evaluasi')
    }
  }

  const filteredList = mergedSopList.filter((sop) => {
    const matchSearch =
      sop.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.nomorSOP.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || sop.status === filterStatus
    const matchPeraturan = filterPeraturan === 'all' || sop.peraturanId === filterPeraturan
    let matchTanggal = true
    if (filterTanggalDari && filterTanggalSampai) {
      const tanggalSOP = new Date(sop.terakhirDiperbarui)
      const dari = new Date(filterTanggalDari)
      const sampai = new Date(filterTanggalSampai)
      matchTanggal = tanggalSOP >= dari && tanggalSOP <= sampai
    }
    return matchSearch && matchStatus && matchPeraturan && matchTanggal
  })

  const activeFilterCount = [
    filterStatus !== 'all',
    filterPeraturan !== 'all',
    !!(filterTanggalDari && filterTanggalSampai),
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterPeraturan('all')
    setFilterTanggalDari('')
    setFilterTanggalSampai('')
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Daftar SOP' }]}
        title="Daftar SOP"
        description="Kelola dan pantau semua SOP di lingkungan Dinas Pendidikan"
      />
      {toastMessage && (
        <Toast message={toastMessage} type="success" />
      )}

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Cari judul atau nomor SOP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-[16px] border-0">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-900">Filter SOP</p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600"
                      onClick={clearFilters}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Status</label>
                  <select
                    className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    {STATUS_SOP_ALL.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Peraturan Dasar
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs"
                    value={filterPeraturan}
                    onChange={(e) => setFilterPeraturan(e.target.value)}
                  >
                    <option value="all">Semua Peraturan</option>
                    {peraturanList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Terakhir diperbarui
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Dari</label>
                      <Input
                        type="date"
                        className="h-9 text-xs"
                        value={filterTanggalDari}
                        onChange={(e) => setFilterTanggalDari(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Sampai</label>
                      <Input
                        type="date"
                        className="h-9 text-xs"
                        value={filterTanggalSampai}
                        onChange={(e) => setFilterTanggalSampai(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setSelectedSopIdsForAjukan(new Set())
                setIsRequestEvaluasiDialogOpen(true)
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Request Evaluasi
            </Button>
            <Link to="/kepala-opd/initiate-proyek">
              <Button size="sm" className="h-8 text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Buat SOP Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-2 font-semibold text-gray-700">Judul SOP</th>
                <th className="text-left p-2 font-semibold text-gray-700">Nomor SOP</th>
                <th className="text-left p-2 font-semibold text-gray-700">Terakhir diperbarui</th>
                <th className="text-left p-2 font-semibold text-gray-700">Status</th>
                <th className="text-left p-2 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Tidak ada SOP ditemukan</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Coba ubah filter atau kata kunci pencarian
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((sop) => (
                  <tr
                    key={sop.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{sop.judul}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-gray-700 text-[11px]">{sop.nomorSOP}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-700">
                        {new Date(sop.terakhirDiperbarui).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={sop.status} domain="sop" />
                    </td>
                    <td className="p-3">
                      <Link
                        to="/kepala-opd/detail-sop/$id"
                        params={{ id: sop.id }}
                        state={{
                          sopStatus: sop.status,
                          waktuPenugasan: sop.waktuPenugasan,
                          unitTerkait: sop.unitTerkait,
                          timPenyusun: sop.timPenyusun,
                          terakhirDiperbarui: sop.terakhirDiperbarui,
                          deskripsiProyek: sop.deskripsi,
                        }}
                      >
                        <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0" title="Detail">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredList.length > 0 && (
          <div className="border-t border-gray-200 p-3 flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Menampilkan {filteredList.length} dari {mergedSopList.length} SOP
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-blue-50">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isRequestEvaluasiDialogOpen} onOpenChange={setIsRequestEvaluasiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">Request Evaluasi SOP</DialogTitle>
            <DialogDescription className="text-xs">
              Pilih SOP yang eligible untuk dievaluasi. Bisa memilih beberapa sekaligus. Setelah diajukan, SOP tidak dapat diubah hingga evaluasi selesai.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-md">
            {eligibleSopsForEvaluasi.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Tidak ada SOP yang eligible untuk dievaluasi</p>
                <p className="text-xs mt-1">SOP harus berstatus Siap Dievaluasi atau Berlaku dan tidak sedang dalam evaluasi aktif.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {eligibleSopsForEvaluasi.map((sop) => {
                  const riwayat = getRiwayatEvaluasiForSop(sop.id)
                  const isSelected = selectedSopIdsForAjukan.has(sop.id)
                  return (
                    <li key={sop.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <label className="flex items-center pt-0.5 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSopSelectionForAjukan(sop.id)}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                        </label>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-mono text-gray-600">{sop.nomorSOP}</p>
                          <p className="text-sm font-medium text-gray-900 mt-0.5">{sop.judul}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs text-gray-500">v{sop.versi}</span>
                            <StatusBadge status={sop.status} domain="sop" />
                          </div>
                          {riwayat.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-100 rounded border border-gray-200">
                              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1">Riwayat evaluasi</p>
                              <ul className="text-xs text-gray-700 space-y-0.5">
                                {riwayat.map((c) => (
                                  <li key={c.id}>
                                    {c.id} — {c.status} {c.timEvaluator ? `(${c.timEvaluator})` : ''}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <DialogFooter className="gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsRequestEvaluasiDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700"
              onClick={confirmAjukanEvaluasiBulk}
              disabled={selectedSopIdsForAjukan.size === 0}
            >
              <Send className="w-3.5 h-3.5" />
              Ajukan Evaluasi ({selectedSopIdsForAjukan.size} SOP)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
