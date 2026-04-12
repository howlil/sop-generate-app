import { useMemo, useState } from 'react'
import { Users, Plus, Edit, Trash2, UserMinus } from 'lucide-react'
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
import { useTimEvaluasi } from '@/features/tim'
import { usersApi } from '@/features/auth/services/users.api'
import type { AnggotaTimEvaluasi } from '@/features/tim'
import type { TimEvaluasiAnggotaUI } from '@/features/tim/types/tim'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'
import { useToast } from "@/utils/toast"

export function ManajemenTimEvaluasi() {
  const { showToast } = useToast()
  const { list: timList, nonaktifkan, tambah } = useTimEvaluasi()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimEvaluasiAnggotaUI | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)
  const [nonaktifTimId, setNonaktifTimId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTim = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return timList
    return timList.filter((item) => {
      const u = item.user
      return [u?.nama ?? '', u?.nip ?? '', u?.jabatan ?? '', u?.email ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [timList, searchQuery])

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    nohp: '',
  })

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const openEditDialog = (tim: AnggotaTimEvaluasi) => {
    const u = tim.user
    setSelectedTim({
      id: tim.id,
      namaLengkap: u?.nama ?? '',
      nip: u?.nip ?? '',
      jabatan: u?.jabatan ?? '',
      pangkat: u?.pangkat ?? '',
      email: u?.email ?? '',
      nohp: u?.nohp ?? '',
      status: tim.status,
      endedAt: tim.berakhirPada,
    })
    setFormData({
      namaLengkap: u?.nama ?? '',
      nip: u?.nip ?? '',
      jabatan: u?.jabatan ?? '',
      pangkat: u?.pangkat ?? '',
      email: u?.email ?? '',
      nohp: u?.nohp ?? '',
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
    })
  }

  const handleNonaktifkan = async () => {
    if (!nonaktifTimId) return
    await nonaktifkan(nonaktifTimId)
    setNonaktifTimId(null)
  }

  const handleCreateSubmit = async () => {
    if (!formData.namaLengkap || !formData.nip || !formData.email) return
    try {
      // Step 1: Create user with TIM_EVALUASI role
      const user = await usersApi.create({
        nama: formData.namaLengkap,
        nip: formData.nip,
        jabatan: formData.jabatan,
        pangkat: formData.pangkat,
        email: formData.email,
        nohp: formData.nohp,
        peran: 'TIM_EVALUASI',
      })
      // Step 2: Add user to tim evaluasi
      await tambah({ userId: user.id })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan anggota'
      showToast(message, 'error')
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedTim) return
    try {
      // Update the user record
      const userId = timList.find(t => t.id === selectedTim.id)?.userId
      if (!userId) {
        showToast('User ID tidak ditemukan', 'error')
        return
      }
      await usersApi.update(userId, {
        nama: formData.namaLengkap,
        nip: formData.nip,
        jabatan: formData.jabatan,
        pangkat: formData.pangkat,
        nohp: formData.nohp,
      })
      setIsEditDialogOpen(false)
      showToast('Data anggota berhasil diperbarui', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui anggota'
      showToast(message, 'error')
    }
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
      <Table.Paginated data={filteredTim} label="anggota">
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
                  title="Tidak ada anggota tim"
                  description="Coba ubah kata kunci atau tambah anggota baru"
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
                        {(tim.status === 'AKTIF') && (
                          <IconActionButton
                            icon={UserMinus}
                            title="Nonaktifkan"
                            onClick={() => setNonaktifTimId(tim.id)}
                          />
                        )}
                        <IconActionButton
                          icon={UserMinus}
                          title="Nonaktifkan"
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
        )}
      </Table.Paginated>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Anggota Tim Evaluasi"
        description="Lengkapi form berikut untuk menambah anggota tim evaluasi"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreateSubmit}
        confirmDisabled={!formData.namaLengkap || !formData.nip}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Nama Lengkap" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: Dr. Ahmad Pratama, M.Si"
              value={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
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
          <FormField label="No. HP" required>
            <Input
              className="h-9 text-xs"
              placeholder="0812..."
              value={formData.nohp}
              onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
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
        confirmDisabled={!formData.namaLengkap || !formData.nip}
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

      <ConfirmDialog
        open={deleteTimId != null}
        onOpenChange={(open) => !open && setDeleteTimId(null)}
        title="Nonaktifkan anggota tim?"
        description="Tugas anggota ini akan diakhiri. Data evaluasi/arsip yang pernah mereka kerjakan tetap tersimpan per terjadwal verifikasi. Gunakan Nonaktifkan jika hanya mengakhiri tugas."
        onConfirm={async () => {
          if (deleteTimId) {
            try {
              // Use nonaktifkan instead of hard delete to preserve audit trail
              await nonaktifkan(deleteTimId)
              showToast('Anggota tim berhasil dinonaktifkan', 'success')
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Gagal menonaktifkan anggota tim'
              showToast(message, 'error')
            }
            setDeleteTimId(null)
          }
        }}
      />

      <ConfirmDialog
        open={nonaktifTimId != null}
        onOpenChange={(open) => !open && setNonaktifTimId(null)}
        title="Nonaktifkan anggota tim evaluasi?"
        description="Tugas anggota ini akan diakhiri. Data evaluasi/arsip yang pernah mereka kerjakan tetap dapat diakses per terjadwal verifikasi. Riwayat tetap tercatat."
        onConfirm={handleNonaktifkan}
      />
    </ListPageLayout>
  )
}
