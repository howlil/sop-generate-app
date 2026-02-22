import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/status-badge'
import { STATUS_SOP_ALL, type StatusSOP } from '@/lib/sop-status'
import { mergeSopStatus, subscribeSopStatus } from '@/lib/sop-status-store'

/** Daftar SOP yang ditugaskan ke tim penyusun; status SOP = single source of truth (sama dengan Kepala OPD). */
interface SOP {
  id: string
  nomorSOP: string
  judul: string
  versi: string
  status: StatusSOP
  terakhirDiubah: string
  komentarCount: number
}

const initialSopList: SOP[] = [
    {
      id: '1',
      nomorSOP: 'PRJ-DISDIK-001/2026',
      judul: 'SOP Penerimaan Siswa Baru 2026',
      versi: '0.9',
      status: 'Revisi dari Tim Evaluasi',
      terakhirDiubah: '2026-01-28',
      komentarCount: 3,
    },
    {
      id: '2',
      nomorSOP: 'PRJ-DISDIK-002/2026',
      judul: 'SOP Pelayanan Perpustakaan Digital',
      versi: '0.5',
      status: 'Sedang Disusun',
      terakhirDiubah: '2026-01-27',
      komentarCount: 0,
    },
    {
      id: '3',
      nomorSOP: 'PRJ-DISDIK-003/2025',
      judul: 'SOP Ujian Akhir Semester',
      versi: '1.0',
      status: 'Diperiksa Kepala OPD',
      terakhirDiubah: '2026-01-20',
      komentarCount: 0,
    },
    {
      id: '4',
      nomorSOP: 'PRJ-DISDIK-004/2025',
      judul: 'SOP Penilaian Kinerja Guru',
      versi: '1.5',
      status: 'Revisi dari Kepala OPD',
      terakhirDiubah: '2025-12-15',
      komentarCount: 0,
    },
    {
      id: '5',
      nomorSOP: 'PRJ-DISDIK-005/2025',
      judul: 'SOP Pengadaan Buku Pelajaran',
      versi: '2.0',
      status: 'Berlaku',
      terakhirDiubah: '2025-11-10',
      komentarCount: 0,
    },
  ]

export function SOPSaya() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sopList, setSopList] = useState<SOP[]>(initialSopList)

  useEffect(() => {
    const unsub = subscribeSopStatus(() => setSopList((prev) => [...prev]))
    return unsub
  }, [])

  const mergedList = mergeSopStatus(sopList)

  const filteredSOP = mergedList.filter((sop) => {
    const matchSearch =
      sop.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sop.nomorSOP.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || sop.status === filterStatus
    return matchSearch && matchStatus
  })

  /** Boleh edit isi SOP: Draft, Sedang Disusun, Revisi dari Kepala OPD, Revisi dari Tim Evaluasi. */
  const canEditSop = (status: StatusSOP) =>
    status === 'Draft' ||
    status === 'Sedang Disusun' ||
    status === 'Revisi dari Kepala OPD' ||
    status === 'Revisi dari Tim Evaluasi'

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
            className="h-8 w-[180px] rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            {STATUS_SOP_ALL.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
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
                    <StatusBadge status={sop.status} domain="sop" className="text-xs" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canEditSop(sop.status) && (
                        <Link to="/tim-penyusun/detail-sop/$id" params={{ id: sop.id }}>
                          <Button size="icon-sm" className="h-7 w-7 p-0" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                      {!canEditSop(sop.status) && (
                        <Link to="/tim-penyusun/detail-sop/$id" params={{ id: sop.id }}>
                          <Button variant="outline" size="icon-sm" className="h-7 w-7 p-0" title="Lihat">
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
