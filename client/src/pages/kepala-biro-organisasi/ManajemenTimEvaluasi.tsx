import { useState } from 'react'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { Badge } from '@/components/ui/badge'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { EmptyState } from '@/components/ui/empty-state'
import { getInitialTimEvaluasiList } from '@/lib/data/tim-evaluasi'
import type { TimMonev } from '@/lib/types/tim'
import { generateId } from '@/utils/generate-id'
import { useFilteredList } from '@/hooks/useFilteredList'

export function ManajemenTimEvaluasi() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimMonev | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)

  const [timList, setTimList] = useState<TimMonev[]>(() => getInitialTimEvaluasiList())
  const { filteredList: filteredTim, searchQuery, setSearchQuery } = useFilteredList(timList, {
    searchKeys: ['nama', 'nip', 'jabatan', 'email'],
  })

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
  })

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const openEditDialog = (tim: TimMonev) => {
    setSelectedTim(tim)
    setFormData({
      nama: tim.nama,
      nip: tim.nip,
      jabatan: tim.jabatan,
      pangkat: tim.pangkat ?? '',
      email: tim.email,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nama: '',
      nip: '',
      jabatan: '',
      pangkat: '',
      email: '',
    })
  }

  const handleCreateSubmit = () => {
    if (!formData.nama || !formData.nip) return
    setTimList((prev) => [
      ...prev,
      {
        id: generateId(),
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
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Tim Evaluasi' }]}
      title="Manajemen Tim Evaluasi"
      description="Kelola anggota tim monitoring dan evaluasi SOP"
      toolbar={
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
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama</Table.Th>
              <Table.Th>NIP</Table.Th>
              <Table.Th>Jabatan</Table.Th>
              <Table.Th>Pangkat</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredTim.length === 0 ? (
              <EmptyState
                asTableRow
                colSpan={6}
                icon={<Users className="w-8 h-8" />}
                title="Tidak ada anggota tim"
                description="Coba ubah kata kunci atau tambah anggota baru"
              />
            ) : (
              filteredTim.map((tim) => (
              <Table.BodyRow key={tim.id}>
                <Table.Td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">{tim.nama}</p>
                  </div>
                </Table.Td>
                <Table.Td className="text-gray-600 font-mono text-xs">{tim.nip}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" className="text-xs">
                    {tim.jabatan}
                  </Badge>
                </Table.Td>
                <Table.Td className="text-gray-600 text-xs">
                  {tim.pangkat ?? '-'}
                </Table.Td>
                <Table.Td className="text-gray-600 text-xs">{tim.email}</Table.Td>
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
              ))
            )}
          </tbody>
        </Table.Table>
      </Table.Card>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Anggota Tim Evaluasi"
        description="Lengkapi form berikut untuk menambah anggota tim evaluasi"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreateSubmit}
        confirmDisabled={!formData.nama || !formData.nip}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Nama Lengkap" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Dr. Ahmad Pratama, M.Si"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
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
          <FormField label="Jabatan di Instansi" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Analis Kebijakan"
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
              placeholder="email@pemda.go.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Anggota Tim Evaluasi"
        description="Perbarui informasi anggota tim"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleEditSubmit}
        confirmDisabled={!formData.nama || !formData.nip}
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
          <FormField label="Jabatan di Instansi" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Analis Kebijakan"
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

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
    </ListPageLayout>
  )
}
