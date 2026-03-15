import { useState } from 'react'
import { UserCog, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { EmptyState } from '@/components/ui/empty-state'
import type { PelaksanaSOP } from '@/lib/types/sop'
import { usePelaksana } from '@/hooks/usePelaksana'
import { useToast } from '@/hooks/useUI'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
import { generateId } from '@/utils/generate-id'

export function PelaksanaSOP() {
  const { showToast } = useToast()
  const {
    list,
    addPelaksana,
    updatePelaksana,
    removePelaksana,
  } = usePelaksana()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PelaksanaSOP | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    nohp: '',
    deskripsi: '',
  })

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(list, {
    searchKeys: ['namaLengkap', 'nip', 'jabatan', 'email', 'deskripsi'],
  })

  const openEdit = (p: PelaksanaSOP) => {
    setEditing(p)
    setFormData({
      namaLengkap: p.namaLengkap,
      nip: p.nip,
      jabatan: p.jabatan,
      pangkat: p.pangkat,
      email: p.email,
      nohp: p.nohp,
      deskripsi: p.deskripsi,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
      nip: '',
      jabatan: '',
      pangkat: '',
      email: '',
      nohp: '',
      deskripsi: '',
    })
    setEditing(null)
  }

  const handleCreate = () => {
    if (!formData.namaLengkap.trim()) {
      showToast('Nama lengkap wajib diisi', 'error')
      return
    }
    if (!formData.nip.trim()) {
      showToast('NIP wajib diisi', 'error')
      return
    }
    if (!formData.jabatan.trim()) {
      showToast('Jabatan wajib diisi', 'error')
      return
    }
    if (!formData.pangkat.trim()) {
      showToast('Pangkat/golongan wajib diisi', 'error')
      return
    }
    if (!formData.email.trim()) {
      showToast('Email wajib diisi', 'error')
      return
    }
    if (!formData.nohp.trim()) {
      showToast('Nomor HP wajib diisi', 'error')
      return
    }
    addPelaksana({
      id: `impl-${generateId().slice(0, 8)}`,
      namaLengkap: formData.namaLengkap.trim(),
      nip: formData.nip.trim(),
      jabatan: formData.jabatan.trim(),
      pangkat: formData.pangkat.trim(),
      email: formData.email.trim(),
      nohp: formData.nohp.trim(),
      deskripsi: formData.deskripsi.trim(),
      jumlahPos: 0,
    })
    showToast('Pelaksana SOP berhasil ditambahkan')
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEdit = () => {
    if (!editing) return
    if (!formData.namaLengkap.trim()) {
      showToast('Nama lengkap wajib diisi', 'error')
      return
    }
    if (!formData.nip.trim()) {
      showToast('NIP wajib diisi', 'error')
      return
    }
    if (!formData.jabatan.trim()) {
      showToast('Jabatan wajib diisi', 'error')
      return
    }
    if (!formData.pangkat.trim()) {
      showToast('Pangkat/golongan wajib diisi', 'error')
      return
    }
    if (!formData.email.trim()) {
      showToast('Email wajib diisi', 'error')
      return
    }
    if (!formData.nohp.trim()) {
      showToast('Nomor HP wajib diisi', 'error')
      return
    }
    updatePelaksana(editing.id, {
      namaLengkap: formData.namaLengkap.trim(),
      nip: formData.nip.trim(),
      jabatan: formData.jabatan.trim(),
      pangkat: formData.pangkat.trim(),
      email: formData.email.trim(),
      nohp: formData.nohp.trim(),
      deskripsi: formData.deskripsi.trim(),
    })
    showToast('Pelaksana SOP berhasil diperbarui')
    setIsEditDialogOpen(false)
    resetForm()
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    const p = list.find((x) => x.id === deleteId)
    if (p && p.jumlahPos > 0) {
      showToast(`Tidak dapat menghapus. Masih dipakai di ${p.jumlahPos} POS/SOP.`, 'error')
      setDeleteId(null)
      return
    }
    removePelaksana(deleteId)
    showToast('Pelaksana SOP berhasil dihapus')
    setDeleteId(null)
  }

  const pagination = usePagination(filteredList.length)
  const rowsToShow = pagination.showPagination
    ? filteredList.slice(pagination.startIndex, pagination.endIndex)
    : filteredList

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Kelola Pelaksana SOP' }]}
      title="Kelola Pelaksana SOP"
      description="Master data pelaksana/aktor yang dipakai di kolom pelaksana saat menyusun prosedur SOP"
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama lengkap, NIP, atau jabatan..."
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
            Tambah Pelaksana
          </Button>
        </SearchToolbar>
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>Nama Lengkap</Table.Th>
              <Table.Th>NIP</Table.Th>
              <Table.Th>Jabatan</Table.Th>
              <Table.Th>Pangkat/Golongan</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>No. HP</Table.Th>
              <Table.Th align="center">Jumlah POS</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <EmptyState
                asTableRow
                colSpan={8}
                icon={<UserCog className="w-8 h-8" />}
                title="Belum ada pelaksana"
                description="Tambah pelaksana agar bisa dipilih di edit SOP (prosedur)"
              />
            ) : (
              rowsToShow.map((p) => (
                <Table.BodyRow key={p.id}>
                  <Table.Td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-100 rounded-md flex items-center justify-center">
                        <UserCog className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <p className="font-medium text-gray-900">{p.namaLengkap}</p>
                    </div>
                  </Table.Td>
                  <Table.Td className="text-xs text-gray-600">{p.nip || '-'}</Table.Td>
                  <Table.Td className="text-xs text-gray-600">{p.jabatan || '-'}</Table.Td>
                  <Table.Td className="text-xs text-gray-600">{p.pangkat || '-'}</Table.Td>
                  <Table.Td className="text-xs text-gray-600">{p.email || '-'}</Table.Td>
                  <Table.Td className="text-xs text-gray-600">{p.nohp || '-'}</Table.Td>
                  <Table.Td className="text-center text-xs text-gray-500">{p.jumlahPos}</Table.Td>
                  <Table.Td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <IconActionButton icon={Edit} title="Edit" onClick={() => openEdit(p)} />
                      <IconActionButton
                        icon={Trash2}
                        title="Hapus"
                        destructive
                        onClick={() => setDeleteId(p.id)}
                      />
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={filteredList.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="pelaksana"
        />
      </Table.Card>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Pelaksana SOP"
        description="Pelaksana ini akan muncul di dropdown kolom pelaksana saat menyusun prosedur SOP"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreate}
        confirmDisabled={!formData.namaLengkap.trim() || !formData.nip.trim() || !formData.jabatan.trim() || !formData.pangkat.trim() || !formData.email.trim() || !formData.nohp.trim()}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama Lengkap" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Ahmad Fauzi"
              value={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
            />
          </FormField>
          <FormField label="NIP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: 198501152010011001"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
          </FormField>
          <FormField label="Jabatan" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Staf Pelayanan"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
            />
          </FormField>
          <FormField label="Pangkat/Golongan" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Penata Muda Tk. I (III/b)"
              value={formData.pangkat}
              onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
            />
          </FormField>
          <FormField label="Email" required>
            <Input
              className="h-9 text-xs"
              type="email"
              placeholder="Contoh: ahmad.fauzi@example.go.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>
          <FormField label="Nomor HP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: 081234567890"
              value={formData.nohp}
              onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
            />
          </FormField>
          <FormField label="Deskripsi" className="col-span-2">
            <Textarea
              className="text-xs min-h-[72px]"
              placeholder="Deskripsi singkat peran pelaksana"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Pelaksana SOP"
        description="Perbarui data pelaksana"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleEdit}
        confirmDisabled={!formData.namaLengkap.trim() || !formData.nip.trim() || !formData.jabatan.trim() || !formData.pangkat.trim() || !formData.email.trim() || !formData.nohp.trim()}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama Lengkap" required>
            <Input
              className="h-9 text-xs"
              value={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
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
          <FormField label="Pangkat/Golongan" required>
            <Input
              className="h-9 text-xs"
              value={formData.pangkat}
              onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
            />
          </FormField>
          <FormField label="Email" required>
            <Input
              className="h-9 text-xs"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>
          <FormField label="Nomor HP" required>
            <Input
              className="h-9 text-xs"
              value={formData.nohp}
              onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
            />
          </FormField>
          <FormField label="Deskripsi" className="col-span-2">
            <Textarea
              className="text-xs min-h-[72px]"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus pelaksana SOP?"
        description="Pelaksana yang sudah dipakai di prosedur tidak dapat dihapus. Lanjutkan?"
        onConfirm={handleDeleteConfirm}
      />
    </ListPageLayout>
  )
}
