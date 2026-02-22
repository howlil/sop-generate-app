import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, UserCheck, UserX, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DialogFooterActions } from '@/components/ui/dialog-footer-actions'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores'
import { StatusBadge } from '@/components/ui/status-badge'

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
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)

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
    showToast('Tim penyusun berhasil ditambahkan')
    setIsCreateOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!selectedTim) return
    setTimList((prev) =>
      prev.map((t) => (t.id === selectedTim.id ? { ...t, ...formData } : t))
    )
    showToast('Data tim penyusun berhasil diperbarui')
    setIsEditOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const handleToggleStatus = (id: string) => {
    setTimList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : t
      )
    )
    showToast('Status tim penyusun berhasil diperbarui')
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

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen Tim Penyusun' }]}
        title="Manajemen Tim Penyusun"
        description="Kelola anggota tim penyusun SOP"
      />

      <SearchToolbar
        searchPlaceholder="Cari nama, NIP, atau jabatan..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      >
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
      </SearchToolbar>

      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama</Table.Th>
              <Table.Th>NIP</Table.Th>
              <Table.Th>Jabatan</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>No. HP</Table.Th>
              <Table.Th>Tgl Bergabung</Table.Th>
              <Table.Th align="center">Total SOP</Table.Th>
              <Table.Th align="center">Status</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.map((tim) => (
              <Table.BodyRow key={tim.id}>
                <Table.Td>
                  <p className="font-medium text-gray-900">{tim.nama}</p>
                </Table.Td>
                <Table.Td className="font-mono text-gray-600 text-[11px]">{tim.nip}</Table.Td>
                <Table.Td className="text-gray-600">{tim.jabatan}</Table.Td>
                <Table.Td className="text-gray-600">{tim.email}</Table.Td>
                <Table.Td className="text-gray-600">{tim.noHP}</Table.Td>
                <Table.Td className="text-gray-600">
                  {new Date(tim.tanggalBergabung).toLocaleDateString('id-ID')}
                </Table.Td>
                <Table.Td className="text-center font-medium text-gray-900">{tim.jumlahSOPDisusun}</Table.Td>
                <Table.Td className="text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(tim.id)}
                    className="inline-flex"
                  >
                    <StatusBadge status={tim.status} domain="tim-penyusun" />
                  </button>
                </Table.Td>
                <Table.Td>
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Tim Penyusun SOP</DialogTitle>
            <DialogDescription className="text-xs">
              Isi data pegawai yang akan ditunjuk sebagai tim penyusun SOP
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pb-0">
            <FormField label="Nama Lengkap" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Ahmad Pratama, S.Sos"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </FormField>
            <FormField label="NIP" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: 199203152020121001"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </FormField>
            <FormField label="Jabatan" required className="col-span-2">
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Kepala Seksi Organisasi"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                className="h-9 text-xs"
                placeholder="Contoh: ahmad@disdik.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>
            <FormField label="No. HP" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: 081234567890"
                value={formData.noHP}
                onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
              />
            </FormField>
            <FormField label="Status" required>
              <Select
                value={formData.status}
                onValueChange={(status) =>
                  setFormData({ ...formData, status: status as 'Aktif' | 'Nonaktif' })
                }
                options={[
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Nonaktif', label: 'Nonaktif' },
                ]}
              />
            </FormField>
          </div>
          <DialogFooterActions
            cancelLabel="Batal"
            confirmLabel="Simpan"
            onCancel={() => setIsCreateOpen(false)}
            onConfirm={handleCreate}
          />
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
          <div className="grid grid-cols-2 gap-3 pb-0">
            <FormField label="Nama Lengkap" required>
              <Input
                className="h-9 text-xs"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </FormField>
            <FormField label="NIP" required>
              <Input
                className="h-9 text-xs"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </FormField>
            <FormField label="Jabatan" required className="col-span-2">
              <Input
                className="h-9 text-xs"
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
            <FormField label="No. HP" required>
              <Input
                className="h-9 text-xs"
                value={formData.noHP}
                onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
              />
            </FormField>
            <FormField label="Status" required>
              <Select
                value={formData.status}
                onValueChange={(status) =>
                  setFormData({ ...formData, status: status as 'Aktif' | 'Nonaktif' })
                }
                options={[
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Nonaktif', label: 'Nonaktif' },
                ]}
              />
            </FormField>
          </div>
          <DialogFooterActions
            cancelLabel="Batal"
            confirmLabel="Simpan Perubahan"
            onCancel={() => setIsEditOpen(false)}
            onConfirm={handleEdit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTimId != null}
        onOpenChange={(open) => !open && setDeleteTimId(null)}
        title="Hapus tim penyusun?"
        description="Apakah Anda yakin ingin menghapus tim penyusun ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => {
          if (deleteTimId) {
            setTimList((prev) => prev.filter((t) => t.id !== deleteTimId))
            showToast('Tim penyusun berhasil dihapus')
            setDeleteTimId(null)
          }
        }}
      />
    </div>
  )
}
