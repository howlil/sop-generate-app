import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Save,
  Check,
  X,
  RotateCcw,
  History,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { SOPHeaderInfo } from '@/components/sop/SOPHeaderInfo'
import { SOPDiagram, type ProsedurRow } from '@/components/sop/SOPDiagram'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPeraturanList, subscribe as subscribePeraturan } from '@/lib/peraturan-store'
import type { Peraturan } from '@/lib/peraturan-store'

interface Komentar {
  id: string
  user: string
  role: string
  timestamp: string
  bagian: string
  isi: string
  status: 'open' | 'resolved'
}

interface Version {
  id: string
  version: string
  date: string
  author: string
  changes: string
  snapshot: { metadata: typeof initialMetadata; prosedurRows: ProsedurRow[] } | null
}

const initialMetadata = {
  institutionLogo: '/logo_unand_kecil.png',
  institutionLines: [
    'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
    'UNIVERSITAS ANDALAS',
    'FAKULTAS TEKNOLOGI INFORMASI',
    'DEPARTEMEN SISTEM INFORMASI',
  ] as string[],
  name: 'Percobaan',
  number: 'T.001/UN15/KP.01.00/2024',
  version: 3,
  createdDate: '2024-11-27',
  revisionDate: '2026-02-10',
  effectiveDate: '2024-11-27',
  picName: 'Dr. Ahmad Fauzi, M.Kom',
  picNumber: '198505102010121001',
  picRole: 'Penanggung Jawab',
  section: 'Layanan Akademik',
  lawBasis: [
    'Peraturan Daerah Kota Padang Nomor 28 Tahun 2018 tentang Keterbukaan Informasi Publik',
  ] as string[],
  implementQualification: ['Riset'] as string[],
  relatedSop: [] as string[],
  equipment: [] as string[],
  warning: '-',
  recordData: [] as string[],
  signature: '',
}

const initialProsedurRows: ProsedurRow[] = [
  {
    id: '1',
    no: 1,
    kegiatan: 'Pemohon mengisi formulir pengajuan online',
    pelaksana: { 'impl-1': '√', 'impl-2': '', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Formulir terisi lengkap',
    mutu_waktu: '5 Menit',
    output: 'Draft pengajuan',
    keterangan: 'Pemohon memulai proses.',
  },
  {
    id: '2',
    no: 2,
    kegiatan: 'Admin Prodi verifikasi berkas dan kelengkapan',
    pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Checklist verifikasi',
    mutu_waktu: '15 Menit',
    output: 'Status verifikasi',
    keterangan: 'Cek kelengkapan dokumen.',
  },
  {
    id: '3',
    no: 3,
    type: 'decision',
    kegiatan: 'Berkas lengkap?',
    pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: '-',
    mutu_waktu: '-',
    output: '-',
    keterangan: 'Jika tidak lengkap kembali ke verifikasi.',
    id_next_step_if_yes: '4',
    id_next_step_if_no: '2',
  },
  {
    id: '4',
    no: 4,
    kegiatan: 'Kaprodi review substansi pengajuan',
    pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '√', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Dokumen final',
    mutu_waktu: '1 Hari',
    output: 'Catatan review',
    keterangan: 'Review isi dokumen.',
  },
  {
    id: '5',
    no: 5,
    kegiatan: 'Dekan menandatangani dan mengesahkan',
    pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '', 'impl-4': '√', 'impl-5': '' },
    mutu_kelengkapan: 'Dokumen siap tanda tangan',
    mutu_waktu: '1 Hari',
    output: 'Dokumen disahkan',
    keterangan: 'Final approval.',
  },
]

export function DetailSOPPenyusun() {
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(false)
  const [isEditingSteps, setIsEditingSteps] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isLawBasisOpen, setIsLawBasisOpen] = useState(false)
  const [lawBasisQuery, setLawBasisQuery] = useState('')
  const [selectedLawBasisIds, setSelectedLawBasisIds] = useState<string[]>([])
  const [isRelatedPosOpen, setIsRelatedPosOpen] = useState(false)
  const [relatedPosQuery, setRelatedPosQuery] = useState('')
  const [selectedRelatedPos, setSelectedRelatedPos] = useState<string[]>([])
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false)
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false)
  const [decisionStepIndex, setDecisionStepIndex] = useState<number | null>(null)
  const [decisionYesId, setDecisionYesId] = useState<string>('')
  const [decisionNoId, setDecisionNoId] = useState<string>('')

  const [metadata, setMetadata] = useState(initialMetadata)
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(initialProsedurRows)

  /** Data peraturan (mock: diasumsikan peraturan OPD tersedia di store). */
  const [peraturanList, setPeraturanList] = useState<Peraturan[]>(() => getPeraturanList())
  useEffect(() => {
    setPeraturanList(getPeraturanList())
    return subscribePeraturan(() => setPeraturanList(getPeraturanList()))
  }, [])

  const [komentarList, setKomentarList] = useState<Komentar[]>([
    {
      id: '1',
      user: 'Dr. Ahmad Fauzi',
      role: 'Kepala OPD',
      timestamp: '2026-02-10 14:30',
      bagian: 'Metadata - Dasar Hukum',
      isi: 'Perlu ditambahkan referensi ke Permendikbud terbaru',
      status: 'open',
    },
    {
      id: '2',
      user: 'Siti Nurhaliza',
      role: 'Tim Penyusun',
      timestamp: '2026-02-09 10:15',
      bagian: 'Prosedur - Baris 1',
      isi: 'Waktu terlalu singkat, perlu disesuaikan',
      status: 'resolved',
    },
  ])

  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v3',
      version: '3.0',
      date: '2026-02-10',
      author: 'Budi Santoso',
      changes: 'Perbaikan metadata dan penambahan prosedur baru',
      snapshot: { metadata: initialMetadata, prosedurRows: initialProsedurRows },
    },
    {
      id: 'v2',
      version: '2.0',
      date: '2026-02-05',
      author: 'Ahmad Pratama',
      changes: 'Revisi mayor sesuai feedback evaluasi',
      snapshot: null,
    },
    {
      id: 'v1',
      version: '1.0',
      date: '2026-01-20',
      author: 'Budi Santoso',
      changes: 'Versi awal dokumen',
      snapshot: null,
    },
  ])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [implementers, setImplementers] = useState([
    { id: 'impl-1', name: 'Pemohon / Mahasiswa' },
    { id: 'impl-2', name: 'Admin Prodi' },
    { id: 'impl-3', name: 'Kaprodi' },
    { id: 'impl-4', name: 'Dekan' },
    { id: 'impl-5', name: 'Kabag. Akademik' },
  ])

  // Force re-layout diagram when needed
  const [diagramVersion, setDiagramVersion] = useState(0)

  const handleMetadataChange = (field: string, value: unknown) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }

  const handleResolveComment = (cid: string) => {
    setKomentarList((prev) =>
      prev.map((k) => (k.id === cid ? { ...k, status: 'resolved' as const } : k))
    )
    setToastMessage({ type: 'success', message: 'Komentar ditandai sebagai resolved' })
  }

  const handleRollback = () => {
    if (!selectedVersion?.snapshot) {
      setToastMessage({ type: 'error', message: 'Versi tidak memiliki snapshot yang tersimpan' })
      return
    }
    setMetadata(selectedVersion.snapshot.metadata)
    setProsedurRows(selectedVersion.snapshot.prosedurRows)
    setIsRollbackDialogOpen(false)
    setToastMessage({ type: 'success', message: `Berhasil rollback ke versi ${selectedVersion.version}` })
  }

  const handleSave = () => {
    setToastMessage({ type: 'success', message: 'Perubahan berhasil disimpan' })
  }

  const handlePrint = () => {
    window.print()
  }

  const relatedPosOptions = [
    'POS Penerimaan Siswa Baru',
    'POS Ujian Sekolah',
    'POS Mutasi Siswa',
    'POS Pengadaan Barang/Jasa',
    'POS Pengaduan Masyarakat',
  ]
  const toLines = (value: string) =>
    value
      .split('\n')
      .map((v) => v.trim())
      .filter(Boolean)

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div
          className={`rounded-md border p-3 text-xs ${
            toastMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      <PageHeader
        breadcrumb={[
          { label: 'SOP Saya', to: '/tim-penyusun/sop-saya' },
          { label: 'Edit SOP' },
        ]}
        title="Edit Dokumen SOP"
        description={metadata.name}
      />

      <div className="bg-white rounded-md border border-gray-200 p-3 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => navigate({ to: '/tim-penyusun/sop-saya' })}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              Versi {versions[0]?.version || '1.0'}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700 text-xs border-0">Draft</Badge>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSave}>
              <Save className="w-3.5 h-3.5" />
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-0">
          {/* Panel 1: Komentar (kiri, bisa diminimize) */}
          <div
            className={`bg-white rounded-md border border-gray-200 transition-all ${
              isCommentsCollapsed ? 'w-12' : 'w-[340px]'
            }`}
          >
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              {!isCommentsCollapsed ? (
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">Komentar</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {komentarList.filter((k) => k.status === 'open').length} terbuka •{' '}
                    {komentarList.filter((k) => k.status === 'resolved').length} resolved
                  </p>
                </div>
              ) : (
                <div className="text-xs text-gray-700 font-medium">
                  {komentarList.filter((k) => k.status === 'open').length}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setIsCommentsCollapsed((v) => !v)}
                title={isCommentsCollapsed ? 'Tampilkan komentar' : 'Minimize komentar'}
              >
                {isCommentsCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>

            {!isCommentsCollapsed && (
              <div className="p-3">
                <ScrollArea className="h-[calc(100vh-260px)]">
                  <div className="space-y-2">
                    {komentarList.map((komentar) => (
                      <div
                        key={komentar.id}
                        className={`p-2.5 rounded-md border text-xs ${
                          komentar.status === 'resolved'
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-semibold">
                                {komentar.user.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{komentar.user}</p>
                              <p className="text-xs text-gray-500">{komentar.role}</p>
                            </div>
                          </div>
                          {komentar.status === 'open' ? (
                            <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 border-0">Open</Badge>
                          ) : (
                            <Badge className="bg-green-600 text-white text-xs px-1.5 py-0 border-0">
                              <Check className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs mb-1.5">
                          {komentar.bagian}
                        </Badge>
                        <p className="text-xs text-gray-900 mb-2">{komentar.isi}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{komentar.timestamp}</p>
                          {komentar.status === 'open' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2 text-green-700 hover:text-green-800 hover:bg-green-50"
                              onClick={() => handleResolveComment(komentar.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Panel 2: View SOP (utama, tidak bisa diminimize) */}
          <div className="flex-1 bg-white rounded-md border border-gray-200 p-4">
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="space-y-8">
                <SOPHeaderInfo {...metadata} editable={false} />

                {!isEditingSteps ? (
                  <div className="flex justify-center">
                    <div className="w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)]">
                      <div className="flex justify-center print:hidden mb-3">
                        <Tabs
                          value={activeTab}
                          onValueChange={(v) => setActiveTab(v as 'flowchart' | 'bpmn')}
                          className="w-full"
                        >
                          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                            <TabsTrigger value="flowchart" className="text-xs">
                              Flowchart
                            </TabsTrigger>
                            <TabsTrigger value="bpmn" className="text-xs">
                              BPMN
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <SOPDiagram
                        key={diagramVersion}
                        rows={prosedurRows}
                        implementers={implementers}
                        diagramType={activeTab}
                        name={metadata.name}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-[calc(297mm-3cm)] max-w-[calc(297mm-3cm)]">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-900">Edit langkah / prosedur</p>
                        <p className="text-[11px] text-gray-500">
                          No akan otomatis mengikuti urutan baris.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-2 py-2 text-left w-10">No</th>
                              <th className="px-2 py-2 text-left w-[32%]">Kegiatan</th>
                              <th className="px-2 py-2 text-left w-[13%]">Tipe</th>
                              <th className="px-2 py-2 text-left w-[16%]">Pelaksana</th>
                              <th className="px-2 py-2 text-left w-[15%]">Kelengkapan</th>
                              <th className="px-2 py-2 text-left w-[10%]">Waktu</th>
                              <th className="px-2 py-2 text-left w-[14%]">Output</th>
                              <th className="px-2 py-2 text-left w-[18%]">Keterangan</th>
                              <th className="px-2 py-2 text-center w-14">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prosedurRows.map((row, idx) => (
                              <tr key={row.id} className="border-b border-gray-100 align-top">
                                <td className="px-2 py-2 text-center align-middle">
                                  {idx + 1}
                                </td>
                                <td className="px-2 py-2">
                                  <Textarea
                                    className="text-xs min-h-[48px]"
                                    value={row.kegiatan}
                                    onChange={(e) =>
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, kegiatan: e.target.value } : r
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <select
                                    className="w-full h-8 rounded-md border border-gray-200 px-1 text-xs"
                                    value={row.type || (idx === 0 || idx === prosedurRows.length - 1 ? 'terminator' : 'task')}
                                    onChange={(e) =>
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, type: e.target.value as any } : r
                                        )
                                      )
                                    }
                                  >
                                    <option value="task">Task</option>
                                    <option value="decision">Decision</option>
                                    <option value="terminator">
                                      {idx === 0
                                        ? 'Start'
                                        : idx === prosedurRows.length - 1
                                        ? 'End'
                                        : 'Terminator'}
                                    </option>
                                  </select>
                                </td>
                                <td className="px-2 py-2">
                                  <select
                                    className="w-full h-8 rounded-md border border-gray-200 px-1 text-xs"
                                    value={
                                      Object.keys(row.pelaksana).find((k) => row.pelaksana[k]) ||
                                      implementers[0]?.id ||
                                      ''
                                    }
                                    onChange={(e) => {
                                      const id = e.target.value
                                      const nextPelaksana: Record<string, string> = {}
                                      implementers.forEach((impl) => {
                                        nextPelaksana[impl.id] = impl.id === id ? '√' : ''
                                      })
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, pelaksana: nextPelaksana } : r
                                        )
                                      )
                                    }}
                                  >
                                    {implementers.map((impl) => (
                                      <option key={impl.id} value={impl.id}>
                                        {impl.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-2 py-2">
                                  <Textarea
                                    className="text-xs min-h-[40px]"
                                    value={row.mutu_kelengkapan}
                                    onChange={(e) =>
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, mutu_kelengkapan: e.target.value } : r
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  {(() => {
                                    const match = (row.mutu_waktu || '').match(/^(\d+)\s*(\w+)?/i)
                                    const amount = match ? match[1] : ''
                                    const rawUnit = match && match[2] ? match[2].toLowerCase() : ''
                                    const unitFromLabel =
                                      rawUnit.startsWith('menit') ? 'm' :
                                      rawUnit.startsWith('jam') ? 'h' :
                                      rawUnit.startsWith('hari') ? 'd' :
                                      rawUnit.startsWith('minggu') ? 'w' :
                                      rawUnit.startsWith('bulan') ? 'mo' :
                                      'm'
                                    const unit = unitFromLabel
                                    const unitLabelMap: Record<string, string> = {
                                      m: 'Menit',
                                      h: 'Jam',
                                      d: 'Hari',
                                      w: 'Minggu',
                                      mo: 'Bulan',
                                    }
                                    const updateMutuWaktu = (nextAmount: string, nextUnit: string) => {
                                      const label = unitLabelMap[nextUnit] || ''
                                      const value = nextAmount ? `${nextAmount} ${label}` : ''
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, mutu_waktu: value } : r
                                        )
                                      )
                                    }
                                    return (
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          min={0}
                                          className="h-8 text-xs w-14"
                                          value={amount}
                                          onChange={(e) => updateMutuWaktu(e.target.value, unit)}
                                        />
                                        <select
                                          className="h-8 rounded-md border border-gray-200 px-1 text-xs"
                                          value={unit}
                                          onChange={(e) => updateMutuWaktu(amount, e.target.value)}
                                        >
                                          <option value="m">Menit</option>
                                          <option value="h">Jam</option>
                                          <option value="d">Hari</option>
                                          <option value="w">Minggu</option>
                                          <option value="mo">Bulan</option>
                                        </select>
                                      </div>
                                    )
                                  })()}
                                </td>
                                <td className="px-2 py-2">
                                  <Textarea
                                    className="text-xs min-h-[40px]"
                                    value={row.output}
                                    onChange={(e) =>
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, output: e.target.value } : r
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <Textarea
                                    className="text-xs min-h-[40px]"
                                    value={row.keterangan}
                                    onChange={(e) =>
                                      setProsedurRows((prev) =>
                                        prev.map((r, i) =>
                                          i === idx ? { ...r, keterangan: e.target.value } : r
                                        )
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-2 text-center align-middle">
                                  <div className="flex items-center justify-center gap-1">
                                    {row.type === 'decision' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        title="Atur cabang decision"
                                        onClick={() => {
                                          setDecisionStepIndex(idx)
                                          setDecisionYesId(row.id_next_step_if_yes || '')
                                          setDecisionNoId(row.id_next_step_if_no || '')
                                          setIsDecisionDialogOpen(true)
                                        }}
                                      >
                                        <Settings2 className="w-3.5 h-3.5" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Tambah langkah setelah baris ini"
                                      onClick={() =>
                                        setProsedurRows((prev) => {
                                          const idBase = Date.now().toString()
                                          const newRow: ProsedurRow = {
                                            id: `${idBase}-${idx + 1}`,
                                            no: idx + 2,
                                            kegiatan: '',
                                            pelaksana: implementers.reduce(
                                              (acc, impl, i2) => ({
                                                ...acc,
                                                [impl.id]: i2 === 0 ? '√' : '',
                                              }),
                                              {} as Record<string, string>
                                            ),
                                            mutu_kelengkapan: '',
                                            mutu_waktu: '',
                                            output: '',
                                            keterangan: '',
                                          }
                                          const next = [...prev]
                                          next.splice(idx + 1, 0, newRow)
                                          return next.map((r, i2) => ({ ...r, no: i2 + 1 }))
                                        })
                                      }
                                    >
                                      +
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      disabled={prosedurRows.length === 1}
                                      title="Hapus langkah"
                                      onClick={() =>
                                        setProsedurRows((prev) =>
                                          prev.filter((_, i) => i !== idx).map((r, i2) => ({
                                            ...r,
                                            no: i2 + 1,
                                          }))
                                        )
                                      }
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() =>
                            setProsedurRows((prev) => [
                              ...prev,
                              {
                                id: String(Date.now()),
                                id_step: String(Date.now()),
                                no: prev.length + 1,
                                kegiatan: '',
                                pelaksana: implementers.reduce(
                                  (acc, impl, idx) => ({
                                    ...acc,
                                    [impl.id]: idx === 0 ? '√' : '',
                                  }),
                                  {} as Record<string, string>
                                ),
                                mutu_kelengkapan: '',
                                mutu_waktu: '',
                                output: '',
                                keterangan: '',
                              },
                            ])
                          }
                        >
                          Tambah langkah
                        </Button>
                        <p className="text-[11px] text-gray-500">
                          Perubahan akan langsung tercermin di diagram setelah disimpan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Panel 3: Form edit (kanan) */}
          <div
            className={`bg-white rounded-md border border-gray-200 transition-all ${
              isEditPanelCollapsed ? 'w-10' : 'w-[420px]'
            }`}
          >
            <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => setIsEditPanelCollapsed((v) => !v)}
                  title={isEditPanelCollapsed ? 'Tampilkan panel edit SOP' : 'Minimize panel edit SOP'}
                >
                  {isEditPanelCollapsed ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
                {!isEditPanelCollapsed && (
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">Edit SOP</h3>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      Header, metadata & pengaturan diagram
                    </p>
                  </div>
                )}
              </div>
              {!isEditPanelCollapsed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 shrink-0"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <History className="w-3.5 h-3.5" />
                  Riwayat
                </Button>
              )}
            </div>

            {!isEditPanelCollapsed && (
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="p-3 space-y-4">
                {/* Section 1: Header SOP */}
                <div className="rounded-md border border-gray-200">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-900">Header SOP</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setIsHeaderCollapsed((v) => !v)}
                      title={isHeaderCollapsed ? 'Tampilkan header SOP' : 'Sembunyikan header SOP'}
                    >
                      {isHeaderCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                      )}
                    </Button>
                  </div>

                  <div className={`p-3 space-y-3 ${isHeaderCollapsed ? 'hidden' : ''}`}>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Logo lembaga</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        className="h-9 text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            handleMetadataChange('institutionLogo', result)
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <p className="text-[11px] text-gray-500">Disimpan sebagai data URL (mock).</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nama/Detail lembaga (4 baris)</Label>
                        <Textarea
                          className="text-xs min-h-[84px]"
                          value={(metadata.institutionLines ?? []).join('\n')}
                          onChange={(e) => handleMetadataChange('institutionLines', toLines(e.target.value))}
                          placeholder="Baris 1\nBaris 2\nBaris 3\nBaris 4"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Nama SOP (read-only)</Label>
                      <Input
                        className="h-9 text-xs bg-gray-50"
                        value={metadata.name}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Nomor SOP (read-only)</Label>
                      <Input
                        className="h-9 text-xs bg-gray-50"
                        value={metadata.number}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Dasar hukum</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setIsLawBasisOpen(true)}
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {(metadata.lawBasis ?? []).length === 0 ? (
                          <p className="text-xs text-gray-500">Belum ada dasar hukum.</p>
                        ) : (
                          (metadata.lawBasis ?? []).map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <p className="text-xs text-gray-700 flex-1">{item}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                                onClick={() => {
                                  const next = (metadata.lawBasis ?? []).filter((_, i) => i !== idx)
                                  handleMetadataChange('lawBasis', next)
                                }}
                                title="Hapus"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Keterkaitan dengan POS</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setIsRelatedPosOpen(true)}
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {(metadata.relatedSop ?? []).length === 0 ? (
                          <p className="text-xs text-gray-500">Belum ada keterkaitan POS.</p>
                        ) : (
                          (metadata.relatedSop ?? []).map((item: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <p className="text-xs text-gray-700 flex-1">{item}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                                onClick={() => {
                                  const next = (metadata.relatedSop ?? []).filter((_, i) => i !== idx)
                                  handleMetadataChange('relatedSop', next)
                                }}
                                title="Hapus"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Peringatan</Label>
                      <Input
                        className="h-9 text-xs"
                        value={metadata.warning}
                        onChange={(e) => handleMetadataChange('warning', e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Kualifikasi pelaksanaan</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            handleMetadataChange('implementQualification', [
                              ...(metadata.implementQualification ?? []),
                              '',
                            ])
                          }
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(metadata.implementQualification ?? []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              className="h-9 text-xs flex-1"
                              value={item}
                              onChange={(e) => {
                                const v = e.target.value
                                const next = [...(metadata.implementQualification ?? [])]
                                next[idx] = v
                                handleMetadataChange('implementQualification', next)
                              }}
                              placeholder={`Kualifikasi ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                const next = (metadata.implementQualification ?? []).filter(
                                  (_: string, i: number) => i !== idx
                                )
                                handleMetadataChange('implementQualification', next)
                              }}
                              title="Hapus"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(metadata.implementQualification ?? []).length === 0 && (
                          <p className="text-[11px] text-gray-500">
                            Belum ada kualifikasi. Klik &quot;Tambah&quot; untuk menambahkan.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Peralatan dan perlengkapan</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            handleMetadataChange('equipment', [...(metadata.equipment ?? []), ''])
                          }
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(metadata.equipment ?? []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              className="h-9 text-xs flex-1"
                              value={item}
                              onChange={(e) => {
                                const v = e.target.value
                                const next = [...(metadata.equipment ?? [])]
                                next[idx] = v
                                handleMetadataChange('equipment', next)
                              }}
                              placeholder={`Peralatan ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                const next = (metadata.equipment ?? []).filter(
                                  (_: string, i: number) => i !== idx
                                )
                                handleMetadataChange('equipment', next)
                              }}
                              title="Hapus"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(metadata.equipment ?? []).length === 0 && (
                          <p className="text-[11px] text-gray-500">
                            Belum ada peralatan/perlengkapan. Klik &quot;Tambah&quot; untuk menambahkan.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Pencatatan dan pendataan</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            handleMetadataChange('recordData', [...(metadata.recordData ?? []), ''])
                          }
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(metadata.recordData ?? []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              className="h-9 text-xs flex-1"
                              value={item}
                              onChange={(e) => {
                                const v = e.target.value
                                const next = [...(metadata.recordData ?? [])]
                                next[idx] = v
                                handleMetadataChange('recordData', next)
                              }}
                              placeholder={`Pencatatan ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => {
                                const next = (metadata.recordData ?? []).filter(
                                  (_: string, i: number) => i !== idx
                                )
                                handleMetadataChange('recordData', next)
                              }}
                              title="Hapus"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {(metadata.recordData ?? []).length === 0 && (
                          <p className="text-[11px] text-gray-500">
                            Belum ada pencatatan/pendataan. Klik &quot;Tambah&quot; untuk menambahkan.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">Aktor pelaksana</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setImplementers((prev) => [
                              ...prev,
                              { id: `impl-${prev.length + 1}`, name: `Aktor ${prev.length + 1}` },
                            ])
                          }
                        >
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {implementers.map((imp, idx) => (
                          <div key={imp.id} className="flex items-center gap-2">
                            <Input
                              className="h-9 text-xs flex-1"
                              value={imp.name}
                              onChange={(e) => {
                                const v = e.target.value
                                setImplementers((prev) => prev.map((p, i) => (i === idx ? { ...p, name: v } : p)))
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => setImplementers((prev) => prev.filter((_, i) => i !== idx))}
                              title="Hapus"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: area kontrol prosedur/diagram */}
                <div className="rounded-md border border-gray-200">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900">Prosedur & Diagram</p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">
                          Flowchart · BPMN
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Atur tabel langkah dan susunan visual diagram.
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={isEditingSteps ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-[11px] px-2"
                        onClick={() => setIsEditingSteps((prev) => !prev)}
                      >
                        {isEditingSteps ? 'Selesai edit' : 'Ubah langkah'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-2"
                        disabled={isEditingSteps}
                        onClick={() => setDiagramVersion((v) => v + 1)}
                        title="Paksa susun ulang layout diagram"
                      >
                        Perbaiki diagram
                      </Button>
                    </div>
                  </div>
                  <div className="px-3 py-2 text-[11px] text-gray-600 border-t border-gray-100 bg-gray-50/60">
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>
                        <span className="font-semibold">Ubah langkah</span> membuka editor tabel di panel
                        tengah untuk mengubah urutan dan isi tahapan.
                      </li>
                      <li>
                        <span className="font-semibold">Perbaiki diagram</span> memaksa penyusunan ulang
                        posisi shape & panah jika layout terasa berantakan.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              </ScrollArea>
            )}
          </div>
      </div>

      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Rollback ke Versi Sebelumnya</DialogTitle>
            <DialogDescription className="text-xs">
              Dokumen akan dikembalikan ke versi ini dan perubahan saat ini akan hilang
            </DialogDescription>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs font-semibold text-gray-900 mb-1">Versi {selectedVersion.version}</p>
                <p className="text-xs text-gray-700 mb-2">{selectedVersion.changes}</p>
                <p className="text-xs text-gray-600">
                  Tanggal:{' '}
                  {new Date(selectedVersion.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-600">Author: {selectedVersion.author}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-xs text-amber-900">
                  <strong>Peringatan:</strong> Rollback akan mengganti seluruh konten dokumen dengan
                  versi {selectedVersion.version}. Perubahan yang belum disimpan akan hilang.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsRollbackDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700"
              onClick={handleRollback}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Rollback Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Riwayat versi (dibuka dari panel 3) */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat Versi</DialogTitle>
            <DialogDescription className="text-xs">{versions.length} versi terdokumentasi</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div key={version.id} className="bg-gray-50 rounded-md border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-900">Versi {version.version}</p>
                    {index === 0 && (
                      <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                    )}
                    {version.snapshot && (
                      <Badge className="bg-green-100 text-green-700 text-xs border-0">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Snapshot
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(version.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Author: {version.author}</p>
                  {version.snapshot && index !== 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setSelectedVersion(version)
                        setIsRollbackDialogOpen(true)
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Rollback
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsHistoryOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: pilih dasar hukum dari peraturan OPD (searchable) */}
      <Dialog open={isLawBasisOpen} onOpenChange={setIsLawBasisOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Pilih Dasar Hukum</DialogTitle>
            <DialogDescription className="text-xs">Cari peraturan yang akan ditambahkan ke dasar hukum.</DialogDescription>
          </DialogHeader>
          <SearchInput
            placeholder="Cari peraturan..."
            value={lawBasisQuery}
            onChange={(e) => setLawBasisQuery(e.target.value)}
            className="mb-2 border border-gray-200 rounded-md px-0 py-0"
            inputClassName="border-0 focus:ring-0 focus:outline-none"
          />
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ScrollArea className="h-[360px]">
              <div className="divide-y divide-gray-100">
                {peraturanList
                  .filter((p) => p.status === 'Berlaku')
                  .filter((p) => {
                    const q = lawBasisQuery.toLowerCase()
                    if (!q) return true
                    return (
                      p.tentang.toLowerCase().includes(q) ||
                      p.jenisPeraturan.toLowerCase().includes(q) ||
                      `${p.nomor}/${p.tahun}`.includes(q)
                    )
                  })
                  .map((p) => {
                    const label = `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                    const already = (metadata.lawBasis ?? []).includes(label)
                    const selected = selectedLawBasisIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`w-full text-left p-3 hover:bg-gray-50 flex items-start gap-2 ${
                          already ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        disabled={already}
                        onClick={() => {
                          if (already) return
                          setSelectedLawBasisIds((prev) =>
                            prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                          )
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {p.jenisPeraturan} No. {p.nomor}/{p.tahun}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">{p.tentang}</p>
                        </div>
                      </button>
                    )
                  })}
                {peraturanList.length === 0 && (
                  <div className="p-6 text-center text-xs text-gray-500">Belum ada data peraturan.</div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsLawBasisOpen(false)
                setSelectedLawBasisIds([])
                setLawBasisQuery('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={selectedLawBasisIds.length === 0}
              onClick={() => {
                const selectedPeraturan = peraturanList.filter((p) => selectedLawBasisIds.includes(p.id))
                const existing = metadata.lawBasis ?? []
                const additional = selectedPeraturan
                  .map(
                    (p) => `${p.jenisPeraturan} No. ${p.nomor}/${p.tahun} tentang ${p.tentang}`
                  )
                  .filter((label) => !existing.includes(label))
                handleMetadataChange('lawBasis', [...existing, ...additional])
                setSelectedLawBasisIds([])
                setLawBasisQuery('')
                setIsLawBasisOpen(false)
              }}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: pilih keterkaitan POS (searchable) */}
      <Dialog open={isRelatedPosOpen} onOpenChange={setIsRelatedPosOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Pilih Keterkaitan POS</DialogTitle>
            <DialogDescription className="text-xs">Cari POS yang terkait.</DialogDescription>
          </DialogHeader>
          <SearchInput
            placeholder="Cari POS..."
            value={relatedPosQuery}
            onChange={(e) => setRelatedPosQuery(e.target.value)}
            className="mb-2 border border-gray-200 rounded-md px-0 py-0"
            inputClassName="border-0 focus:ring-0 focus:outline-none"
          />
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {relatedPosOptions
                .filter((x) => x.toLowerCase().includes(relatedPosQuery.toLowerCase()))
                .map((x) => {
                  const already = (metadata.relatedSop ?? []).includes(x)
                  const selected = selectedRelatedPos.includes(x)
                  return (
                    <button
                      key={x}
                      type="button"
                      className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 ${
                        already ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      disabled={already}
                      onClick={() => {
                        if (already) return
                        setSelectedRelatedPos((prev) =>
                          prev.includes(x) ? prev.filter((v) => v !== x) : [...prev, x]
                        )
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
                      />
                      <p className="text-xs font-medium text-gray-900">{x}</p>
                    </button>
                  )
                })}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsRelatedPosOpen(false)
                setSelectedRelatedPos([])
                setRelatedPosQuery('')
              }}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={selectedRelatedPos.length === 0}
              onClick={() => {
                const existing = metadata.relatedSop ?? []
                const additional = selectedRelatedPos.filter((x) => !existing.includes(x))
                handleMetadataChange('relatedSop', [...existing, ...additional])
                setSelectedRelatedPos([])
                setRelatedPosQuery('')
                setIsRelatedPosOpen(false)
              }}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: konfigurasi cabang decision */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Atur cabang keputusan</DialogTitle>
            <DialogDescription className="text-xs">
              Pilih langkah tujuan untuk jawaban <strong>Ya</strong> dan <strong>Tidak</strong>.
            </DialogDescription>
          </DialogHeader>
          {decisionStepIndex !== null && (
            <div className="space-y-3">
              <p className="text-xs text-gray-700">
                Decision pada tahap <strong>{decisionStepIndex + 1}</strong> –{' '}
                <span className="italic">{prosedurRows[decisionStepIndex].kegiatan || 'Tanpa judul'}</span>
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Tahap jika <span className="font-semibold text-red-600">Tidak</span></Label>
                <select
                  className="w-full h-8 rounded-md border border-gray-200 px-2 text-xs"
                  value={decisionNoId}
                  onChange={(e) => setDecisionNoId(e.target.value)}
                >
                  <option value="">Pilih tahap</option>
                  {prosedurRows.map((row, idx) => (
                    <option key={row.id} value={row.id} disabled={idx === decisionStepIndex}>
                      {idx + 1}. {row.kegiatan || '(tanpa judul)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tahap jika <span className="font-semibold text-green-700">Ya</span></Label>
                <select
                  className="w-full h-8 rounded-md border border-gray-200 px-2 text-xs"
                  value={decisionYesId}
                  onChange={(e) => setDecisionYesId(e.target.value)}
                >
                  <option value="">Pilih tahap</option>
                  {prosedurRows.map((row, idx) => (
                    <option key={row.id} value={row.id} disabled={idx === decisionStepIndex}>
                      {idx + 1}. {row.kegiatan || '(tanpa judul)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsDecisionDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (decisionStepIndex === null) return
                setProsedurRows((prev) =>
                  prev.map((row, idx) =>
                    idx === decisionStepIndex
                      ? {
                          ...row,
                          id_next_step_if_yes: decisionYesId || undefined,
                          id_next_step_if_no: decisionNoId || undefined,
                        }
                      : row
                  )
                )
                setIsDecisionDialogOpen(false)
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
