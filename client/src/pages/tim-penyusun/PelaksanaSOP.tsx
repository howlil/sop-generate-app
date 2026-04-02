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
import type { PelaksanaSOP } from '@/hooks/usePelaksana'
import { usePelaksana } from '@/hooks/usePelaksana'
import { useToast } from '@/hooks/useUI'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'

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
  })

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(list, {
    searchKeys: ['namaLengkap'],
  })

  const openEdit = (p: PelaksanaSOP) => {
    setEditing(p)
    setFormData({
      namaLengkap: p.namaLengkap,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
    })
    setEditing(null)
  }

  const handleCreate = () => {
    if (!formData.namaLengkap.trim()) {
      showToast('Nama lengkap wajib diisi', 'error')
      return
    }
    addPelaksana({
      namaLengkap: formData.namaLengkap.trim(),
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
    updatePelaksana(editing.id, formData.namaLengkap.trim())
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
              <Table.Th align="center">Jumlah POS</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <EmptyState
                asTableRow
                colSpan={3}
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
                  <Table.Td className="text-center text-xs text-gray-500">{p.jumlahPos ?? 0}</Table.Td>
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
        confirmDisabled={!formData.namaLengkap.trim()}
        size="lg"
      >
        <FormField label="Nama Lengkap" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Ahmad Fauzi"
            value={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
          />
        </FormField>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Pelaksana SOP"
        description="Perbarui data pelaksana"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleEdit}
        confirmDisabled={!formData.namaLengkap.trim()}
        size="lg"
      >
        <FormField label="Nama Lengkap" required>
          <Input
            className="h-9 text-xs"
            value={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
          />
        </FormField>
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
