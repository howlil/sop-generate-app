import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Check,
  X,
  Send,
  History,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SOPHeaderInfo } from '@/components/sop/SOPHeaderInfo'
import { SOPDiagram, type ProsedurRow } from '@/components/sop/SOPDiagram'
import { PageHeader } from '@/components/layout/PageHeader'
import { getActiveCaseForSop } from '@/lib/evaluation-case'

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
  /** Event saat snapshot dibuat (submit, ajukan evaluasi, disahkan, dll.) */
  eventLabel?: string
}

export function DetailSOP() {
  const params = useParams({ strict: false })
  const id = 'id' in params ? params.id : undefined
  const navigate = useNavigate()

  const [activePanel, setActivePanel] = useState<'none' | 'comments' | 'history'>('none')
  const [selectedBagian, setSelectedBagian] = useState('')
  const [newComment, setNewComment] = useState('')
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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

  const bagianOptions = [
    'Metadata - Nomor POS',
    'Metadata - Nama POS',
    'Metadata - Dasar Hukum',
    'Metadata - Kualifikasi',
    'Metadata - Seksi',
    'Prosedur - Baris 1',
    'Prosedur - Baris 2',
    'Prosedur - Umum',
  ]

  const handleAddComment = () => {
    if (!selectedBagian || !newComment.trim()) {
      setToastMessage('Bagian dan komentar harus diisi')
      return
    }
    setKomentarList([
      {
        id: String(Date.now()),
        user: 'Dr. Ahmad Fauzi',
        role: 'Kepala OPD',
        timestamp: new Date().toLocaleString('id-ID'),
        bagian: selectedBagian,
        isi: newComment,
        status: 'open',
      },
      ...komentarList,
    ])
    setNewComment('')
    setSelectedBagian('')
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

  const handlePrint = () => {
    window.print()
  }

  const togglePanel = (panel: 'comments' | 'history') => {
    setActivePanel(activePanel === panel ? 'none' : panel)
  }

  return (
    <div className="space-y-3">
      {toastMessage && (
        <div
          className={`rounded-md border px-4 py-2 text-xs print:hidden ${
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
        actions={
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs border-0">
              Versi {versions[0]?.version || '1.0'}
            </Badge>
            <Badge className="bg-green-100 text-green-700 text-xs border-0">Berlaku</Badge>
          </div>
        }
      />

      {id && getActiveCaseForSop(id) && (
        <div className="bg-blue-50 rounded-md border border-blue-200 p-3 print:hidden">
          <h3 className="text-xs font-semibold text-blue-900 mb-2">Evaluasi Aktif</h3>
          {(() => {
            const ec = getActiveCaseForSop(id)!
            const sourceLabel = ec.source_type === 'BIRO_INITIATIVE' ? 'Inisiasi Biro' : 'Request OPD'
            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Case</p>
                    <p className="font-medium text-gray-900">{ec.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Asal pemicu</p>
                    <p className="font-medium text-gray-900">{sourceLabel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium text-gray-900">{ec.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tim Evaluator</p>
                    <p className="font-medium text-gray-900">{ec.timEvaluator ?? '—'}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-800 mt-2">
                  Satu SOP hanya satu evaluasi aktif. Request OPD akan tergabung ke case ini.
                </p>
              </>
            )
          })()}
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-200 p-3 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => navigate({ to: '/kepala-opd/daftar-sop' })}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Kembali
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs gap-1.5 ${
                activePanel === 'comments' ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => togglePanel('comments')}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Komentar ({komentarList.filter((k) => k.status === 'open').length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs gap-1.5 ${
                activePanel === 'history' ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => togglePanel('history')}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handlePrint}>
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <div
          className={`transition-all ${
            activePanel === 'none' ? 'flex-1' : 'flex-[2]'
          } bg-white rounded-lg border border-gray-200 p-4`}
        >
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-8">
              <SOPHeaderInfo {...metadata} editable={false} />

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

              <SOPDiagram
                rows={prosedurRows}
                implementers={implementers}
                diagramType={activeTab}
              />
            </div>
          </ScrollArea>
        </div>

        {activePanel === 'comments' && (
          <div className="flex-1 bg-white rounded-md border border-gray-200 p-4 animate-in slide-in-from-right print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Komentar Internal</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {komentarList.filter((k) => k.status === 'open').length} terbuka •{' '}
                  {komentarList.filter((k) => k.status === 'resolved').length} resolved
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setActivePanel('none')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Label className="text-xs font-medium text-blue-900 mb-1.5 block">
                Tambah Komentar Baru
              </Label>
              <select
                className="w-full h-8 rounded-md border border-blue-300 px-2 text-xs mb-2"
                value={selectedBagian}
                onChange={(e) => setSelectedBagian(e.target.value)}
              >
                <option value="">Pilih bagian dokumen...</option>
                {bagianOptions.map((bagian) => (
                  <option key={bagian} value={bagian}>
                    {bagian}
                  </option>
                ))}
              </select>
              <Textarea
                className="text-xs min-h-[60px] mb-2"
                placeholder="Tulis komentar Anda..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button size="sm" className="h-7 text-xs gap-1 w-full" onClick={handleAddComment}>
                <Send className="w-3 h-3" />
                Kirim Komentar
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-430px)]">
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
                    <Badge className="bg-gray-200 text-gray-700 text-xs border-0 mb-1.5">
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

        {activePanel === 'history' && (
          <div className="flex-1 bg-white rounded-md border border-gray-200 p-4 animate-in slide-in-from-right print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Riwayat Versi</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {versions.length} versi terdokumentasi
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setActivePanel('none')}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
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
                        <p className="text-xs text-gray-500">
                          {new Date(version.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">{version.changes}</p>
                      <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">
                            {version.author.charAt(0)}
                          </span>
                        </div>
                        <p className="text-xs">{version.author}</p>
                      </div>
                      {index > 0 && (
                        <div className="flex gap-1.5 pt-2 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setToastMessage('Lihat versi (read-only) — fitur lengkap di backend')}
                          >
                            Lihat versi
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setToastMessage('Pulihkan sebagai draft baru — salinan versi ini akan dibuat sebagai draft')}
                          >
                            Pulihkan sebagai draft baru
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
