import { useState } from 'react'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { SEED_TIM_MONEV_LIST, type TimMonev } from '@/lib/seed/tim-evaluasi-seed'

export function ManajemenTimEvaluasi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimMonev | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)

  const [timList, setTimList] = useState<TimMonev[]>(() => [...SEED_TIM_MONEV_LIST])

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    jabatan: '',
    email: '',
  })

  const filteredTim = timList.filter(
    (tim) =>
      tim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tim.nip.includes(searchQuery) ||
      tim.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tim.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const openEditDialog = (tim: TimMonev) => {
    setSelectedTim(tim)
    setFormData({
      name: tim.name,
      nip: tim.nip,
      jabatan: tim.jabatan,
      email: tim.email,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nip: '',
      jabatan: '',
      email: '',
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
      <SearchToolbar
        searchPlaceholder="Cari nama, NIP, jabatan, atau email..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      >
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
      </SearchToolbar>

      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama</Table.Th>
              <Table.Th>NIP</Table.Th>
              <Table.Th>Jabatan</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th align="center">Jumlah Evaluasi</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredTim.map((tim) => (
              <Table.BodyRow key={tim.id}>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">{tim.name}</p>
                  </div>
                </Table.Td>
                <Table.Td className="text-gray-600 font-mono text-xs">{tim.nip}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" className="text-xs">
                    {tim.jabatan}
                  </Badge>
                </Table.Td>
                <Table.Td className="text-gray-600 text-xs">{tim.email}</Table.Td>
                <Table.Td className="text-center">
                  <span className="font-semibold text-gray-900">{tim.jumlahEvaluasi}</span>
                </Table.Td>
                <Table.Td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IconActionButton icon={Edit} title="Edit" onClick={() => openEditDialog(tim)} />
                    <IconActionButton
                      icon={Trash2}
                      title="Hapus"
                      destructive
                      onClick={() => handleDelete(tim.id)}
                    />
                  </div>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
      </Table.Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Anggota Tim Monev</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi form berikut untuk menambah anggota tim monitoring dan evaluasi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Nama Lengkap" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Dr. Ahmad Pratama, M.Si"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormField>
            <FormField label="NIP" required>
              <Input
                className="h-9 text-xs"
                placeholder="197503152000032001"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </FormField>
            <FormField label="Golongan / Jabatan di Instansi" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: IV/a, Analis Kebijakan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                className="h-9 text-xs"
                placeholder="email@pemda.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>
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
            <FormField label="Nama Lengkap" required>
              <Input
                className="h-9 text-xs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormField>
            <FormField label="NIP" required>
              <Input
                className="h-9 text-xs"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </FormField>
            <FormField label="Golongan / Jabatan di Instansi" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: IV/a, Analis Kebijakan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                className="h-9 text-xs"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>
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

      <ConfirmDialog
        open={deleteTimId != null}
        onOpenChange={(open) => !open && setDeleteTimId(null)}
        title="Hapus anggota tim?"
        description="Apakah Anda yakin ingin menghapus anggota tim ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => {
          if (deleteTimId) {
            setTimList((prev) => prev.filter((tim) => tim.id !== deleteTimId))
            setDeleteTimId(null)
          }
        }}
      />
    </div>
  )
}
