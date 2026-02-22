import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  Calendar,
  Users,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'

interface SOP {
  id: string
  kode: string
  nama: string
  opd: string
  jenis: string
  status: string
  /** Jika ada, SOP sedang dalam evaluation case aktif (satu SOP satu case). */
  evaluationCaseId?: string | null
}

interface TimEvaluasi {
  id: string
  nama: string
  ketua: string
  jumlahAnggota: number
  status: 'available' | 'busy'
}

export function BuatPenugasanWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchSOP, setSearchSOP] = useState('')
  const [searchTim, setSearchTim] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [jenisPenugasan, setJenisPenugasan] = useState<'inisiasi' | 'request'>('inisiasi')
  const [quarter, setQuarter] = useState('')
  const [selectedSOPs, setSelectedSOPs] = useState<string[]>([])
  const [selectedTim, setSelectedTim] = useState('')
  const [instruksi, setInstruksi] = useState('')

  const mockSOPs: SOP[] = [
    {
      id: '1',
      kode: 'SOP/DISDIK/PLY/2026/001',
      nama: 'SOP Penerimaan Siswa Baru 2026',
      opd: 'Dinas Pendidikan',
      jenis: 'Pelayanan',
      status: 'Berlaku',
    },
    {
      id: '2',
      kode: 'SOP/DINKES/PLY/2026/005',
      nama: 'SOP Pelayanan Puskesmas 24 Jam',
      opd: 'Dinas Kesehatan',
      jenis: 'Pelayanan',
      status: 'Berlaku',
    },
    {
      id: '3',
      kode: 'SOP/DISHUB/ADM/2026/003',
      nama: 'SOP Pengurusan SIM',
      opd: 'Dinas Perhubungan',
      jenis: 'Administrasi',
      status: 'Berlaku',
      evaluationCaseId: 'EV-2026-001',
    },
    {
      id: '4',
      kode: 'SOP/DPMPTSP/PLY/2026/008',
      nama: 'SOP Perizinan Usaha Mikro',
      opd: 'DPMPTSP',
      jenis: 'Pelayanan',
      status: 'Berlaku',
    },
  ]

  const mockTimEvaluasi: TimEvaluasi[] = [
    {
      id: '1',
      nama: 'Tim Evaluasi Pelayanan Publik',
      ketua: 'Dra. Siti Aminah, M.Si',
      jumlahAnggota: 5,
      status: 'available',
    },
    {
      id: '2',
      nama: 'Tim Evaluasi Administrasi',
      ketua: 'Dr. Budi Santoso, M.AP',
      jumlahAnggota: 4,
      status: 'available',
    },
    {
      id: '3',
      nama: 'Tim Evaluasi Teknis',
      ketua: 'Ir. Ahmad Wijaya, MT',
      jumlahAnggota: 6,
      status: 'busy',
    },
  ]

  const filteredSOPs = mockSOPs.filter(
    (sop) =>
      sop.nama.toLowerCase().includes(searchSOP.toLowerCase()) ||
      sop.kode.toLowerCase().includes(searchSOP.toLowerCase()) ||
      sop.opd.toLowerCase().includes(searchSOP.toLowerCase())
  )

  const filteredTim = mockTimEvaluasi.filter(
    (tim) =>
      tim.nama.toLowerCase().includes(searchTim.toLowerCase()) ||
      tim.ketua.toLowerCase().includes(searchTim.toLowerCase())
  )

  const toggleSOPSelection = (sopId: string) => {
    const sop = mockSOPs.find((s) => s.id === sopId)
    if (sop?.evaluationCaseId) {
      setToastMessage(`SOP ini sudah dalam evaluasi (${sop.evaluationCaseId}). Satu SOP hanya satu case aktif.`)
      return
    }
    if (selectedSOPs.includes(sopId)) {
      setSelectedSOPs(selectedSOPs.filter((id) => id !== sopId))
    } else {
      setSelectedSOPs([...selectedSOPs, sopId])
    }
  }

  const getSelectedSOPsData = () => {
    return mockSOPs.filter((sop) => selectedSOPs.includes(sop.id))
  }

  const getSelectedTimData = () => {
    return mockTimEvaluasi.find((tim) => tim.id === selectedTim)
  }

  const steps = [
    { num: 1, title: 'Jenis & SOP', icon: FileText },
    { num: 2, title: 'Tim Evaluasi', icon: Users },
    { num: 3, title: 'Instruksi', icon: Calendar },
    { num: 4, title: 'Review & Konfirmasi', icon: Check },
  ]

  const canProceedStep1 = jenisPenugasan && selectedSOPs.length > 0
  const canProceedStep2 = selectedTim !== ''
  const canSubmit = canProceedStep1 && canProceedStep2

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) {
      setToastMessage('Pilih minimal 1 SOP untuk dievaluasi')
      return
    }
    if (currentStep === 2 && !canProceedStep2) {
      setToastMessage('Pilih tim evaluasi')
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      setToastMessage('Mohon lengkapi semua data yang diperlukan')
      return
    }
    setToastMessage('Penugasan evaluasi berhasil dibuat dan dikirim ke tim')
    setTimeout(() => {
      navigate({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' })
    }, 1500)
  }

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div
          className={`rounded-md border px-4 py-2 text-xs ${
            toastMessage.startsWith('Penugasan')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toastMessage}
        </div>
      )}

      <PageHeader
        breadcrumb={[
          { label: 'Manajemen Evaluasi SOP', to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' },
          { label: 'Buat Penugasan' },
        ]}
        title="Buat Penugasan Evaluasi"
        description="Inisiasi evaluasi SOP dan tugaskan ke tim evaluasi"
        leading={
          <Link to="/kepala-biro-organisasi/manajemen-evaluasi-sop">
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Kembali">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-md border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    currentStep > step.num
                      ? 'bg-green-600 text-white'
                      : currentStep === step.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.num ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Jenis Penugasan</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
className={`p-3 rounded-md border transition-all text-left ${
                  jenisPenugasan === 'inisiasi'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setJenisPenugasan('inisiasi')}
                >
                  <p className="text-xs font-semibold text-gray-900 mb-1">Inisiasi Biro</p>
                  <p className="text-xs text-gray-600">
                    Evaluasi rutin yang diinisiasi oleh Biro Organisasi
                  </p>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-md border transition-all text-left ${
                    jenisPenugasan === 'request'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setJenisPenugasan('request')}
                >
                  <p className="text-xs font-semibold text-gray-900 mb-1">Request OPD</p>
                  <p className="text-xs text-gray-600">
                    Evaluasi atas permintaan dari OPD tertentu
                  </p>
                </button>
              </div>

              {jenisPenugasan === 'inisiasi' && (
                <div className="mt-3">
                  <Label className="text-xs">Quarter</Label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="mt-1.5 flex h-9 w-full rounded-md border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih quarter</option>
                    <option value="Q1-2026">Q1 2026</option>
                    <option value="Q2-2026">Q2 2026</option>
                    <option value="Q3-2026">Q3 2026</option>
                    <option value="Q4-2026">Q4 2026</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Pilih SOP</h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedSOPs.length} dipilih
                </Badge>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari SOP..."
                  className="h-9 pl-8 text-xs"
                  value={searchSOP}
                  onChange={(e) => setSearchSOP(e.target.value)}
                />
              </div>

              <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                {filteredSOPs.map((sop) => {
                  const inEvaluation = !!sop.evaluationCaseId
                  return (
                    <div
                      key={sop.id}
                      className={`p-3 border-b border-gray-100 last:border-0 transition-all ${
                        inEvaluation
                          ? 'bg-gray-50 cursor-not-allowed opacity-80'
                          : selectedSOPs.includes(sop.id)
                            ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                            : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => !inEvaluation && toggleSOPSelection(sop.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSOPs.includes(sop.id)}
                          onChange={() => toggleSOPSelection(sop.id)}
                          disabled={inEvaluation}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs font-mono text-gray-700">{sop.kode}</p>
                            <Badge variant="secondary" className="text-xs">
                              {sop.jenis}
                            </Badge>
                            {inEvaluation && (
                              <Badge className="text-xs bg-amber-100 text-amber-800 border-0">
                                Sudah dalam evaluasi ({sop.evaluationCaseId})
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-900 mb-1">{sop.nama}</p>
                          <p className="text-xs text-gray-600">{sop.opd}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Pilih Tim Evaluasi</h3>
              <p className="text-xs text-gray-600 mb-3">
                Pilih tim yang akan bertugas mengevaluasi SOP yang dipilih
              </p>
              <div className="relative mb-3">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari tim evaluasi..."
                  className="h-9 pl-8 text-xs"
                  value={searchTim}
                  onChange={(e) => setSearchTim(e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                {filteredTim.map((tim) => (
                  <button
                    key={tim.id}
                    type="button"
                    className={`p-4 rounded-md border transition-all text-left ${
                      selectedTim === tim.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${tim.status === 'busy' ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedTim(tim.id)}
                    disabled={tim.status === 'busy'}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-gray-900">{tim.nama}</p>
                      </div>
                      {tim.status === 'available' ? (
                        <Badge className="bg-green-100 text-green-700 text-xs border-0">
                          Tersedia
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Sedang Bertugas
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>Ketua: {tim.ketua}</p>
                      <p>Jumlah Anggota: {tim.jumlahAnggota} orang</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Instruksi Evaluasi</h3>
              <Label className="text-xs">Catatan / instruksi untuk tim evaluasi (opsional)</Label>
              <Textarea
                className="text-xs mt-1.5 min-h-[120px]"
                placeholder="Berikan instruksi atau catatan khusus untuk tim evaluasi..."
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Review & Konfirmasi</h3>
              <p className="text-xs text-gray-600 mb-4">
                Pastikan semua informasi sudah benar sebelum membuat penugasan
              </p>

              <div className="space-y-3">
                <Card className="p-3 bg-gray-50 border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Jenis Penugasan</p>
                  <p className="text-xs font-medium text-gray-900">
                    {jenisPenugasan === 'inisiasi' ? 'Inisiasi Biro' : 'Request OPD'}
                    {quarter && ` - ${quarter}`}
                  </p>
                </Card>

                <Card className="p-3 bg-gray-50 border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">SOP yang Dievaluasi</p>
                  <div className="space-y-2">
                    {getSelectedSOPsData().map((sop) => (
                      <div key={sop.id} className="p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs font-mono text-gray-700 mb-0.5">{sop.kode}</p>
                        <p className="text-xs font-medium text-gray-900">{sop.nama}</p>
                        <p className="text-xs text-gray-600">{sop.opd}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {getSelectedTimData() && (
                  <Card className="p-3 bg-gray-50 border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Tim Evaluasi</p>
                    <p className="text-xs font-medium text-gray-900 mb-1">
                      {getSelectedTimData()!.nama}
                    </p>
                    <p className="text-xs text-gray-600">
                      Ketua: {getSelectedTimData()!.ketua}
                    </p>
                  </Card>
                )}

                {instruksi && (
                  <Card className="p-3 bg-gray-50 border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Instruksi</p>
                    <p className="text-xs text-gray-700 whitespace-pre-line">{instruksi}</p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Sebelumnya
        </Button>

        {currentStep < 4 ? (
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleNext}>
            Selanjutnya
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Check className="w-3.5 h-3.5" />
            Buat Penugasan
          </Button>
        )}
      </div>
    </div>
  )
}
