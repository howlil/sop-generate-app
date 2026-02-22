import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Eye, Send, Building, History, Pencil } from 'lucide-react'
import { getActiveCaseForSop, addEvaluationCase } from '@/lib/evaluation-case'
import {
  getPenugasanList,
  setPenugasanList as setStorePenugasanList,
  addPenugasan as addStorePenugasan,
  updatePenugasan as updateStorePenugasan,
  subscribe as subscribePenugasan,
} from '@/lib/penugasan-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import { Toast } from '@/components/ui/toast'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_SOP_CAN_SELECT_FOR_EVALUASI, type StatusSOP, type StatusHasilEvaluasi } from '@/lib/sop-status'

type StatusEvaluasi = 'Belum Ditugaskan' | 'Sudah Ditugaskan' | 'Selesai' | 'Terverifikasi'

interface SOPItem {
  id: string
  nama: string
  nomor: string
  /** Hasil evaluasi per SOP (bukan status SOP). */
  status?: StatusHasilEvaluasi
  catatan?: string
  rekomendasi?: string
}

interface Penugasan {
  id: string
  jenis: 'Inisiasi Biro' | 'Request OPD'
  tanggalRequest?: string
  opd: string
  sopList: SOPItem[]
  timMonev?: string
  status: StatusEvaluasi
  catatan: string
  evaluationCaseId?: string
  /** Hasil evaluasi (untuk status Selesai/Terverifikasi) */
  tanggalEvaluasi?: string
  isVerified?: boolean
  nomorBA?: string
  tanggalVerifikasi?: string
  kepalaBiro?: string
}

export function ManajemenEvaluasiSOP() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPenugasanId, setEditingPenugasanId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    jenis: 'Inisiasi Biro' as 'Inisiasi Biro' | 'Request OPD',
    opd: '',
    selectedSOPs: [] as string[],
    timMonev: '',
    catatan: '',
  })

  const INITIAL_PENUGASAN: Penugasan[] = [
    {
      id: '1',
      jenis: 'Inisiasi Biro',
      opd: 'Dinas Pendidikan',
      sopList: [
        { id: 's1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Sesuai', catatan: 'Proses berjalan lancar.', rekomendasi: 'Tingkatkan kapasitas server.' },
        { id: 's2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Sesuai', catatan: 'Prosedur sesuai standar.', rekomendasi: 'Pertahankan standar.' },
      ],
      timMonev: 'Dra. Siti Aminah, M.Si',
      status: 'Terverifikasi',
      catatan: 'Evaluasi rutin Q1 2026',
      tanggalEvaluasi: '2026-02-05',
      isVerified: true,
      nomorBA: 'BA/BIRO/001/II/2026',
      tanggalVerifikasi: '2026-02-06',
      kepalaBiro: 'Dr. H. Muhammad Ridwan, M.Si',
    },
    {
      id: '2',
      jenis: 'Request OPD',
      tanggalRequest: '2026-02-03',
      opd: 'DPMPTSP',
      evaluationCaseId: undefined,
      sopList: [
        { id: 's3', nama: 'SOP Perizinan Usaha Mikro', nomor: 'SOP-DPMPTSP-005/2026', status: 'Perlu Perbaikan', catatan: 'Beberapa tahapan tidak konsisten.', rekomendasi: 'Perbaiki dokumentasi.' },
      ],
      timMonev: 'Dr. Bambang Suryanto',
      status: 'Selesai',
      catatan: 'Request dari DPMPTSP',
      tanggalEvaluasi: '2026-02-04',
      isVerified: false,
    },
    {
      id: '3',
      jenis: 'Inisiasi Biro',
      opd: 'Dinas Kesehatan',
      sopList: [
        { id: 's4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026' },
        { id: 's5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026' },
        { id: 's6', nama: 'SOP Rujukan Pasien', nomor: 'SOP-DINKES-022/2026' },
      ],
      timMonev: 'Dr. Bambang Suryanto',
      status: 'Sudah Ditugaskan',
      catatan: 'Evaluasi SOP pelayanan kesehatan',
      evaluationCaseId: undefined,
    },
    {
      id: '4',
      jenis: 'Inisiasi Biro',
      opd: 'Dinas Kesehatan',
      sopList: [
        { id: 's4b', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Sesuai', catatan: 'Pelayanan berjalan baik.', rekomendasi: 'Pertahankan.' },
        { id: 's5b', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Sesuai', catatan: 'Program sesuai jadwal.', rekomendasi: 'Tingkatkan sosialisasi.' },
        { id: 's6b', nama: 'SOP Rujukan Pasien', nomor: 'SOP-DINKES-022/2026', status: 'Sesuai', catatan: 'Sistem rujukan efektif.', rekomendasi: 'Pertahankan.' },
      ],
      timMonev: 'Ir. Dewi Kusumawati, MT',
      status: 'Selesai',
      catatan: 'Evaluasi Q1 2026',
      tanggalEvaluasi: '2026-02-03',
      isVerified: false,
    },
  ]

  const [penugasanList, setPenugasanList] = useState<Penugasan[]>(() =>
    getPenugasanList().length > 0 ? getPenugasanList() : INITIAL_PENUGASAN
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (getPenugasanList().length === 0) setStorePenugasanList(INITIAL_PENUGASAN)
    const unsub = subscribePenugasan(() => setPenugasanList(getPenugasanList()))
    return unsub
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const opdList = [
    { id: 'opd1', nama: 'Dinas Pendidikan', kode: 'DISDIK' },
    { id: 'opd2', nama: 'Dinas Kesehatan', kode: 'DINKES' },
    { id: 'opd3', nama: 'DPMPTSP', kode: 'DPMPTSP' },
    { id: 'opd4', nama: 'Bagian Umum', kode: 'BAGUM' },
  ]

  /** OPD yang mengajukan request evaluasi ke Biro (request dari OPD). Tampilkan badge "Request Biro" saat pilih OPD. */
  const opdYangRequestBiro = ['DPMPTSP']

  /** SOP per OPD; status SOP = single source of truth. Filter layak evaluasi: Siap Dievaluasi, Berlaku, Diajukan Evaluasi. */
  const [sopByOPD] = useState<
    Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>>
  >({
    'Dinas Pendidikan': [
      { id: 'sop1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Berlaku' },
      { id: 'sop2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Terverifikasi dari Kepala Biro' },
      { id: 'sop3', nama: 'SOP Kelulusan', nomor: 'SOP-DISDIK-010/2026', status: 'Berlaku' },
      { id: '1', nama: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027', nomor: 'SOP/DISDIK/PLY/2026/001', status: 'Berlaku' },
      { id: '2', nama: 'SOP Pelaksanaan Ujian Akhir Sekolah', nomor: 'SOP/DISDIK/PLY/2026/005', status: 'Siap Dievaluasi' },
      { id: '3', nama: 'SOP Pengelolaan Data Kepegawaian Guru', nomor: 'SOP/DISDIK/ADM/2026/003', status: 'Dievaluasi Tim Evaluasi' },
    ],
    'Dinas Kesehatan': [
      { id: 'sop4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Berlaku' },
      { id: 'sop5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Terverifikasi dari Kepala Biro' },
    ],
    DPMPTSP: [
      { id: 'sop6', nama: 'SOP Perizinan Usaha', nomor: 'SOP-DPMPTSP-005/2026', status: 'Diajukan Evaluasi' },
    ],
    'Bagian Umum': [
      { id: 'sop7', nama: 'SOP Pengadaan Barang', nomor: 'SOP-BAGUM-015/2026', status: 'Siap Dievaluasi' },
    ],
  })

  /** Riwayat evaluasi untuk satu SOP: penugasan yang sudah Selesai/Terverifikasi dan memuat SOP ini. */
  const getRiwayatEvaluasiSop = (sopId: string) =>
    penugasanList.filter(
      (p) =>
        (p.status === 'Selesai' || p.status === 'Terverifikasi') &&
        p.sopList.some((s) => s.id === sopId)
    )

  const [riwayatSopId, setRiwayatSopId] = useState<string | null>(null)

  const timMonevList = [
    { id: 'tm1', nama: 'Dra. Siti Aminah, M.Si' },
    { id: 'tm2', nama: 'Dr. Bambang Suryanto' },
    { id: 'tm3', nama: 'Ir. Dewi Kusumawati, MT' },
  ]

  const filteredList = penugasanList.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      item.opd.toLowerCase().includes(q) ||
      item.jenis.toLowerCase().includes(q) ||
      item.sopList.some((sop) => sop.nama.toLowerCase().includes(q))
    )
  })

  const goToDetail = (item: Penugasan) => {
    navigate({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop/detail/$id', params: { id: item.id } })
  }

  const resetForm = () => {
    setFormData({
      jenis: 'Inisiasi Biro',
      opd: '',
      selectedSOPs: [],
      timMonev: '',
      catatan: '',
    })
    setEditingPenugasanId(null)
  }

  const openEditDialog = (item: Penugasan) => {
    setFormData({
      jenis: item.jenis,
      opd: item.opd,
      selectedSOPs: item.sopList.map((s) => s.id),
      timMonev: item.timMonev ?? '',
      catatan: item.catatan ?? '',
    })
    setEditingPenugasanId(item.id)
    setIsCreateOpen(true)
  }

  const toggleSOP = (sopId: string) => {
    if (getActiveCaseForSop(sopId)) return
    if (formData.selectedSOPs.includes(sopId)) {
      setFormData({
        ...formData,
        selectedSOPs: formData.selectedSOPs.filter((id) => id !== sopId),
      })
    } else {
      setFormData({ ...formData, selectedSOPs: [...formData.selectedSOPs, sopId] })
    }
  }

  const canSubmit = () => {
    return !!(formData.opd && formData.selectedSOPs.length > 0 && formData.timMonev)
  }

  const handleTugaskan = () => {
    if (!canSubmit()) return
    const opdSOPs = (sopByOPD[formData.opd] ?? []).filter((s) =>
      STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status)
    )
    const sopList = opdSOPs.filter((s) => formData.selectedSOPs.includes(s.id))
    try {
      const sourceRef = String(Date.now())
      const ec = addEvaluationCase({
        source_type: formData.jenis === 'Request OPD' ? 'OPD_REQUEST' : 'BIRO_INITIATIVE',
        source_ref: sourceRef,
        status: 'Assigned',
        sopIds: formData.selectedSOPs,
        timEvaluator: formData.timMonev,
        opd: formData.opd,
      })
      addStorePenugasan({
        id: String(Date.now()),
        jenis: formData.jenis,
        tanggalRequest: formData.jenis === 'Request OPD' ? new Date().toISOString().slice(0, 10) : undefined,
        opd: formData.opd,
        sopList: sopList.map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor })),
        timMonev: formData.timMonev,
        status: 'Sudah Ditugaskan',
        catatan: formData.catatan || '',
        evaluationCaseId: ec.id,
      })
      setToastMessage('Penugasan evaluasi berhasil dibuat. Tim evaluator telah ditugaskan.')
      setIsCreateOpen(false)
      resetForm()
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'SOP yang dipilih sudah dalam evaluasi aktif.')
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen Evaluasi SOP' }]}
        title="Manajemen Evaluasi SOP"
        description="Kelola penugasan evaluasi SOP per OPD"
      />
      {toastMessage && <Toast message={toastMessage} type="success" />}

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Cari OPD atau SOP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                resetForm()
                setEditingPenugasanId(null)
                setIsCreateOpen(true)
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Penugasan Baru
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-2.5 px-3 font-medium text-gray-700">OPD</th>
              <th className="text-left py-2.5 px-3 font-medium text-gray-700">Jenis</th>
              <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
              <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Tidak ada penugasan evaluasi. Gunakan &quot;Buat Penugasan Baru&quot; untuk menambah.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2.5 px-3 font-medium text-gray-900">{item.opd}</td>
                <td className="py-2.5 px-3">
                  <Badge variant="outline" className="text-xs">{item.jenis}</Badge>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <StatusBadge status={item.status} domain="evaluasi-biro" />
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0" onClick={() => goToDetail(item)} title="Detail">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    {item.status !== 'Selesai' && item.status !== 'Terverifikasi' && (
                      <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0" onClick={() => openEditDialog(item)} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Dialog - Form sama untuk buat dan edit */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingPenugasanId(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingPenugasanId ? 'Edit Perencanaan & Penugasan' : 'Buat Perencanaan & Penugasan'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingPenugasanId
                ? 'Ubah OPD, SOP, atau tim monev untuk penugasan ini.'
                : 'Pilih OPD dan SOP yang akan dievaluasi, lalu tugaskan tim monev.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Pilih OPD *</Label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 flex-1 min-w-[200px] rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.opd}
                  onChange={(e) => {
                    const opd = e.target.value
                    setFormData({
                      ...formData,
                      opd,
                      selectedSOPs: [],
                      jenis: opdYangRequestBiro.includes(opd) ? 'Request OPD' : 'Inisiasi Biro',
                    })
                  }}
                >
                  <option value="">Pilih OPD</option>
                  {opdList.map((opd) => (
                    <option key={opd.id} value={opd.nama}>
                      {opd.nama} ({opd.kode}){opdYangRequestBiro.includes(opd.nama) ? ' — Request Biro' : ''}
                    </option>
                  ))}
                </select>
                {formData.opd && opdYangRequestBiro.includes(formData.opd) && (
                  <Badge variant="default" className="shrink-0 px-2.5 py-1 text-xs font-semibold gap-1">
                    <Building className="w-3.5 h-3.5" aria-hidden />
                    Request Biro
                  </Badge>
                )}
              </div>
            </div>

            {formData.opd && (
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Pilih SOP untuk Dievaluasi * (layak evaluasi). Gunakan ikon Riwayat untuk melihat riwayat evaluasi SOP.
                </Label>
                <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                  {(sopByOPD[formData.opd] ?? [])
                    .filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
                    .length > 0 ? (
                    (sopByOPD[formData.opd] ?? [])
                      .filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
                      .map((sop) => {
                        const activeCase = getActiveCaseForSop(sop.id)
                        const inCase = !!activeCase
                        return (
                          <label
                            key={sop.id}
                            className={`flex items-start gap-2 p-2 rounded ${inCase ? 'bg-gray-100 cursor-not-allowed opacity-80' : 'hover:bg-gray-50 cursor-pointer'}`}
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300"
                              checked={formData.selectedSOPs.includes(sop.id)}
                              onChange={() => toggleSOP(sop.id)}
                              disabled={inCase}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900">{sop.nama}</p>
                              <p className="text-xs text-gray-500">{sop.nomor}</p>
                              {inCase && (
                                <p className="text-xs text-amber-700 mt-0.5">
                                  Sudah dalam evaluasi ({activeCase.id})
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="h-7 w-7 p-0 shrink-0"
                              title="Riwayat evaluasi SOP ini"
                              onClick={(e) => { e.preventDefault(); setRiwayatSopId(sop.id); }}
                            >
                              <History className="w-3.5 h-3.5 text-gray-500" />
                            </Button>
                          </label>
                        )
                      })
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">
                      Tidak ada SOP dengan status Siap Dievaluasi / Berlaku / Diajukan Evaluasi untuk OPD ini
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formData.selectedSOPs.length} SOP dipilih</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Pilih Tim Monev *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.timMonev}
                onChange={(e) => setFormData({ ...formData, timMonev: e.target.value })}
              >
                <option value="">Pilih Tim Monev</option>
                {timMonevList.map((tim) => (
                  <option key={tim.id} value={tim.nama}>
                    {tim.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Catatan</Label>
              <Textarea
                className="text-xs min-h-[60px]"
                placeholder="Catatan atau instruksi untuk tim monev"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsCreateOpen(false)
                setEditingPenugasanId(null)
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                if (editingPenugasanId) {
                  const opdSOPs = (sopByOPD[formData.opd] ?? []).filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
                  const sopList = opdSOPs.filter((s) => formData.selectedSOPs.includes(s.id)).map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor }))
                  updateStorePenugasan(editingPenugasanId, {
                    jenis: formData.jenis,
                    opd: formData.opd,
                    sopList,
                    timMonev: formData.timMonev,
                    catatan: formData.catatan,
                  })
                  setToastMessage('Penugasan berhasil diperbarui.')
                  setIsCreateOpen(false)
                  setEditingPenugasanId(null)
                } else {
                  handleTugaskan()
                }
              }}
              disabled={!canSubmit()}
            >
              {editingPenugasanId ? (
                'Simpan'
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  Tugaskan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Riwayat Evaluasi per SOP */}
      <Dialog open={!!riwayatSopId} onOpenChange={(open) => !open && setRiwayatSopId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Riwayat Evaluasi SOP
            </DialogTitle>
            <DialogDescription className="text-xs">
              {riwayatSopId && (() => {
                const nama = formData.opd
                  ? (sopByOPD[formData.opd] ?? []).find((s) => s.id === riwayatSopId)?.nama
                  : penugasanList.flatMap((p) => p.sopList).find((s) => s.id === riwayatSopId)?.nama
                return nama ? `SOP: ${nama}` : `SOP ID: ${riwayatSopId}`
              })()}
            </DialogDescription>
          </DialogHeader>
          {riwayatSopId && (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {getRiwayatEvaluasiSop(riwayatSopId).length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Belum pernah dievaluasi</p>
              ) : (
                getRiwayatEvaluasiSop(riwayatSopId).map((p) => {
                  const sopInBatch = p.sopList.find((s) => s.id === riwayatSopId)
                  return (
                    <div
                      key={p.id}
                      className="p-3 border border-gray-200 rounded-md text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">{p.opd} — {p.jenis}</span>
                        <StatusBadge status={p.status} domain="evaluasi-biro" />
                      </div>
                      {p.tanggalEvaluasi && (
                        <p className="text-gray-600">Tgl evaluasi: {new Date(p.tanggalEvaluasi).toLocaleDateString('id-ID')}</p>
                      )}
                      {sopInBatch?.status && (
                        <p className="text-gray-700">Hasil SOP ini: <span className={sopInBatch.status === 'Sesuai' ? 'text-green-700 font-medium' : sopInBatch.status === 'Revisi Biro' ? 'text-amber-700 font-medium' : ''}>{sopInBatch.status}</span></p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRiwayatSopId(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
