import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Send, Calendar, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layout/PageHeader'
import { getActiveCaseForSop } from '@/lib/evaluation-case'
import {
  getPenugasanById,
  updatePenugasan,
  type Penugasan,
} from '@/lib/penugasan-store'

const opdList = [
  { id: 'opd1', nama: 'Dinas Pendidikan', kode: 'DISDIK' },
  { id: 'opd2', nama: 'Dinas Kesehatan', kode: 'DINKES' },
  { id: 'opd3', nama: 'DPMPTSP', kode: 'DPMPTSP' },
  { id: 'opd4', nama: 'Bagian Umum', kode: 'BAGUM' },
]

const sopByOPD: Record<string, Array<{ id: string; nama: string; nomor: string; status: string }>> = {
  'Dinas Pendidikan': [
    { id: 'sop1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Disahkan' },
    { id: 'sop2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Terverifikasi' },
    { id: 'sop3', nama: 'SOP Kelulusan', nomor: 'SOP-DISDIK-010/2026', status: 'Disahkan' },
    { id: '1', nama: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027', nomor: 'SOP/DISDIK/PLY/2026/001', status: 'Disahkan' },
    { id: '2', nama: 'SOP Pelaksanaan Ujian Akhir Sekolah', nomor: 'SOP/DISDIK/PLY/2026/005', status: 'Terverifikasi' },
    { id: '3', nama: 'SOP Pengelolaan Data Kepegawaian Guru', nomor: 'SOP/DISDIK/ADM/2026/003', status: 'Dalam Evaluasi' },
  ],
  'Dinas Kesehatan': [
    { id: 'sop4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Disahkan' },
    { id: 'sop5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Terverifikasi' },
  ],
  DPMPTSP: [
    { id: 'sop6', nama: 'SOP Perizinan Usaha', nomor: 'SOP-DPMPTSP-005/2026', status: 'Disahkan' },
  ],
  'Bagian Umum': [
    { id: 'sop7', nama: 'SOP Pengadaan Barang', nomor: 'SOP-BAGUM-015/2026', status: 'Terverifikasi' },
  ],
}

const LAYAK_EVALUASI_STATUS = ['Disahkan', 'Terverifikasi', 'Siap Dievaluasi', 'Diajukan Evaluasi', 'Disahkan · Diajukan Evaluasi']

const timMonevList = [
  { id: 'tm1', nama: 'Dra. Siti Aminah, M.Si' },
  { id: 'tm2', nama: 'Dr. Bambang Suryanto' },
  { id: 'tm3', nama: 'Ir. Dewi Kusumawati, MT' },
]

export function EditPenugasanEvaluasi() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const [penugasan, setPenugasan] = useState<Penugasan | null>(null)
  const [formData, setFormData] = useState({
    jenis: 'Inisiasi Biro' as 'Inisiasi Biro' | 'Request OPD',
    opd: '',
    selectedSOPs: [] as string[],
    timMonev: '',
    catatan: '',
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const pid = typeof id === 'string' ? id : undefined
    if (pid) setPenugasan(getPenugasanById(pid) ?? null)
  }, [id])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  useEffect(() => {
    if (!penugasan) return
    setFormData({
      jenis: penugasan.jenis,
      opd: penugasan.opd,
      selectedSOPs: penugasan.sopList.map((s) => s.id),
      timMonev: penugasan.timMonev ?? '',
      catatan: penugasan.catatan ?? '',
    })
  }, [penugasan])

  const toggleSOP = (sopId: string) => {
    if (getActiveCaseForSop(sopId)) return
    if (formData.selectedSOPs.includes(sopId)) {
      setFormData({
        ...formData,
        selectedSOPs: formData.selectedSOPs.filter((x) => x !== sopId),
      })
    } else {
      setFormData({ ...formData, selectedSOPs: [...formData.selectedSOPs, sopId] })
    }
  }

  const canSubmit = () =>
    !!(formData.opd && formData.selectedSOPs.length > 0 && formData.timMonev)

  const handleSave = () => {
    if (!id || !penugasan || !canSubmit()) return
    const opdSOPs = (sopByOPD[formData.opd] ?? []).filter((s) =>
      LAYAK_EVALUASI_STATUS.includes(s.status)
    )
    const sopList = opdSOPs
      .filter((s) => formData.selectedSOPs.includes(s.id))
      .map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor }))
    updatePenugasan(id, {
      jenis: formData.jenis,
      opd: formData.opd,
      sopList,
      timMonev: formData.timMonev,
      catatan: formData.catatan,
    })
    setToastMessage('Penugasan berhasil diperbarui.')
    navigate({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' })
  }

  if (id === undefined) {
    return (
      <div className="space-y-3">
        <PageHeader
          breadcrumb={[
            { label: 'Manajemen Evaluasi SOP', to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' },
            { label: 'Edit Penugasan' },
          ]}
          title="Edit Penugasan"
        />
        <p className="text-sm text-gray-500">ID tidak valid.</p>
      </div>
    )
  }

  if (!penugasan) {
    return (
      <div className="space-y-3">
        <PageHeader
          breadcrumb={[
            { label: 'Manajemen Evaluasi SOP', to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' },
            { label: 'Edit Penugasan' },
          ]}
          title="Edit Penugasan"
        />
        <p className="text-sm text-gray-500">Penugasan tidak ditemukan.</p>
        <Link to="/kepala-biro-organisasi/manajemen-evaluasi-sop">
          <Button variant="outline" size="sm">Kembali ke Daftar</Button>
        </Link>
      </div>
    )
  }

  const availableSOPs = (sopByOPD[formData.opd] ?? []).filter((s) =>
    LAYAK_EVALUASI_STATUS.includes(s.status)
  )

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-md">
          {toastMessage}
        </div>
      )}

      <PageHeader
        breadcrumb={[
          { label: 'Manajemen Evaluasi SOP', to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' },
          { label: 'Edit Perencanaan & Penugasan' },
        ]}
        title="Edit Perencanaan & Penugasan"
        description="Ubah informasi perencanaan evaluasi dan penugasan tim monev"
      />

      <div className="bg-white rounded-md border border-gray-200 p-4 max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Jenis Evaluasi</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jenis: 'Inisiasi Biro' })}
                className={`flex-1 p-3 rounded-md border text-xs transition-all ${
                  formData.jenis === 'Inisiasi Biro'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                Inisiasi Biro (Quarterly)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, jenis: 'Request OPD' })}
                className={`flex-1 p-3 rounded-md border text-xs transition-all ${
                  formData.jenis === 'Request OPD'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Building className="w-4 h-4 mx-auto mb-1" />
                Request dari OPD
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Pilih OPD *</Label>
            <select
              className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.opd}
              onChange={(e) =>
                setFormData({ ...formData, opd: e.target.value, selectedSOPs: [] })
              }
            >
              <option value="">Pilih OPD</option>
              {opdList.map((opd) => (
                <option key={opd.id} value={opd.nama}>
                  {opd.nama} ({opd.kode})
                </option>
              ))}
            </select>
          </div>

          {formData.opd && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Pilih SOP untuk Dievaluasi * (hanya SOP dengan status layak evaluasi)
              </Label>
              <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {availableSOPs.length > 0 ? (
                  availableSOPs.map((sop) => {
                    const activeCase = getActiveCaseForSop(sop.id)
                    const inCase = !!activeCase
                    const isCurrentSop = penugasan.sopList.some((s) => s.id === sop.id)
                    const disabled = inCase && !isCurrentSop
                    return (
                      <label
                        key={sop.id}
                        className={`flex items-start gap-2 p-2 rounded ${
                          disabled ? 'bg-gray-100 cursor-not-allowed opacity-80' : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300"
                          checked={formData.selectedSOPs.includes(sop.id)}
                          onChange={() => toggleSOP(sop.id)}
                          disabled={disabled}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{sop.nama}</p>
                          <p className="text-xs text-gray-500">{sop.nomor}</p>
                          {inCase && !isCurrentSop && (
                            <p className="text-xs text-amber-700 mt-0.5">
                              Sudah dalam evaluasi ({activeCase.id})
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Tidak ada SOP dengan status layak evaluasi untuk OPD ini
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

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
          <Link to="/kepala-biro-organisasi/manajemen-evaluasi-sop">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Batal
            </Button>
          </Link>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleSave}
            disabled={!canSubmit()}
          >
            <Send className="w-3.5 h-3.5" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  )
}
