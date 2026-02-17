import { useState } from 'react'
import { Users, Plus, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'

interface TimMonev {
  id: string
  name: string
  nip: string
  jabatan: string
  email: string
  phone: string
  jumlahEvaluasi: number
}

export function ManajemenTimEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimMonev | null>(null)

  const [timList, setTimList] = useState<TimMonev[]>([
    {
      id: '1',
      name: 'Dra. Siti Aminah, M.Si',
      nip: '197503152000032001',
      jabatan: 'IV/a - Pembina',
      email: 'siti.aminah@pemda.go.id',
      phone: '0812-1111-2222',
      jumlahEvaluasi: 45,
    },
    {
      id: '2',
      name: 'Dr. Bambang Suryanto',
      nip: '198201102005011002',
      jabatan: 'III/b - Penata Muda Tk.I',
      email: 'bambang.s@pemda.go.id',
      phone: '0813-3333-4444',
      jumlahEvaluasi: 38,
    },
    {
      id: '3',
      name: 'Ir. Dewi Kusumawati, MT',
      nip: '198805252010012003',
      jabatan: 'IV/b - Pembina Tk.I',
      email: 'dewi.k@pemda.go.id',
      phone: '0814-5555-6666',
      jumlahEvaluasi: 32,
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    jabatan: '',
    email: '',
    phone: '',
  })

  const filteredTim = timList.filter(
    (tim) =>
      tim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tim.nip.includes(searchQuery) ||
      tim.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota tim ini?')) {
      setTimList(timList.filter((tim) => tim.id !== id))
    }
  }

  const openEditDialog = (tim: TimMonev) => {
    setSelectedTim(tim)
    setFormData({
      name: tim.name,
      nip: tim.nip,
      jabatan: tim.jabatan,
      email: tim.email,
      phone: tim.phone,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nip: '',
      jabatan: '',
      email: '',
      phone: '',
    })
  }

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.nip) return
    setTimList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        ...formData,
        jumlahEvaluasi: 0,
      },
    ])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditSubmit = () => {
    if (!selectedTim) return
    setTimList((prev) =>
      prev.map((tim) =>
        tim.id === selectedTim.id ? { ...tim, ...formData } : tim
      )
    )
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen Tim Evaluasi' }]}
        title="Manajemen Tim Evaluasi"
        description="Kelola anggota tim monitoring dan evaluasi SOP"
      />
      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            placeholder="Cari nama, NIP, atau golongan/jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="ml-auto">
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                resetForm()
                setIsCreateDialogOpen(true)
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Anggota
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
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Jumlah Evaluasi</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTim.map((tim) => (
                <tr
                  key={tim.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">{tim.name}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="outline" className="text-xs">
                      {tim.jabatan}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-semibold text-gray-900">{tim.jumlahEvaluasi}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => openEditDialog(tim)}>
                          <Edit className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(tim.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Anggota Tim Monev</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi form berikut untuk menambah anggota tim monitoring dan evaluasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Dr. Ahmad Pratama, M.Si"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP</Label>
              <Input
                className="h-9 text-xs"
                placeholder="197503152000032001"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Golongan / Jabatan di Instansi</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: IV/a, Analis Kebijakan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                className="h-9 text-xs"
                placeholder="email@pemda.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nomor Telepon</Label>
              <Input
                className="h-9 text-xs"
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleCreateSubmit}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Anggota Tim Monev</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui informasi anggota tim
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Lengkap</Label>
              <Input
                className="h-9 text-xs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP</Label>
              <Input
                className="h-9 text-xs"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Golongan / Jabatan di Instansi</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: IV/a, Analis Kebijakan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                className="h-9 text-xs"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nomor Telepon</Label>
              <Input
                className="h-9 text-xs"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleEditSubmit}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
