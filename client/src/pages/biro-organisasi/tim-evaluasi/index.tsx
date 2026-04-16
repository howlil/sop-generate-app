import { useMemo, useState } from 'react'
import { Users, Plus, Edit, UserMinus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTimEvaluasi, useTimEvaluasiDetail } from '@/features/tim'
import type { AnggotaTimEvaluasi } from '@/features/tim'
import type { TimEvaluasiAnggotaUI } from '@/features/tim/types/tim'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'
import { showErrorMessages, useToast } from "@/utils/toast"
import { useUsers } from '@/features/auth/hooks/useUsers'

export function ManajemenTimEvaluasi() {
  const { showToast } = useToast()
  const {
    list: timList,
    nonaktifkan,
    tambah,
    isNonaktifkan: isNonaktifkanLoading,
  } = useTimEvaluasi()
  const { data: usersPage, update: updateUser } = useUsers({ page: 1, limit: 200 })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimEvaluasiAnggotaUI | null>(null)
  const [nonaktifTimId, setNonaktifTimId] = useState<string | null>(null)
  const [detailTimId, setDetailTimId] = useState<string | null>(null)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const {
    data: detailData,
    isLoading: isDetailLoading,
  } = useTimEvaluasiDetail(detailTimId ?? undefined)
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

  const existingMemberUserIds = useMemo(
    () => new Set(timList.map((member) => member.userId)),
    [timList],
  )

  const eligibleUsers = useMemo(
    () =>
      (usersPage?.data ?? []).filter(
        (user) => !existingMemberUserIds.has(user.id),
      ),
    [usersPage, existingMemberUserIds],
  )

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
    setSelectedUserId('')
  }

  const handleNonaktifkan = async () => {
    if (!nonaktifTimId) return
    await nonaktifkan(nonaktifTimId)
    setNonaktifTimId(null)
  }

  const handleCreateSubmit = async () => {
    if (!selectedUserId) return
    try {
      setIsSubmittingCreate(true)
      await tambah({ userId: selectedUserId })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error: unknown) {
      showErrorMessages(error, 'Gagal menambahkan anggota')
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedTim) return
    try {
      setIsSubmittingEdit(true)
      // Update the user record
      const userId = timList.find(t => t.id === selectedTim.id)?.userId
      if (!userId) {
        showToast('User ID tidak ditemukan', 'error')
        return
      }
      await updateUser({
        id: userId,
        payload: {
          nama: formData.namaLengkap,
          nip: formData.nip,
          jabatan: formData.jabatan,
          pangkat: formData.pangkat,
          nohp: formData.nohp,
        },
      })
      setIsEditDialogOpen(false)
      showToast('Data anggota berhasil diperbarui', 'success')
    } catch (error: unknown) {
      showErrorMessages(error, 'Gagal memperbarui anggota')
    } finally {
      setIsSubmittingEdit(false)
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
              setSelectedUserId('')
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
                        <IconActionButton
                          icon={Eye}
                          title="Lihat Detail"
                          onClick={() => setDetailTimId(tim.id)}
                        />
                        {(tim.status === 'AKTIF') && (
                          <IconActionButton
                            icon={UserMinus}
                            title="Nonaktifkan"
                            onClick={() => setNonaktifTimId(tim.id)}
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
        title="Tambah Anggota Tim Evaluasi"
        description="Pilih pengguna aktif yang belum terdaftar sebagai anggota Tim Evaluasi."
        confirmLabel={isSubmittingCreate ? "Menyimpan..." : "Simpan"}
        cancelLabel="Batal"
        onConfirm={handleCreateSubmit}
        confirmDisabled={!selectedUserId || isSubmittingCreate}
        size="md"
      >
        <div className="space-y-3">
          <FormField label="Pilih Pengguna" required>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              placeholder="Pilih pengguna yang akan ditambahkan"
              options={eligibleUsers.map((user) => ({
                value: user.id,
                label: `${user.nama} • ${user.nip ?? '-'} • ${user.email}`,
              }))}
            />
            {eligibleUsers.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada pengguna eligible. Semua pengguna aktif sudah menjadi anggota Tim Evaluasi.
              </p>
            )}
          </FormField>
        </div>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Anggota Tim Evaluasi"
        description="Perbarui informasi anggota tim"
        confirmLabel={isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
        cancelLabel="Batal"
        onConfirm={handleEditSubmit}
        confirmDisabled={!formData.namaLengkap || !formData.nip || isSubmittingEdit}
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
        open={nonaktifTimId != null}
        onOpenChange={(open) => !open && setNonaktifTimId(null)}
        title="Nonaktifkan anggota tim evaluasi?"
        description="Tugas anggota tim evaluasi akan diakhiri. Dampak: status anggota menjadi NONAKTIF dan user tidak bisa akses sistem lagi."
        onConfirm={handleNonaktifkan}
        confirmLabel={isNonaktifkanLoading ? "Menonaktifkan..." : "Nonaktifkan"}
      />

      <Dialog open={detailTimId != null} onOpenChange={(open) => !open && setDetailTimId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Anggota Tim Evaluasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap anggota Tim Evaluasi.
            </DialogDescription>
          </DialogHeader>
          {isDetailLoading ? (
            <p className="text-xs text-gray-500">Memuat detail anggota...</p>
          ) : detailData ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Nama</span>
                <span className="font-medium text-gray-900 text-right">{detailData.user?.nama ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900 text-right">{detailData.user?.email ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">NIP</span>
                <span className="font-medium text-gray-900 text-right">{detailData.user?.nip ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Jabatan</span>
                <span className="font-medium text-gray-900 text-right">{detailData.user?.jabatan ?? '—'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={detailData.status} />
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Tanggal Bergabung</span>
                <span className="font-medium text-gray-900 text-right">{formatDateId(detailData.tanggalBergabung)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Berakhir Pada</span>
                <span className="font-medium text-gray-900 text-right">
                  {detailData.berakhirPada ? formatDateId(detailData.berakhirPada) : '—'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Detail anggota tidak ditemukan.</p>
          )}
        </DialogContent>
      </Dialog>
    </ListPageLayout>
  )
}
