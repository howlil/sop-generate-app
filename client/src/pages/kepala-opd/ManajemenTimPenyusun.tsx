import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores'
import { generateId } from '@/utils/generate-id'
import { StatusBadge } from '@/components/ui/status-badge'
import { SEED_TIM_PENYUSUN_LIST } from '@/lib/seed/tim-penyusun-seed'
import type { TimPenyusun } from '@/lib/types/tim'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { formatDateId } from '@/utils/format-date'

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

  const [timList, setTimList] = useState<TimPenyusun[]>(SEED_TIM_PENYUSUN_LIST)

  const filteredList = timList.filter(
    (tim) =>
      tim.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tim.nip.includes(searchQuery) ||
      tim.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isFormValid = formData.nama.trim() !== '' && formData.nip.trim() !== '' && formData.jabatan.trim() !== '' && formData.email.trim() !== '' && formData.noHP.trim() !== ''

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
        id: generateId(),
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
                  {formatDateId(tim.tanggalBergabung)}
                </Table.Td>
                <Table.Td className="text-center font-medium text-gray-900">{tim.jumlahSOPDisusun}</Table.Td>
                <Table.Td className="text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(tim.id)}
                    className="inline-flex"
                  >
                    <StatusBadge status={tim.status} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
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
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tambah Tim Penyusun SOP"
        description="Isi data pegawai yang akan ditunjuk sebagai tim penyusun SOP"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreate}
        confirmDisabled={!isFormValid}
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
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
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Tim Penyusun SOP"
        description="Perbarui data tim penyusun SOP"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleEdit}
        confirmDisabled={!isFormValid}
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
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
      </FormDialog>

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
