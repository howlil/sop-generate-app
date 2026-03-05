import { useState, useEffect } from 'react'
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
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/hooks/useFilteredList'
import { showToast } from '@/lib/stores'
import { generateId } from '@/utils/generate-id'
import { StatusBadge } from '@/components/ui/status-badge'
import { SEED_TIM_PENYUSUN_LIST } from '@/lib/seed/tim-penyusun-seed'
import { SEED_OPD_LIST } from '@/lib/seed/opd-seed'
import {
  getTimPenyusunList,
  getTimPenyusunByOpdId,
  setTimPenyusunList,
  addTimPenyusun,
  updateTimPenyusun,
  removeTimPenyusun,
  subscribeTimPenyusun,
} from '@/lib/stores/tim-penyusun-store'
import type { TimPenyusun } from '@/lib/types/tim'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { formatDateId } from '@/utils/format-date'
import { ROUTES } from '@/lib/constants/routes'

export function ManajemenTimPenyusun() {
  const opdList = SEED_OPD_LIST
  const [selectedOpdId, setSelectedOpdId] = useState<string>(opdList[0]?.id ?? '')
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

  const [timList, setTimList] = useState<TimPenyusun[]>(() => getTimPenyusunByOpdId(selectedOpdId))

  useEffect(() => {
    if (getTimPenyusunList().length === 0) {
      setTimPenyusunList(SEED_TIM_PENYUSUN_LIST)
    }
    setTimList(getTimPenyusunByOpdId(selectedOpdId))
  }, [selectedOpdId])

  useEffect(() => {
    const unsub = subscribeTimPenyusun(() => setTimList(getTimPenyusunByOpdId(selectedOpdId)))
    return unsub
  }, [selectedOpdId])

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(timList, {
    searchKeys: ['nama', 'nip', 'jabatan'],
  })

  const isFormValid =
    formData.nama.trim() !== '' &&
    formData.nip.trim() !== '' &&
    formData.jabatan.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.noHP.trim() !== ''

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
    addTimPenyusun({
      id: generateId(),
      opdId: selectedOpdId,
      ...formData,
      jumlahSOPDisusun: 0,
      tanggalBergabung: new Date().toISOString().split('T')[0],
    })
    showToast('Tim penyusun berhasil ditambahkan')
    setIsCreateOpen(false)
    resetForm()
    // Jangan setTimList di sini: subscription store akan mengupdate timList setelah dialog tertutup, menghindari error removeChild saat portal unmount.
  }

  const handleEdit = () => {
    if (!selectedTim) return
    updateTimPenyusun(selectedTim.id, formData)
    showToast('Data tim penyusun berhasil diperbarui')
    setIsEditOpen(false)
    resetForm()
    // Jangan setTimList di sini: subscription store akan mengupdate timList setelah dialog tertutup.
  }

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const handleToggleStatus = (id: string) => {
    const tim = timList.find((t) => t.id === id)
    if (tim) {
      updateTimPenyusun(id, { status: tim.status === 'Aktif' ? 'Nonaktif' : 'Aktif' })
      showToast('Status tim penyusun berhasil diperbarui')
      // Subscription store akan mengupdate timList.
    }
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

  const selectedOpd = opdList.find((o) => o.id === selectedOpdId)

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Tim Penyusun', to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN }]}
      title="Manajemen Tim Penyusun"
      description="Kelola anggota tim penyusun SOP per OPD. Satu OPD dapat memiliki banyak tim penyusun."
      toolbar={
        <>
          <FormField label="OPD">
            <Select
              value={selectedOpdId}
              onValueChange={setSelectedOpdId}
              options={opdList.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Pilih OPD"
            />
          </FormField>
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
              Tambah Tim Penyusun {selectedOpd ? `(${selectedOpd.name})` : ''}
            </Button>
          </SearchToolbar>
        </>
      }
    >
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
                <Table.Td className="text-gray-600">{formatDateId(tim.tanggalBergabung)}</Table.Td>
                <Table.Td className="text-center font-medium text-gray-900">{tim.jumlahSOPDisusun}</Table.Td>
                <Table.Td className="text-center">
                  <button type="button" onClick={() => handleToggleStatus(tim.id)} className="inline-flex">
                    <StatusBadge status={tim.status} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
                  </button>
                </Table.Td>
                <Table.Td>
                  <div className="flex items-center justify-center gap-1">
                    <IconActionButton icon={Edit} title="Edit" onClick={() => openEditDialog(tim)} />
                    <IconActionButton icon={Trash2} title="Hapus" destructive onClick={() => handleDelete(tim.id)} />
                  </div>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
      </Table.Card>

      {filteredList.length === 0 && (
        <div className="py-8 text-center text-gray-500 text-sm">
          {selectedOpdId
            ? `Belum ada tim penyusun untuk ${selectedOpd?.name ?? 'OPD ini'}. Klik "Tambah Tim Penyusun" untuk menambah.`
            : 'Pilih OPD terlebih dahulu.'}
        </div>
      )}

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tambah Tim Penyusun SOP"
        description={selectedOpd ? `Isi data pegawai tim penyusun untuk ${selectedOpd.name}` : 'Isi data pegawai'}
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
              onValueChange={(status) => setFormData({ ...formData, status: status as 'Aktif' | 'Nonaktif' })}
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Nonaktif', label: 'Nonaktif' },
              ]}
            />
          </FormField>
        </div>
      </FormDialog>

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
              onValueChange={(status) => setFormData({ ...formData, status: status as 'Aktif' | 'Nonaktif' })}
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
            removeTimPenyusun(deleteTimId)
            showToast('Tim penyusun berhasil dihapus')
            setDeleteTimId(null)
            // Subscription store akan mengupdate timList setelah dialog tertutup.
          }
        }}
      />
    </ListPageLayout>
  )
}
