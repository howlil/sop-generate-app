import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchInput } from '@/components/ui/search-input'

interface Penugasan {
  id: string
  kodePenugasan: string
  opd: string
  sop: string
  kodeSOP: string
  jenis: 'Evaluasi Rutin' | 'Evaluasi Khusus' | 'Evaluasi Insidental'
  tanggalPenugasan: string
  status: 'assigned' | 'in-progress' | 'completed'
}

export function PenugasanEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const penugasanList: Penugasan[] = [
    {
      id: '1',
      kodePenugasan: 'TUG-EVL-012/2026',
      opd: 'Dinas Pendidikan',
      sop: 'SOP Penerimaan Siswa Baru 2026',
      kodeSOP: 'SOP/DISDIK/PLY/2026/001',
      jenis: 'Evaluasi Rutin',
      tanggalPenugasan: '2026-01-20',
      status: 'in-progress',
    },
    {
      id: '2',
      kodePenugasan: 'TUG-EVL-013/2026',
      opd: 'Dinas Kesehatan',
      sop: 'SOP Pelayanan Puskesmas 24 Jam',
      kodeSOP: 'SOP/DINKES/PLY/2026/005',
      jenis: 'Evaluasi Khusus',
      tanggalPenugasan: '2026-01-22',
      status: 'in-progress',
    },
    {
      id: '3',
      kodePenugasan: 'TUG-EVL-014/2026',
      opd: 'Dinas Perhubungan',
      sop: 'SOP Pengurusan SIM',
      kodeSOP: 'SOP/DISHUB/ADM/2026/003',
      jenis: 'Evaluasi Rutin',
      tanggalPenugasan: '2026-01-25',
      status: 'assigned',
    },
    {
      id: '4',
      kodePenugasan: 'TUG-EVL-010/2026',
      opd: 'Dinas Pendidikan',
      sop: 'SOP Ujian Akhir Semester',
      kodeSOP: 'SOP/DISDIK/ADM/2025/003',
      jenis: 'Evaluasi Rutin',
      tanggalPenugasan: '2025-12-15',
      status: 'completed',
    },
    {
      id: '5',
      kodePenugasan: 'TUG-EVL-009/2025',
      opd: 'Dinas Sosial',
      sop: 'SOP Bantuan Sosial',
      kodeSOP: 'SOP/DINSOS/PLY/2025/008',
      jenis: 'Evaluasi Insidental',
      tanggalPenugasan: '2025-12-10',
      status: 'completed',
    },
  ]

  const sopContent: Record<string, string> = {
    '1. Tujuan':
      'Memberikan panduan bagi petugas pendaftaran dalam melaksanakan proses penerimaan siswa baru secara tertib, transparan, dan akuntabel.',
    '2. Ruang Lingkup':
      'SOP ini mencakup proses pendaftaran, verifikasi dokumen, seleksi, pengumuman hasil, dan daftar ulang siswa baru untuk jenjang SD, SMP, dan SMA/SMK (termasuk jalur zonasi, prestasi, dan afirmasi).',
    '3. Definisi':
      'PPDB: Penerimaan Peserta Didik Baru\nCPDB: Calon Peserta Didik Baru',
    '4. Prosedur Kerja':
      '1. Calon siswa melakukan pendaftaran online\n2. Petugas memverifikasi kelengkapan dokumen (3 hari kerja)\n3. Proses seleksi berdasarkan zonasi/prestasi\n4. Pengumuman hasil seleksi\n5. Daftar ulang siswa yang diterima',
  }

  const filteredPenugasan = penugasanList.filter((p) => {
    const matchSearch =
      p.sop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.opd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kodePenugasan.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      assigned: 'bg-purple-100 text-purple-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      assigned: 'Ditugaskan',
      'in-progress': 'Dalam Pelaksanaan',
      completed: 'Selesai (Hasil Evaluasi)',
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Penugasan Evaluasi' }]}
        title="Penugasan & Hasil Evaluasi"
        description="Daftar penugasan dan hasil evaluasi SOP (filter menurut status)"
      />
      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            placeholder="Cari penugasan evaluasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="h-8 w-[160px] rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="assigned">Ditugaskan</option>
            <option value="in-progress">Dalam Pelaksanaan</option>
            <option value="completed">Selesai (Hasil)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-900">Daftar Penugasan & Hasil Evaluasi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Kode Penugasan</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">OPD</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">SOP</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPenugasan.map((penugasan) => (
                <tr
                  key={penugasan.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="py-2.5 px-3 font-mono text-gray-900 text-[11px]">
                    {penugasan.kodePenugasan}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">{penugasan.opd}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{penugasan.sop}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={`${getStatusBadge(penugasan.status)} text-xs border-0`}>
                      {getStatusLabel(penugasan.status)}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link to="/tim-evaluasi/penugasan/detail/$id" params={{ id: penugasan.id }}>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" title="Detail">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {penugasan.status !== 'completed' && (
                        <Link
                          to="/tim-evaluasi/pelaksanaan/$id"
                          params={{ id: penugasan.id }}
                        >
                          <Button size="sm" className="h-7 px-2 text-xs gap-1">
                            <Play className="w-3.5 h-3.5" />
                            {penugasan.status === 'assigned' ? 'Mulai' : 'Lanjutkan'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
