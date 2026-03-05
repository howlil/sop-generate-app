import { useState } from 'react'
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react'
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
import { showToast } from '@/lib/stores/app-store'
import { generateId } from '@/utils/generate-id'
import { useOpdList } from '@/lib/data/opd'
import {
  useTimPenyusunList,
  addTimPenyusun,
  updateTimPenyusun,
  removeTimPenyusun,
} from '@/lib/data/tim-penyusun'
import type { TimPenyusun } from '@/lib/types/tim'
import { ROUTES } from '@/lib/constants/routes'

export function ManajemenTimPenyusun() {
  const opdList = useOpdList()
  const [createOpdId, setCreateOpdId] = useState<string>(opdList[0]?.id ?? '')
  const [expandedOpdIds, setExpandedOpdIds] = useState<Record<string, boolean>>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    noHP: '',
  })

  const timList = useTimPenyusunList()

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(timList, {
    searchKeys: ['nama', 'nip', 'jabatan'],
  })

  const isFormValid =
    formData.nama.trim() !== '' &&
    formData.nip.trim() !== '' &&
    formData.jabatan.trim() !== '' &&
    formData.pangkat.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.noHP.trim() !== ''

  const resetForm = () => {
    setFormData({
      nama: '',
      nip: '',
      jabatan: '',
      pangkat: '',
      email: '',
      noHP: '',
    })
  }

  const handleCreate = () => {
    if (!createOpdId) return
    addTimPenyusun({
      id: generateId(),
      opdId: createOpdId,
      ...formData,
      status: 'Aktif',
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

  const openEditDialog = (tim: TimPenyusun) => {
    setFormData({
      nama: tim.nama,
      nip: tim.nip,
      jabatan: tim.jabatan,
      pangkat: tim.pangkat ?? '',
      email: tim.email,
      noHP: tim.noHP,
    })
    setSelectedTim(tim)
    setIsEditOpen(true)
  }

  const groupedByOpd = filteredList.reduce<Record<string, TimPenyusun[]>>((acc, tim) => {
    if (!acc[tim.opdId]) acc[tim.opdId] = []
    acc[tim.opdId].push(tim)
    return acc
  }, {})

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Tim Penyusun', to: ROUTES.BIRO_ORGANISASI.TIM_PENYUSUN }]}
      title="Manajemen Tim Penyusun"
      description="Kelola anggota tim penyusun SOP per OPD. Satu OPD dapat memiliki banyak tim penyusun."
      toolbar={
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
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
              <Table.HeadRow>
              <Table.Th>OPD / Tim Penyusun</Table.Th>
                <Table.Th>NIP</Table.Th>
                <Table.Th>Jabatan</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>No. HP</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
          </thead>
          <tbody>
            {Object.entries(groupedByOpd).map(([opdId, tims]) => {
              const opd = opdList.find((o) => o.id === opdId)
              if (!opd) return null
              const isExpanded = expandedOpdIds[opdId] ?? false
              return (
                <>
                  <Table.BodyRow
                    key={`opd-${opdId}`}
                    className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setExpandedOpdIds((prev) => ({ ...prev, [opdId]: !isExpanded }))
                    }
                  >
                    <Table.Td colSpan={6}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedOpdIds((prev) => ({ ...prev, [opdId]: !isExpanded }))
                            }}
                            aria-label={isExpanded ? 'Tutup daftar tim' : 'Lihat daftar tim'}
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                          <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-semibold text-blue-700">
                              {opd.name.split(' ')[0][0]}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                            {opd.name}
                          </p>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {tims.length} tim penyusun
                        </span>
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                  {isExpanded &&
                    tims.map((tim) => (
                      <Table.BodyRow key={tim.id}>
                        <Table.Td>
                          <p className="font-medium text-gray-900">{tim.nama}</p>
                        </Table.Td>
                        <Table.Td className="font-mono text-gray-600 text-[11px]">
                          {tim.nip}
                        </Table.Td>
                        <Table.Td className="text-gray-600">{tim.jabatan}</Table.Td>
                        <Table.Td className="text-gray-600">{tim.email}</Table.Td>
                        <Table.Td className="text-gray-600">{tim.noHP}</Table.Td>
                        <Table.Td>
                          <div className="flex items-center justify-center gap-1">
                            <IconActionButton
                              icon={Edit}
                              title="Edit"
                              onClick={() => openEditDialog(tim)}
                            />
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
                </>
              )
            })}
          </tbody>
        </Table.Table>
      </Table.Card>

      {filteredList.length === 0 && (
        <div className="py-8 text-center text-gray-500 text-sm">
          Belum ada tim penyusun. Klik &quot;Tambah Tim Penyusun&quot; untuk menambah.
        </div>
      )}

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Tambah Tim Penyusun SOP"
        description="Pilih OPD dan isi data pegawai tim penyusun"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreate}
        confirmDisabled={!isFormValid}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="OPD" required>
            <Select
              value={createOpdId}
              onValueChange={setCreateOpdId}
              options={opdList.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Pilih OPD"
            />
          </FormField>
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
          <FormField label="Jabatan" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Kepala Seksi Organisasi"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
            />
          </FormField>
          <FormField label="Pangkat / Golongan" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: IV/a"
              value={formData.pangkat}
              onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
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
        <div className="space-y-3">
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
          <FormField label="Jabatan" required>
            <Input
              className="h-9 text-xs"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
            />
          </FormField>
          <FormField label="Pangkat / Golongan" required>
            <Input
              className="h-9 text-xs"
              value={formData.pangkat}
              onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
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
