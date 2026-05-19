import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
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
import { useEvaluatorAnggota } from '@/api/evaluator-anggota'
import type { EvaluatorAnggota, StatusTim } from '@/types/dto/tim.dto'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'
import { hasRequiredStringFields } from '@/lib/forms/validation'

const REQUIRED_EVALUATOR_FIELDS = [
  'namaLengkap',
  'nip',
  'jabatan',
  'pangkat',
  'email',
  'nohp',
] as const

export function ManajemenEvaluator() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const evaluatorSearch =
    debouncedSearch.trim() !== '' ? debouncedSearch.trim() : undefined
  const {
    list: evaluatorList,
    hapus,
    tambah,
    update,
    isAdding,
    isUpdating,
    isDeleting,
  } = useEvaluatorAnggota(evaluatorSearch)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAnggotaId, setEditingAnggotaId] = useState<string | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    namaLengkap: string
    nip: string
    jabatan: string
    pangkat: string
    email: string
    nohp: string
    status: StatusTim
  }>({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    nohp: '',
    status: 'AKTIF',
  })
  const isFormValid = hasRequiredStringFields(formData, REQUIRED_EVALUATOR_FIELDS)

  const openEditDialog = (tim: EvaluatorAnggota) => {
    const u = tim.user
    setEditingAnggotaId(tim.id)
    setFormData({
      namaLengkap: u?.nama ?? '',
      nip: u?.nip ?? '',
      jabatan: u?.jabatan ?? '',
      pangkat: u?.pangkat ?? '',
      email: u?.email ?? '',
      nohp: u?.nohp ?? '',
      status: tim.status,
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
      status: 'AKTIF',
    })
  }

  const handleHapus = async () => {
    if (!deleteTimId) return
    try {
      await hapus(deleteTimId)
      setDeleteTimId(null)
    } catch {
      /* Pesan error dari useMutationWithToast */
    }
  }

  const handleCreateSubmit = async () => {
    if (!isFormValid) return
    try {
      await tambah({
        email: formData.email.trim(),
        nama: formData.namaLengkap.trim(),
        nip: formData.nip.trim(),
        jabatan: formData.jabatan.trim(),
        pangkat: formData.pangkat.trim(),
        nohp: formData.nohp.trim(),
      })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch {
      /* Pesan error dari useMutationWithToast */
    }
  }

  const handleEditSubmit = async () => {
    if (!editingAnggotaId) return
    if (!isFormValid) return
    try {
      await update({
        id: editingAnggotaId,
        payload: {
          nama: formData.namaLengkap.trim(),
          nip: formData.nip.trim(),
          jabatan: formData.jabatan.trim(),
          pangkat: formData.pangkat.trim(),
          email: formData.email.trim(),
          nohp: formData.nohp.trim(),
          status: formData.status,
        },
      })
      setIsEditDialogOpen(false)
      setEditingAnggotaId(null)
    } catch {
      /* Pesan error dari useMutationWithToast */
    }
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Evaluator' }]}
      title="Manajemen Evaluator"
      description="Kelola pengguna peran Evaluator pada OPD PJ Evaluator Organisasi (akses PJ Evaluator)."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama, NIP, atau email..."
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
      <Table.Paginated data={evaluatorList} label="anggota">
        {(pageData) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Nama Lengkap</Table.Th>
                <Table.Th>NIP</Table.Th>
                <Table.Th>Jabatan</Table.Th>
                <Table.Th>Pangkat</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>No. HP</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={8}
                  icon={<Users className="w-8 h-8" />}
                  title="Tidak ada Evaluator"
                  description="Coba ubah kata kunci atau tambah pengguna peran Evaluator"
                />
              ) : (
                pageData.map((tim) => (
                  <Table.BodyRow key={tim.id}>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="font-medium text-gray-900">{tim.user?.nama ?? '—'}</p>
                      </div>
                    </Table.Td>
                    <Table.Td className="text-gray-600 font-mono text-xs">{tim.user?.nip ?? '—'}</Table.Td>
                    <Table.Td>
                      <Badge variant="outline" className="text-xs">
                        {tim.user?.jabatan ?? '—'}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="text-gray-600 text-xs">
                      {tim.user?.pangkat ?? '—'}
                    </Table.Td>
                    <Table.Td className="text-gray-600 text-xs">{tim.user?.email ?? '—'}</Table.Td>
                    <Table.Td className="text-gray-600 text-xs">
                      {tim.user?.nohp ?? '—'}
                    </Table.Td>
                    <Table.Td>
                      <div className="flex flex-col gap-0.5">
                        <StatusBadge status={tim.status} />
                        {tim.berakhirPada && (
                          <span className="text-[10px] text-gray-500">
                            Selesai: {formatDateId(tim.berakhirPada)}
                          </span>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        <IconActionButton icon={Edit} title="Edit" onClick={() => openEditDialog(tim)} />
                        {tim.status === 'AKTIF' && (
                          <IconActionButton
                            icon={Trash2}
                            title="Nonaktifkan"
                            destructive
                            onClick={() => setDeleteTimId(tim.id)}
                          />
                        )}
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Evaluator"
        description="Akun pengguna peran Evaluator pada OPD PJ Evaluator Organisasi. Kata sandi awal ditetapkan server; bagikan kredensial dengan aman."
        confirmLabel={isAdding ? 'Menyimpan...' : 'Simpan'}
        cancelLabel="Batal"
        onConfirm={handleCreateSubmit}
        confirmDisabled={!isFormValid || isAdding}
        size="md"
      >
        <div className="space-y-3">
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
          <FormField label="No. HP" required>
            <Input
              className="h-9 text-xs"
              value={formData.nohp}
              onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingAnggotaId(null)
        }}
        title="Edit data Evaluator"
        description="Perbarui data pengguna peran Evaluator"
        confirmLabel={isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
        cancelLabel="Batal"
        onConfirm={handleEditSubmit}
        confirmDisabled={!isFormValid || isUpdating}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Status akun" required>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                setFormData({ ...formData, status: v as StatusTim })
              }
              options={[
                { value: 'AKTIF', label: 'Aktif' },
                { value: 'NONAKTIF', label: 'Nonaktif' },
              ]}
              placeholder="Pilih status"
            />
          </FormField>
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
          <FormField label="No. HP" required>
            <Input
              className="h-9 text-xs"
              value={formData.nohp}
              onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={deleteTimId != null}
        onOpenChange={(open) => !open && setDeleteTimId(null)}
        title="Nonaktifkan Evaluator?"
        description="Akses Evaluator akan dicabut (soft delete). Data riwayat evaluasi tetap terikat pada akun jika diperlukan oleh sistem."
        onConfirm={handleHapus}
        confirmLabel={isDeleting ? 'Memproses...' : 'Nonaktifkan'}
      />
    </ListPageLayout>
  )
}
