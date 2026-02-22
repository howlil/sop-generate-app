import { useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  FileText,
  List,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Building,
  Play,
} from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'

// Mock data: sama dengan daftar di PenugasanEvaluasi, untuk lookup by id
const penugasanById: Record<
  string,
  {
    id: string
    kodePenugasan: string
    opd: string
    sop: string
    kodeSOP: string
    jenis: 'Evaluasi Rutin' | 'Evaluasi Khusus' | 'Evaluasi Insidental'
    tanggalPenugasan: string
    status: 'assigned' | 'in-progress' | 'completed'
  }
> = {
  '1': {
    id: '1',
    kodePenugasan: 'TUG-EVL-012/2026',
    opd: 'Dinas Pendidikan',
    sop: 'SOP Penerimaan Siswa Baru 2026',
    kodeSOP: 'SOP/DISDIK/PLY/2026/001',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2026-01-20',
    status: 'in-progress',
  },
  '2': {
    id: '2',
    kodePenugasan: 'TUG-EVL-013/2026',
    opd: 'Dinas Kesehatan',
    sop: 'SOP Pelayanan Puskesmas 24 Jam',
    kodeSOP: 'SOP/DINKES/PLY/2026/005',
    jenis: 'Evaluasi Khusus',
    tanggalPenugasan: '2026-01-22',
    status: 'in-progress',
  },
  '3': {
    id: '3',
    kodePenugasan: 'TUG-EVL-014/2026',
    opd: 'Dinas Perhubungan',
    sop: 'SOP Pengurusan SIM',
    kodeSOP: 'SOP/DISHUB/ADM/2026/003',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2026-01-25',
    status: 'assigned',
  },
  '4': {
    id: '4',
    kodePenugasan: 'TUG-EVL-010/2026',
    opd: 'Dinas Pendidikan',
    sop: 'SOP Ujian Akhir Semester',
    kodeSOP: 'SOP/DISDIK/ADM/2025/003',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2025-12-15',
    status: 'completed',
  },
  '5': {
    id: '5',
    kodePenugasan: 'TUG-EVL-009/2025',
    opd: 'Dinas Sosial',
    sop: 'SOP Bantuan Sosial',
    kodeSOP: 'SOP/DINSOS/PLY/2025/008',
    jenis: 'Evaluasi Insidental',
    tanggalPenugasan: '2025-12-10',
    status: 'completed',
  },
}

const sopContent: Record<string, string> = {
  '1. Tujuan':
    'Memberikan panduan bagi petugas pendaftaran dalam melaksanakan proses penerimaan siswa baru secara tertib, transparan, dan akuntabel.',
  '2. Ruang Lingkup':
    'SOP ini mencakup proses pendaftaran, verifikasi dokumen, seleksi, pengumuman hasil, dan daftar ulang siswa baru untuk jenjang SD, SMP, dan SMA/SMK (termasuk jalur zonasi, prestasi, dan afirmasi).',
  '3. Definisi': 'PPDB: Penerimaan Peserta Didik Baru\nCPDB: Calon Peserta Didik Baru',
  '4. Prosedur Kerja':
    '1. Calon siswa melakukan pendaftaran online\n2. Petugas memverifikasi kelengkapan dokumen (3 hari kerja)\n3. Proses seleksi berdasarkan zonasi/prestasi\n4. Pengumuman hasil seleksi\n5. Daftar ulang siswa yang diterima',
}

function getStatusBadge(status: string) {
  const badges: Record<string, string> = {
    assigned: 'bg-purple-100 text-purple-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return badges[status] ?? 'bg-gray-100 text-gray-700'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    assigned: 'Ditugaskan',
    'in-progress': 'Dalam Pelaksanaan',
    completed: 'Selesai (Hasil Evaluasi)',
  }
  return labels[status] ?? status
}

export function DetailPenugasanTimEvaluasi() {
  const { id } = useParams({ from: '/tim-evaluasi/penugasan/detail/$id' })
  const navigate = useNavigate()
  const penugasan = id ? penugasanById[id] ?? null : null
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  if (!penugasan) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Penugasan tidak ditemukan.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })}
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0">
      <PageHeader
        breadcrumb={[
          { label: 'Penugasan Evaluasi', to: '/tim-evaluasi/penugasan' },
          { label: 'Detail Penugasan' },
        ]}
        title={penugasan.sop}
        description={`${penugasan.kodeSOP} • ${penugasan.opd}`}
        leading={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: '/tim-evaluasi/penugasan' })}
            title="Kembali ke Penugasan"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        }
      />

      <div className="flex-1 min-h-0 rounded-lg border border-gray-200 overflow-hidden bg-white flex flex-col">
        {/* Bagian atas: informasi penugasan */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi Penugasan</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{penugasan.opd}</span>
            </div>
            <Badge className={`${getStatusBadge(penugasan.status)} text-xs border-0`}>
              {getStatusLabel(penugasan.status)}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mt-2">{penugasan.sop}</p>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{penugasan.kodeSOP}</p>
        </div>

        {/* Tiga panel: Daftar SOP | Preview SOP | Preview info (read-only) */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Kiri: Daftar SOP */}
          <div
            className={`flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
              leftPanelCollapsed ? 'w-12' : 'w-[min(240px,20%)] min-w-[180px]'
            }`}
          >
            {leftPanelCollapsed ? (
              <button
                type="button"
                onClick={() => setLeftPanelCollapsed(false)}
                className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Tampilkan daftar SOP"
              >
                <List className="w-5 h-5" />
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-gray-700 truncate">Daftar SOP</h3>
                    <span className="text-[10px] text-gray-500">1 dokumen</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => setLeftPanelCollapsed(true)}
                    title="Sembunyikan panel"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 min-h-0">
                  <div className="p-2 rounded-md border border-blue-200 bg-blue-50 text-xs">
                    <span className="block font-medium text-gray-900 truncate" title={penugasan.sop}>
                      {penugasan.sop}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                      {penugasan.kodeSOP}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tengah: Preview SOP (template sama dengan Kepala OPD / Tim Penyusun) */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <SOPPreviewTemplate name={penugasan.sop} number={penugasan.kodeSOP} />
            </div>
          </div>

          {/* Kanan: Preview saja (info + instruksi + tombol Mulai/Lanjutkan) */}
          <div
            className={`flex flex-col flex-shrink-0 bg-white transition-[width] duration-200 overflow-hidden ${
              rightPanelCollapsed ? 'w-12' : 'w-[min(380px,33%)] min-w-[280px]'
            }`}
          >
            {rightPanelCollapsed ? (
              <button
                type="button"
                onClick={() => setRightPanelCollapsed(false)}
                className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Tampilkan preview"
              >
                <MessageSquare className="w-5 h-5" />
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                  <h3 className="text-xs font-semibold text-gray-700 truncate">Preview</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => setRightPanelCollapsed(true)}
                    title="Sembunyikan panel"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                    <p className="font-semibold text-blue-900 mb-1">Instruksi Evaluasi:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                      <li>Lakukan review SOP secara menyeluruh dan objektif</li>
                      <li>Dokumentasikan temuan dengan detail dan terstruktur</li>
                      <li>Berikan rekomendasi yang konstruktif dan dapat ditindaklanjuti</li>
                      <li>Tetapkan status Sesuai/Revisi Biro berdasarkan hasil review</li>
                      <li>Submit hasil evaluasi setelah selesai</li>
                    </ul>
                  </div>

                  {penugasan.status !== 'completed' && (
                    <Link to="/tim-evaluasi/pelaksanaan/$id" params={{ id: penugasan.id }}>
                      <Button size="sm" className="w-full h-9 text-xs gap-1.5">
                        <Play className="w-3.5 h-3.5" />
                        {penugasan.status === 'assigned' ? 'Mulai Evaluasi' : 'Lanjutkan Evaluasi'}
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
