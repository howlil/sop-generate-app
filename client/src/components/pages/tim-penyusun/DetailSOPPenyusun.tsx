import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  X,
  RotateCcw,
  History,
  PenLine,
  Settings2,
  MoreHorizontal,
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
import { Toast } from '@/components/ui/toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SOPHeaderInfo } from '@/components/sop/SOPHeaderInfo'
import { SOPDiagram, type ProsedurRow } from '@/components/sop/SOPDiagram'
import { PageHeader } from '@/components/layout/PageHeader'
import { getPeraturanList, subscribe as subscribePeraturan } from '@/lib/peraturan-store'
import type { Peraturan } from '@/lib/peraturan-store'
import { setSopStatusOverride } from '@/lib/sop-status-store'

/** Hanya Kepala OPD dan Tim Evaluasi yang dapat membuat komentar; Tim Penyusun tidak bisa membuat komentar, hanya melihat dan resolve. */
interface Komentar {
  id: string
  user: string
  role: 'Kepala OPD' | 'Tim Evaluasi' | 'Tim Penyusun'
  timestamp: string
  bagian: string
  isi: string
  status: 'open' | 'resolved'
}

/** Versi SOP: minor (1.0→1.1) saat review internal/biro sebelum disahkan; major (1.x→2.0) saat disahkan lalu evaluasi. */
interface Version {
  id: string
  version: string
  revisionType: 'major' | 'minor'
  date: string
  author: string
  changes: string
  snapshot: { metadata: typeof initialMetadata; prosedurRows: ProsedurRow[] } | null
}

const initialMetadata = {
  institutionLogo: '/logo_unand_kecil.png',
  institutionLines: [
    'PEMERINTAH KABUPATEN PADANG',
    'DINAS PENDIDIKAN',
    'BIDANG PENDIDIKAN DASAR',
    'SEKSI KURIKULUM DAN PENILAIAN',
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
  const [rightPanelTab, setRightPanelTab] = useState<'edit' | 'riwayat'>('edit')
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

  /** Komentar hanya dari Kepala OPD dan Tim Evaluasi (Tim Penyusun tidak bisa membuat komentar). */
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
      user: 'Dra. Siti Aminah, M.Si',
      role: 'Tim Evaluasi',
      timestamp: '2026-02-09 10:15',
      bagian: 'Prosedur - Baris 1',
      isi: 'Waktu proses terlalu singkat, perlu disesuaikan dengan standar pelayanan',
      status: 'resolved',
    },
  ])

  const [versions, _setVersions] = useState<Version[]>([
    {
      id: 'v2.1',
      version: '2.1',
      revisionType: 'minor',
      date: '2026-02-10',
      author: 'Budi Santoso',
      changes: 'Perbaikan metadata dan penambahan prosedur baru',
      snapshot: { metadata: initialMetadata, prosedurRows: initialProsedurRows },
    },
    {
      id: 'v2.0',
      version: '2.0',
      revisionType: 'major',
      date: '2026-02-05',
      author: 'Ahmad Pratama',
      changes: 'Revisi major setelah SOP disahkan dan hasil evaluasi',
      snapshot: { metadata: initialMetadata, prosedurRows: initialProsedurRows },
    },
    {
      id: 'v1.1',
      version: '1.1',
      revisionType: 'minor',
      date: '2026-01-28',
      author: 'Budi Santoso',
      changes: 'Revisi minor dari review internal',
      snapshot: { metadata: initialMetadata, prosedurRows: initialProsedurRows },
    },
    {
      id: 'v1.0',
      version: '1.0',
      revisionType: 'major',
      date: '2026-01-20',
      author: 'Budi Santoso',
      changes: 'Versi awal dokumen',
      snapshot: { metadata: initialMetadata, prosedurRows: initialProsedurRows },
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
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type === 'error' ? 'error' : 'success'}
        />
      )}

      <PageHeader
        breadcrumb={[
          { label: 'SOP Saya', to: '/tim-penyusun/sop-saya' },
          { label: 'Edit SOP' },
        ]}
        title="Edit Dokumen SOP"
        description={metadata.name}
        leading={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: '/tim-penyusun/sop-saya' })}
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        }
      />

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden rounded-lg border border-gray-200 bg-white print:hidden">
        <div className="flex-shrink-0 flex items-center justify-end gap-2 p-3 border-b border-gray-200">
          <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
            v{versions[0]?.version || '1.0'}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              if (id) {
                setSopStatusOverride(id, 'Sedang Disusun')
                setToastMessage({ type: 'success', message: 'Status diubah menjadi Sedang Disusun' })
              }
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Simpan sebagai draft
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => {
              if (id) {
                setSopStatusOverride(id, 'Diperiksa Kepala OPD')
                setToastMessage({ type: 'success', message: 'SOP diserahkan ke Kepala OPD' })
                navigate({ to: '/tim-penyusun/sop-saya' })
              }
            }}
          >
            <Check className="w-3.5 h-3.5" />
            Serahkan ke Kepala OPD
          </Button>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Panel 1: Komentar (kiri, bisa diminimize) */}
          <div
            className={`flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
              isCommentsCollapsed ? 'w-12' : 'w-[min(280px,22%)] min-w-[180px]'
            }`}
          >
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              {!isCommentsCollapsed ? (
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">Komentar</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Dari Kepala OPD & Tim Evaluasi · {komentarList.filter((k) => k.role !== 'Tim Penyusun' && k.status === 'open').length} terbuka · {komentarList.filter((k) => k.role !== 'Tim Penyusun' && k.status === 'resolved').length} resolved
                  </p>
                </div>
              ) : (
                <div className="text-xs text-gray-700 font-medium">
                  {komentarList.filter((k) => k.role !== 'Tim Penyusun' && k.status === 'open').length}
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
                <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-2">
                  {komentarList.filter((k) => k.role !== 'Tim Penyusun').map((komentar) => (
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
                      {komentar.bagian ? (
                        <Badge variant="secondary" className="text-xs mb-1.5">
                          {komentar.bagian}
                        </Badge>
                      ) : null}
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

          {/* Panel 2: View SOP (utama) — preview A4 landscape */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200 p-4">
            <ScrollArea className="flex-1 min-h-0">
              <div className="sop-a4-preview p-2">
                <div className="space-y-8">
                  <SOPHeaderInfo {...metadata} editable={false} />

                {!isEditingSteps ? (
                  <div className="flex justify-center">
                    <div className="w-full">
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
                  <div className="w-full max-w-full">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-900">Edit langkah / prosedur</p>
                        <p className="text-[11px] text-gray-500">
                          No akan otomatis mengikuti urutan baris.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-2 py-1 text-left w-10">No</th>
                              <th className="px-2 py-1 text-left w-[28%]">Kegiatan</th>
                              <th className="px-2 py-1 text-left w-[12%]">Tipe</th>
                              <th className="px-2 py-1 text-left w-[14%]">Pelaksana</th>
                              <th className="px-2 py-1 text-left w-[13%]">Kelengkapan</th>
                              <th className="px-2 py-1 text-left w-[8%]">Waktu</th>
                              <th className="px-2 py-1 text-left w-[12%]">Output</th>
                              <th className="px-2 py-1 text-left w-[23%]">Keterangan</th>
                              <th className="px-1 py-1 text-center w-10">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prosedurRows.map((row, idx) => (
                              <tr key={row.id} className="border-b border-gray-100 align-top">
                                <td className="px-2 py-1 text-center align-middle">
                                  {idx + 1}
                                </td>
                                <td className="px-2 py-1">
                                  <Textarea
                                    className="text-xs min-h-[40px]"
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
                                <td className="px-2 py-1">
                                  {(() => {
                                    const yesIndex = row.id_next_step_if_yes
                                      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_yes)
                                      : -1
                                    const noIndex = row.id_next_step_if_no
                                      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_no)
                                      : -1
                                    const hasDecisionTarget = yesIndex !== -1 || noIndex !== -1
                                    return (
                                      <div className="space-y-1">
                                        <select
                                          className="w-full h-8 rounded-md border border-gray-200 px-1 text-xs"
                                          value={
                                            row.type ||
                                            (idx === 0 || idx === prosedurRows.length - 1
                                              ? 'terminator'
                                              : 'task')
                                          }
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
                                        {row.type === 'decision' && (
                                          <p className="text-[10px] text-gray-500">
                                            {!hasDecisionTarget
                                              ? 'Belum diatur cabang Ya/Tidak.'
                                              : [
                                                  yesIndex !== -1 ? `Ya → ${yesIndex + 1}` : null,
                                                  noIndex !== -1 ? `Tidak → ${noIndex + 1}` : null,
                                                ]
                                                  .filter(Boolean)
                                                  .join(' • ')}
                                          </p>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </td>
                                <td className="px-2 py-1">
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
                                <td className="px-2 py-1">
                                  <Textarea
                                    className="text-xs min-h-[36px]"
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
                                <td className="px-2 py-1">
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
                                          className="h-8 text-xs w-12"
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
                                <td className="px-2 py-1">
                                  <Textarea
                                    className="text-xs min-h-[36px]"
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
                                <td className="px-2 py-1">
                                  <Textarea
                                    className="text-xs min-h-[36px]"
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
                                <td className="px-1 py-1 text-center align-middle">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        title="Aksi langkah"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[9rem]">
                                      {row.type === 'decision' && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setDecisionStepIndex(idx)
                                            const yesId = row.id_next_step_if_yes || ''
                                            const noId = row.id_next_step_if_no || ''
                                            setDecisionYesId(yesId)
                                            setDecisionNoId(noId === yesId && yesId ? '' : noId)
                                            setIsDecisionDialogOpen(true)
                                          }}
                                        >
                                          <Settings2 className="w-3 h-3 mr-1.5 text-gray-500" />
                                          <span>Atur cabang decision</span>
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
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
                                        <span className="mr-1.5 text-blue-600">+</span>
                                        <span>Tambah langkah setelah ini</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={prosedurRows.length === 1}
                                        onClick={() =>
                                          setProsedurRows((prev) =>
                                            prev.filter((_, i) => i !== idx).map((r, i2) => ({
                                              ...r,
                                              no: i2 + 1,
                                            }))
                                          )
                                        }
                                        className="text-red-600 data-[disabled]:text-gray-400"
                                        title="Hapus langkah"
                                      >
                                        <X className="w-3 h-3" />
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
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
                </div>
              </ScrollArea>
              </div>

          {/* Panel 3: Form edit (kanan) */}
          <div
            className={`flex flex-col flex-shrink-0 bg-white transition-[width] duration-200 overflow-hidden ${
              isEditPanelCollapsed ? 'w-10' : 'w-[min(380px,30%)] min-w-[280px]'
            }`}
          >
            <div className="p-3 border-b border-gray-200 flex items-center gap-2">
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
                  <div className="flex flex-1 min-w-0 rounded-md bg-gray-100 p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('edit')}
                      className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        rightPanelTab === 'edit'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <PenLine className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRightPanelTab('riwayat')}
                      className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                        rightPanelTab === 'riwayat'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <History className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Riwayat</span>
                    </button>
                  </div>
                )}
            </div>

            {!isEditPanelCollapsed && (
              <ScrollArea className="flex-1 min-h-0">
                {rightPanelTab === 'edit' && (
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
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-900">Prosedur & Diagram</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-600">
                        Flowchart · BPMN
                      </span>
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
                </div>
              </div>
                )}
                {rightPanelTab === 'riwayat' && (
                <div className="p-3 space-y-3">
                  <p className="text-xs text-gray-600 mb-3">{versions.length} versi terdokumentasi</p>
                  {versions.map((version, index) => (
                    <div key={version.id} className="bg-gray-50 rounded-md border border-gray-200 p-3 mb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-gray-900">v{version.version}</p>
                          {index === 0 && (
                            <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={`text-xs border-0 ${
                              version.revisionType === 'major'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {version.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(version.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                )}
            </ScrollArea>
            )}
          </div>
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
                <p className="text-xs font-semibold text-gray-900 mb-1">v{selectedVersion.version} — {selectedVersion.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}</p>
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
                  v{selectedVersion.version}. Perubahan yang belum disimpan akan hilang.
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-900">v{version.version}</p>
                    {index === 0 && (
                      <Badge className="bg-blue-600 text-white text-xs border-0">Current</Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-xs border-0 ${
                        version.revisionType === 'major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {version.revisionType === 'major' ? 'Revisi major' : 'Revisi minor'}
                    </Badge>
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
              Pilih langkah tujuan untuk jawaban <strong>Ya</strong> dan <strong>Tidak</strong>. Keduanya harus mengarah ke tahap yang berbeda.
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
                    <option
                      key={row.id}
                      value={row.id}
                      disabled={idx === decisionStepIndex || row.id === decisionYesId}
                    >
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
                    <option
                      key={row.id}
                      value={row.id}
                      disabled={idx === decisionStepIndex || row.id === decisionNoId}
                    >
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
                if (decisionYesId && decisionNoId && decisionYesId === decisionNoId) {
                  setToastMessage({
                    type: 'error',
                    message: 'Tahap jika Ya dan Tahap jika Tidak harus berbeda.',
                  })
                  return
                }
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
