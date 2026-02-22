import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from '@tanstack/react-router'
import {
  ArrowLeft,
  MessageSquare,
  Check,
  Send,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Calendar,
  Building2,
  Users,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SOPHeaderInfo } from '@/components/sop/SOPHeaderInfo'
import { SOPDiagram, type ProsedurRow } from '@/components/sop/SOPDiagram'
import { PageHeader } from '@/components/layout/PageHeader'
import type { TTESignaturePayload } from '@/lib/tte-types'
import { getTTEProfile, getTTESignatures, verifyPin, addTTESignature } from '@/lib/tte'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { Link } from '@tanstack/react-router'
import { getSopStatusOverride, setSopStatusOverride } from '@/lib/sop-status-store'
import type { StatusSOP } from '@/lib/sop-status'

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
  snapshot: unknown
  eventLabel?: string
}

export function DetailSOP() {
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
  const navigate = useNavigate()
  const location = useLocation()
  /** Data penugasan dari inisiasi proyek (diteruskan dari Daftar SOP); tanpa info spesifik SOP seperti judul/nomor. */
  const penugasanState = location.state as {
    sopStatus?: StatusSOP
    waktuPenugasan?: string
    unitTerkait?: string
    timPenyusun?: string
    terakhirDiperbarui?: string
    deskripsiProyek?: string
  } | undefined
  /** Status SOP: dari store override atau dari state navigasi (Daftar SOP); Aksi Sahkan hanya untuk status Terverifikasi dari Kepala Biro. */
  const sopStatus: StatusSOP =
    (id ? getSopStatusOverride(id) : undefined) ??
    penugasanState?.sopStatus ??
    'Draft'

  const [isCommentsCollapsed, setIsCommentsCollapsed] = useState(false)
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [ttePayload, setTtePayload] = useState<TTESignaturePayload | null>(null)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const sig = getTTESignatures().find(
        (s) => s.documentId === id && s.role === 'kepala-opd'
      )
      setTtePayload(sig ?? null)
    }
  }, [id])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const implementers = [
    { id: 'impl-1', name: 'Pemohon / Mahasiswa' },
    { id: 'impl-2', name: 'Admin Prodi' },
    { id: 'impl-3', name: 'Kaprodi' },
    { id: 'impl-4', name: 'Dekan' },
    { id: 'impl-5', name: 'Kabag. Akademik' },
  ]

  const metadata = {
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
    ],
    implementQualification: ['Riset'],
    relatedSop: [],
    equipment: [],
    warning: '-',
    recordData: [],
    signature: '',
  }

  const prosedurRows: ProsedurRow[] = [
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

  /** Hanya Kepala OPD / Tim Evaluasi yang punya komentar; Tim Penyusun tidak buat komentar. Resolve hanya di halaman Tim Penyusun. */
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
  ])

  const versions: Version[] = [
    {
      id: 'v3',
      version: '3.0',
      date: '2026-02-10',
      author: 'Budi Santoso',
      changes: 'Perbaikan metadata dan penambahan prosedur baru',
      snapshot: { metadata, prosedurRows },
      eventLabel: 'Submit ke Review',
    },
    {
      id: 'v2',
      version: '2.0',
      date: '2026-02-05',
      author: 'Ahmad Pratama',
      changes: 'Revisi mayor sesuai feedback evaluasi',
      snapshot: null,
      eventLabel: 'Ajukan Evaluasi',
    },
    {
      id: 'v1',
      version: '1.0',
      date: '2026-01-20',
      author: 'Budi Santoso',
      changes: 'Versi awal dokumen',
      snapshot: null,
      eventLabel: 'Draft awal',
    },
  ]

  const handleAddComment = () => {
    if (!newComment.trim()) {
      setToastMessage('Komentar harus diisi')
      return
    }
    setKomentarList([
      {
        id: String(Date.now()),
        user: 'Dr. Ahmad Fauzi',
        role: 'Kepala OPD',
        timestamp: new Date().toLocaleString('id-ID'),
        bagian: '',
        isi: newComment.trim(),
        status: 'open',
      },
      ...komentarList,
    ])
    setNewComment('')
    setToastMessage('Komentar berhasil ditambahkan')
  }

  const handleResolveComment = (commentId: string) => {
    setKomentarList(
      komentarList.map((k) =>
        k.id === commentId ? { ...k, status: 'resolved' as const } : k
      )
    )
    setToastMessage('Komentar ditandai sebagai resolved')
  }

  const handleMengesahkanClick = () => {
    const profile = getTTEProfile('kepala-opd')
    if (!profile || !profile.emailVerified) {
      return
    }
    setPinDialogOpen(true)
  }

  const tteProfile = getTTEProfile('kepala-opd')
  const canMengesahkanWithTTE = tteProfile?.emailVerified === true

  const handlePinConfirm = (pin: string): boolean => {
    const profile = getTTEProfile('kepala-opd')
    if (!profile || !verifyPin(pin, profile.pinHash)) return false
    if (!id) return false
    const payload = addTTESignature(
      'kepala-opd',
      profile.nip,
      profile.nama,
      id,
      metadata.name,
      metadata.number || id
    )
    setTtePayload(payload)
    setSopStatusOverride(id, 'Berlaku')
    setToastMessage('SOP berhasil disahkan dengan TTE BSRE.')
    setPinDialogOpen(false)
    return true
  }


  const komentarTampil = komentarList.filter((k) => k.role !== 'Tim Penyusun')
  const openComments = komentarTampil.filter((k) => k.status === 'open').length
  const resolvedComments = komentarTampil.filter((k) => k.status === 'resolved').length

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 gap-3">
      {toastMessage && (
        <div
          className={`flex-shrink-0 rounded-md border px-4 py-2 text-xs print:hidden ${
            toastMessage.includes('berhasil')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toastMessage}
        </div>
      )}

      <PageHeader
        breadcrumb={[
          { label: 'Daftar SOP', to: '/kepala-opd/daftar-sop' },
          { label: 'Detail SOP' },
        ]}
        title="Detail Dokumen SOP"
        description={metadata.name}
        leading={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: '/kepala-opd/daftar-sop' })}
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              Versi {versions[0]?.version || '1.0'}
            </Badge>
            <Badge className="bg-green-100 text-green-700 text-xs border-0">Berlaku</Badge>
          </div>
        }
      />

      <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Informasi penugasan (dari inisiasi proyek) — card netral tanpa aksen biru */}
      {(penugasanState?.waktuPenugasan ?? penugasanState?.unitTerkait ?? penugasanState?.timPenyusun ?? penugasanState?.deskripsiProyek) && (
        <div className="flex-shrink-0 rounded-t-xl border border-b-0 border-gray-200 bg-white shadow-sm print:hidden overflow-hidden">
          <div className="flex">
            <div className="flex-1 px-4 py-3">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                <div className="p-1.5 rounded-md bg-gray-100">
                  <FileText className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Informasi penugasan
                </h3>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {penugasanState.waktuPenugasan && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Waktu
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {penugasanState.waktuPenugasan.includes('-')
                        ? new Date(penugasanState.waktuPenugasan + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : penugasanState.waktuPenugasan}
                    </span>
                  </div>
                )}
                {penugasanState.unitTerkait && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      Unit
                    </span>
                    <span className="text-sm font-medium text-gray-900">{penugasanState.unitTerkait}</span>
                  </div>
                )}
                {penugasanState.timPenyusun && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      Tim
                    </span>
                    <span className="text-sm font-medium text-gray-900">{penugasanState.timPenyusun}</span>
                  </div>
                )}
                {penugasanState.terakhirDiperbarui && (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
                      <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                      Diperbarui
                    </span>
                    <span className="text-sm font-medium text-gray-900">{penugasanState.terakhirDiperbarui}</span>
                  </div>
                )}
              </div>
              {penugasanState.deskripsiProyek && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 leading-relaxed max-w-full" title={penugasanState.deskripsiProyek}>
                  {penugasanState.deskripsiProyek}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Three-panel workspace (langsung di bawah info penugasan, tanpa gap) ───────────────────────────── */}
      <div className={`flex flex-1 min-h-0 overflow-hidden border border-gray-200 bg-white ${(penugasanState?.waktuPenugasan ?? penugasanState?.unitTerkait ?? penugasanState?.timPenyusun ?? penugasanState?.deskripsiProyek) ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'}`}>

        {/* Left: Komentar — collapse/minimize via chevron di header; expand via tab saat collapsed */}
        <div
          className={`flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
            isCommentsCollapsed ? 'w-10 min-w-[2.5rem]' : 'w-[min(320px,28%)] min-w-[220px]'
          }`}
        >
          {isCommentsCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-full w-full flex flex-col items-center justify-center gap-1 rounded-none border-0 border-r border-gray-200 py-4"
              onClick={() => setIsCommentsCollapsed(false)}
              title="Buka panel Komentar"
            >
              <MessageSquare className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-[10px] text-gray-500 leading-tight">Komentar</span>
            </Button>
          ) : (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">Komentar Internal</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {openComments} terbuka &bull; {resolvedComments} resolved
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsCommentsCollapsed(true)}
                  title="Minimize panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-3 border-b border-gray-200 flex-shrink-0">
                <Label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Tambah Komentar Baru
                </Label>
                <Textarea
                  className="text-xs min-h-[72px] rounded-md border-gray-200 resize-none"
                  placeholder="Tulis komentar Anda..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1.5 w-full mt-2"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Komentar
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-2">
                  {komentarTampil.map((komentar) => (
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
                          <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
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
                          <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 border-0">
                            Open
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white text-xs px-1.5 py-0 border-0">
                            <Check className="w-3 h-3" />
                          </Badge>
                        )}
                      </div>
                      {komentar.bagian ? (
                        <Badge className="bg-gray-200 text-gray-700 text-xs border-0 mb-1.5">
                          {komentar.bagian}
                        </Badge>
                      ) : null}
                      <p className="text-xs text-gray-900 mb-2">{komentar.isi}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{komentar.timestamp}</p>
                        {/* Resolve hanya di halaman Tim Penyusun (DetailSOPPenyusun), bukan di Kepala OPD */}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Center: SOP View (read-only) — preview A4 landscape */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <ScrollArea className="flex-1 min-h-0">
            <div className="sop-a4-preview p-2">
              <div className="space-y-8">
                <SOPHeaderInfo {...metadata} editable={false} tteSignaturePayload={ttePayload} />

              <div className="flex justify-center print:hidden">
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

              <div className="w-full">
                <SOPDiagram
                  rows={prosedurRows}
                  implementers={implementers}
                  diagramType={activeTab}
                  name={metadata.name}
                />
              </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right: Riwayat Versi — collapse/minimize via chevron di header; expand via tab saat collapsed */}
        <div
          className={`flex flex-col flex-shrink-0 border-l border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
            isHistoryCollapsed ? 'w-10 min-w-[2.5rem]' : 'w-[min(320px,28%)] min-w-[220px]'
          }`}
        >
          {isHistoryCollapsed ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-full w-full flex flex-col items-center justify-center gap-1 rounded-none border-0 border-l border-gray-200 py-4"
              onClick={() => setIsHistoryCollapsed(false)}
              title="Buka panel Riwayat Versi"
            >
              <History className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="text-[10px] text-gray-500 leading-tight">Riwayat</span>
            </Button>
          ) : (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">Riwayat Versi</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {versions.length} versi terdokumentasi
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsHistoryCollapsed(true)}
                  title="Minimize panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 space-y-3">
                  {versions.map((version, index) => (
                    <div key={version.id} className="relative pl-6">
                      {index < versions.length - 1 && (
                        <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
                      )}
                      <div
                        className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                          index === 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                        }`}
                      />
                      <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-gray-900">
                              Versi {version.version}
                            </p>
                            {version.eventLabel && (
                              <Badge variant="secondary" className="text-xs border-0">
                                {version.eventLabel}
                              </Badge>
                            )}
                            {index === 0 && (
                              <Badge className="bg-blue-600 text-white text-xs border-0">
                                Current
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(version.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-semibold">
                              {version.author.charAt(0)}
                            </span>
                          </div>
                          <p className="text-xs">{version.author}</p>
                        </div>
                        {index > 0 && (
                          <div className="flex gap-1.5 pt-2 mt-2 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setToastMessage('Lihat versi (read-only) — fitur lengkap di backend')}
                            >
                              Lihat versi
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
      </div>

      <PinVerificationDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk mengesahkan SOP ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Mengesahkan"
      />
    </div>
  )
}
