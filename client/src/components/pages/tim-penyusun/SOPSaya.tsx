import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FileText, Eye, Edit, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { PageHeader } from '@/components/layout/PageHeader'

/** Sesuai field di DetailSOPPenyusun (metadata: name, number, version, revisionDate). */
interface SOP {
  id: string
  nomorSOP: string
  judul: string
  versi: string
  status: 'draft' | 'submitted' | 'revision-needed' | 'approved' | 'completed'
  terakhirDiubah: string
  komentarCount: number
}

export function SOPSaya() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const sopList: SOP[] = [
    {
      id: '1',
      nomorSOP: 'PRJ-DISDIK-001/2026',
      judul: 'SOP Penerimaan Siswa Baru 2026',
      versi: '0.9',
      status: 'revision-needed',
      terakhirDiubah: '2026-01-28',
      komentarCount: 3,
    },
    {
      id: '2',
      nomorSOP: 'PRJ-DISDIK-002/2026',
      judul: 'SOP Pelayanan Perpustakaan Digital',
      versi: '0.5',
      status: 'draft',
      terakhirDiubah: '2026-01-27',
      komentarCount: 0,
    },
    {
      id: '3',
      nomorSOP: 'PRJ-DISDIK-003/2025',
      judul: 'SOP Ujian Akhir Semester',
      versi: '1.0',
      status: 'submitted',
      terakhirDiubah: '2026-01-20',
      komentarCount: 0,
    },
    {
      id: '4',
      nomorSOP: 'PRJ-DISDIK-004/2025',
      judul: 'SOP Penilaian Kinerja Guru',
      versi: '1.5',
      status: 'approved',
      terakhirDiubah: '2025-12-15',
      komentarCount: 0,
    },
    {
      id: '5',
      nomorSOP: 'PRJ-DISDIK-005/2025',
      judul: 'SOP Pengadaan Buku Pelajaran',
      versi: '2.0',
      status: 'completed',
      terakhirDiubah: '2025-11-10',
      komentarCount: 0,
    },
  ]

  const filteredSOP = sopList.filter((sop) => {
    const matchSearch =
      sop.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.nomorSOP.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || sop.status === filterStatus
    return matchSearch && matchStatus
  })

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-purple-100 text-purple-700',
      'revision-needed': 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      submitted: 'Submitted',
      'revision-needed': 'Perlu Revisi',
      approved: 'Disetujui',
      completed: 'Selesai',
    }
    return labels[status] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-3.5 h-3.5" />
      case 'submitted':
        return <Send className="w-3.5 h-3.5" />
      case 'revision-needed':
        return <AlertCircle className="w-3.5 h-3.5" />
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'SOP Saya' }]}
        title="SOP Saya"
        description="Daftar SOP yang Anda susun"
      />
      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            placeholder="Cari SOP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="h-8 w-[160px] rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="revision-needed">Perlu Revisi</option>
            <option value="approved">Disetujui</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-900">Daftar SOP Saya</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Judul</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nomor SOP</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Terakhir diubah</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSOP.map((sop) => (
                <tr key={sop.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{sop.judul}</span>
                      {sop.komentarCount > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs border-0">
                          {sop.komentarCount} Komentar
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-700 text-[11px]">{sop.nomorSOP}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">
                    {new Date(sop.terakhirDiubah).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge className={`${getStatusBadge(sop.status)} text-xs gap-1 border-0`}>
                      {getStatusIcon(sop.status)}
                      {getStatusLabel(sop.status)}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(sop.status === 'draft' || sop.status === 'revision-needed') && (
                        <Link to="/tim-penyusun/detail-sop/$id" params={{ id: sop.id }}>
                          <Button size="sm" className="h-7 px-2 text-xs gap-1">
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      {sop.status !== 'draft' && sop.status !== 'revision-needed' && (
                        <Link to="/tim-penyusun/detail-sop/$id" params={{ id: sop.id }}>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                            <Eye className="w-3.5 h-3.5" />
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
