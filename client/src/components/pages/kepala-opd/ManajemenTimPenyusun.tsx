import { useState, useEffect } from 'react'
import { Plus, Eye, Edit, Trash2, UserCheck, UserX, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/layout/PageHeader'

interface TimPenyusun {
  id: string
  nama: string
  nip: string
  jabatan: string
  email: string
  noHP: string
  status: 'Aktif' | 'Nonaktif'
  jumlahSOPDisusun: number
  tanggalBergabung: string
}

export function ManajemenTimPenyusun() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    jabatan: '',
    email: '',
    noHP: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  })

  const [timList, setTimList] = useState<TimPenyusun[]>([
    {
      id: '1',
      nama: 'Ahmad Pratama, S.Sos',
      nip: '199203152020121001',
      jabatan: 'Kepala Seksi Organisasi',
      email: 'ahmad.pratama@disdik.go.id',
      noHP: '081234567890',
      status: 'Aktif',
      jumlahSOPDisusun: 12,
      tanggalBergabung: '2023-01-15',
    },
    {
      id: '2',
      nama: 'Siti Nurhaliza, S.Pd',
      nip: '199105102019032005',
      jabatan: 'Staf Bagian Tata Usaha',
      email: 'siti.nurhaliza@disdik.go.id',
      noHP: '082345678901',
      status: 'Aktif',
      jumlahSOPDisusun: 8,
      tanggalBergabung: '2023-03-20',
    },
    {
      id: '3',
      nama: 'Budi Santoso, S.T',
      nip: '198808252018031002',
      jabatan: 'Kepala Sub Bagian Perencanaan',
      email: 'budi.santoso@disdik.go.id',
      noHP: '083456789012',
      status: 'Aktif',
      jumlahSOPDisusun: 15,
      tanggalBergabung: '2022-06-10',
    },
    {
      id: '4',
      nama: 'Dewi Kusuma, S.E',
      nip: '199012152021022001',
      jabatan: 'Staf Keuangan',
      email: 'dewi.kusuma@disdik.go.id',
      noHP: '084567890123',
      status: 'Nonaktif',
      jumlahSOPDisusun: 5,
      tanggalBergabung: '2021-09-01',
    },
  ])

  const filteredList = timList.filter(
    (tim) =>
      tim.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tim.nip.includes(searchQuery) ||
      tim.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      nama: '',
      nip: '',
      jabatan: '',
      email: '',
      noHP: '',
      status: 'Aktif',
    })
  }

  const handleCreate = () => {
    setTimList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ...formData,
        jumlahSOPDisusun: 0,
        tanggalBergabung: new Date().toISOString().split('T')[0],
      },
    ])
    setToastMessage('Tim penyusun berhasil ditambahkan')
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedTim) return
    setTimList((prev) =>
      prev.map((t) => (t.id === selectedTim.id ? { ...t, ...formData } : t))
    )
    setToastMessage('Data tim penyusun berhasil diperbarui')
    setIsEditOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Apakah Anda yakin ingin menghapus tim penyusun ini?')) return
    setTimList((prev) => prev.filter((t) => t.id !== id))
    setToastMessage('Tim penyusun berhasil dihapus')
  }

  const handleToggleStatus = (id: string) => {
    setTimList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : t
      )
    )
    setToastMessage('Status tim penyusun berhasil diperbarui')
  }

  const openEditDialog = (tim: TimPenyusun) => {
    setFormData({
      nama: tim.nama,
      nip: tim.nip,
      jabatan: tim.jabatan,
      email: tim.email,
      noHP: tim.noHP,
      status: tim.status,
    })
    setSelectedTim(tim)
    setIsEditOpen(true)
  }

  const openDetailDialog = (tim: TimPenyusun) => {
    setSelectedTim(tim)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen Tim Penyusun' }]}
        title="Manajemen Tim Penyusun"
        description="Kelola anggota tim penyusun SOP"
      />
      {toastMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-md">
          {toastMessage}
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="ml-auto">
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              resetForm()
              setIsCreateOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Tim Penyusun
          </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nama</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Jabatan</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((tim) => (
                <tr
                  key={tim.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-gray-900">{tim.nama}</p>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{tim.jabatan}</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge
                      className={`text-xs cursor-pointer border-0 ${
                        tim.status === 'Aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => handleToggleStatus(tim.id)}
                    >
                      {tim.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openDetailDialog(tim)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditDialog(tim)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(tim.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Tim Penyusun SOP</DialogTitle>
            <DialogDescription className="text-xs">
              Isi data pegawai yang akan ditunjuk sebagai tim penyusun SOP
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Ahmad Pratama, S.Sos"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: 199203152020121001"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Jabatan *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Kepala Seksi Organisasi"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                className="h-9 text-xs"
                placeholder="Contoh: ahmad@disdik.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">No. HP *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: 081234567890"
                value={formData.noHP}
                onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
                }
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleCreate}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Tim Penyusun SOP</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui data tim penyusun SOP
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap *</Label>
              <Input
                className="h-9 text-xs"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP *</Label>
              <Input
                className="h-9 text-xs"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Jabatan *</Label>
              <Input
                className="h-9 text-xs"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input
                type="email"
                className="h-9 text-xs"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">No. HP *</Label>
              <Input
                className="h-9 text-xs"
                value={formData.noHP}
                onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
                }
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleEdit}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Detail Tim Penyusun SOP</DialogTitle>
          </DialogHeader>
          {selectedTim && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{selectedTim.nama}</h3>
                    <p className="text-xs text-gray-500 font-mono">{selectedTim.nip}</p>
                  </div>
                  <Badge
                    className={`text-xs border-0 ${
                      selectedTim.status === 'Aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedTim.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Jabatan</p>
                  <p className="text-xs font-medium text-gray-900">{selectedTim.jabatan}</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Tanggal Bergabung</p>
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(selectedTim.tanggalBergabung).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-xs font-medium text-gray-900">{selectedTim.email}</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">No. HP</p>
                  <p className="text-xs font-medium text-gray-900">{selectedTim.noHP}</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-xs text-gray-600 mb-1">Riwayat Penyusunan</p>
                <p className="text-sm font-semibold text-blue-700">{selectedTim.jumlahSOPDisusun} SOP</p>
                <p className="text-xs text-gray-600">Total SOP yang pernah disusun</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
