import { Fragment, useMemo, useState } from 'react'
import { Plus, Edit, Trash2, ChevronRight, UserMinus, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useToast } from '@/utils/ui'
import { useOpd } from '@/features/organisasi'
import { useTimPenyusun } from '@/features/tim'
import { usersApi } from '@/features/auth/services/users.api'
import { TimPenyusunFormDialog } from './manajemen-tim-penyusun/TimPenyusunFormDialog'
import { PindahOPDTimPenyusunDialog } from './manajemen-tim-penyusun/PindahOPDTimPenyusunDialog'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'
import { ROUTES } from '@/utils/constants'
import type { AnggotaTimPenyusun } from '@/features/tim'

// UI-only type for this page (flat structure for display)
type TimPenyusun = {
  id: string
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  opdId: string
  status: string
  jumlahSOPDisusun?: number
  tanggalBergabung?: string
  endedAt?: string
  roleInternal?: string
}

/** Transform server AnggotaTimPenyusun to UI TimPenyusun */
function toTimPenyusun(tim: AnggotaTimPenyusun): TimPenyusun {
  return {
    id: tim.id,
    namaLengkap: tim.user?.nama ?? '',
    nip: tim.user?.nip ?? '',
    jabatan: tim.user?.jabatan ?? '',
    pangkat: tim.user?.jabatan ?? '',
    email: tim.user?.email ?? '',
    nohp: tim.user?.email ?? '',
    opdId: tim.opdId,
    status: tim.status === 'AKTIF' ? 'Aktif' : 'Nonaktif',
    jumlahSOPDisusun: tim.jumlahSOPDisusun,
    tanggalBergabung: tim.tanggalBergabung,
    endedAt: tim.berakhirPada,
    roleInternal: tim.peranInternal === 'Koordinator' ? 'Koordinator' : undefined,
  }
}

export function ManajemenTimPenyusun() {
  const { showToast } = useToast()
  const { list: rawOpdList } = useOpd()
  const { list: rawTimList, isLoading: isLoadingTim, tambah, nonaktifkan, pindah } = useTimPenyusun()
  const opdList = rawOpdList.map((o) => ({ id: o.id, name: o.nama }))

  // Transform server data to UI format
  const timList: TimPenyusun[] = useMemo(
    () => rawTimList.map(toTimPenyusun),
    [rawTimList]
  )
  
  // Inline state (replaced useManajemenTimPenyusunState)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)
  const [nonaktifTimId, setNonaktifTimId] = useState<string | null>(null)
  const [pindahTim, setPindahTim] = useState<TimPenyusun | null>(null)
  const [opdTujuanId, setOpdTujuanId] = useState<string | null>(null)
  const [createOpdId, setCreateOpdId] = useState<string | undefined>()
  const [expandedOpdIds, setExpandedOpdIds] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    nohp: '',
    kataSandi: '12345678', // Default password - user should change on first login
  })
  const [searchQuery, setSearchQuery] = useState('')
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return timList
    return timList.filter((item) =>
      ['namaLengkap', 'nip', 'jabatan']
        .map((k) => String((item as Record<string, unknown>)[k] ?? ''))
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [timList, searchQuery])

  const isFormValid =
    formData.namaLengkap.trim() !== '' &&
    formData.nip.trim() !== '' &&
    formData.jabatan.trim() !== '' &&
    formData.pangkat.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.nohp.trim() !== '' &&
    formData.kataSandi.trim() !== ''

  const handleCreate = async () => {
    if (!createOpdId) return
    try {
      // Step 1: Create user
      const user = await usersApi.create({
        nama: formData.namaLengkap,
        nip: formData.nip,
        jabatan: formData.jabatan,
        pangkat: formData.pangkat,
        email: formData.email,
        nohp: formData.nohp,
        kataSandi: formData.kataSandi,
        peran: 'TIM_PENYUSUN',
        opdId: createOpdId,
      })
      // Step 2: Add user to tim penyusun
      await tambah({ userId: user.id, opdId: createOpdId })
      setIsCreateOpen(false)
      setFormData({ namaLengkap: '', nip: '', jabatan: '', pangkat: '', email: '', nohp: '', kataSandi: '12345678' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan tim'
      showToast(message, 'error')
    }
  }

  const handleEdit = async () => {
    if (!selectedTim) return
    try {
      // Update the user record
      const userId = rawTimList.find(t => t.id === selectedTim.id)?.userId
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
      showToast('Data tim penyusun berhasil diperbarui', 'success')
      setIsEditOpen(false)
      setFormData({ namaLengkap: '', nip: '', jabatan: '', pangkat: '', email: '', nohp: '', kataSandi: '12345678' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui tim'
      showToast(message, 'error')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const handleNonaktifkan = async () => {
    if (!nonaktifTimId) return
    try {
      await nonaktifkan(nonaktifTimId)
      setNonaktifTimId(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menonaktifkan tim'
      showToast(message, 'error')
    }
  }

  const handlePindahConfirm = async () => {
    if (!pindahTim || !opdTujuanId) return
    try {
      await pindah({ id: pindahTim.id, opdId: opdTujuanId })
      setPindahTim(null)
      setOpdTujuanId('')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memindah tim'
      showToast(message, 'error')
    }
  }

  const handlePindahClose = () => {
    setPindahTim(null)
    setOpdTujuanId('')
  }

  const groupedByOpd = filteredList.reduce<Record<string, TimPenyusun[]>>((acc, tim) => {
    if (!acc[tim.opdId]) acc[tim.opdId] = []
    acc[tim.opdId].push(tim)
    return acc
  }, {})

  const opdEntries = Object.entries(groupedByOpd)

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
              setFormData({ namaLengkap: '', nip: '', jabatan: '', pangkat: '', email: '', nohp: '', kataSandi: '12345678' })
              setIsCreateOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Tim Penyusun
          </Button>
        </SearchToolbar>
      }
    >
      {isLoadingTim ? (
        <div className="py-8 text-center text-gray-500 text-sm">Memuat data tim penyusun...</div>
      ) : (
      <Table.Paginated data={opdEntries} label="OPD">
        {(pageEntries) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>OPD / Tim Penyusun</Table.Th>
                <Table.Th>NIP</Table.Th>
                <Table.Th>Jabatan</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>No. HP</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {pageEntries.map(([opdId, tims]) => {
                const opd = opdList.find((o) => o.id === opdId)
                if (!opd) return null
                const isExpanded = expandedOpdIds[opdId] ?? false
                return (
                  <Fragment key={`opd-${opdId}`}>
                    <Table.BodyRow
                      className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setExpandedOpdIds((prev) => ({ ...prev, [opdId]: !isExpanded }))
                      }
                    >
                      <Table.Td colSpan={7}>
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
                            <div className="flex flex-col gap-0.5">
                              <p className="font-medium text-gray-900">{tim.namaLengkap}</p>
                              {tim.roleInternal && (
                                <span
                                  className={`inline-block w-fit text-[10px] font-medium px-1.5 py-0 rounded-full border ${
                                    tim.roleInternal === 'Koordinator'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-500 border-gray-200'
                                  }`}
                                >
                                  {tim.roleInternal}
                                </span>
                              )}
                            </div>
                          </Table.Td>
                          <Table.Td className="font-mono text-gray-600 text-[11px]">
                            {tim.nip}
                          </Table.Td>
                          <Table.Td className="text-gray-600">{tim.jabatan}</Table.Td>
                          <Table.Td className="text-gray-600">{tim.email}</Table.Td>
                          <Table.Td className="text-gray-600">{tim.nohp}</Table.Td>
                          <Table.Td>
                            <div className="flex flex-col gap-0.5">
                              <StatusBadge status={tim.status} />
                              {tim.endedAt && (
                                <span className="text-[10px] text-gray-500">
                                  Selesai: {formatDateId(tim.endedAt)}
                                </span>
                              )}
                            </div>
                          </Table.Td>
                          <Table.Td>
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              <IconActionButton
                                icon={Edit}
                                title="Edit"
                                onClick={() => {
                                  setSelectedTim(tim)
                                  setFormData({ namaLengkap: tim.namaLengkap, nip: tim.nip, jabatan: tim.jabatan, pangkat: tim.pangkat, email: tim.email, nohp: tim.nohp })
                                  setIsEditOpen(true)
                                }}
                              />
                              {tim.status === 'Aktif' && (
                                <>
                                  <IconActionButton
                                    icon={UserMinus}
                                    title="Nonaktifkan"
                                    onClick={() => setNonaktifTimId(tim.id)}
                                  />
                                  <IconActionButton
                                    icon={ArrowRightLeft}
                                    title="Pindah OPD"
                                    onClick={() => {
                                      setPindahTim(tim)
                                      setOpdTujuanId(opdList.find((o) => o.id !== tim.opdId)?.id ?? '')
                                    }}
                                  />
                                </>
                              )}
                              <IconActionButton
                                icon={Trash2}
                                title="Hapus permanen"
                                destructive
                                onClick={() => handleDelete(tim.id)}
                              />
                            </div>
                          </Table.Td>
                        </Table.BodyRow>
                      ))}
                  </Fragment>
                )
              })}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>
      )}

      {filteredList.length === 0 && !isLoadingTim && (
        <div className="py-8 text-center text-gray-500 text-sm">
          Belum ada tim penyusun. Klik &quot;Tambah Tim Penyusun&quot; untuk menambah.
        </div>
      )}

      <TimPenyusunFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formData={formData}
        setFormData={setFormData}
        createOpdId={createOpdId ?? ''}
        setCreateOpdId={setCreateOpdId}
        opdList={opdList}
        isFormValid={isFormValid}
        onConfirm={handleCreate}
      />

      <TimPenyusunFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        formData={formData}
        setFormData={setFormData}
        createOpdId={createOpdId ?? ''}
        setCreateOpdId={setCreateOpdId}
        opdList={opdList}
        isFormValid={isFormValid}
        onConfirm={handleEdit}
      />

      <ConfirmDialog
        open={deleteTimId != null}
        onOpenChange={(open) => !open && setDeleteTimId(null)}
        title="Hapus permanen tim penyusun?"
        description="Data tim penyusun akan dihapus dari daftar. Data SOP yang pernah disusun tetap tersimpan per OPD (nama author tetap tercatat). Gunakan Nonaktifkan jika hanya mengakhiri tugas."
        onConfirm={async () => {
          if (deleteTimId) {
            try {
              // Note: Server doesn't have a hard-delete endpoint. Use nonaktifkan instead.
              await nonaktifkan(deleteTimId)
              showToast('Tim penyusun berhasil dinonaktifkan', 'success')
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Gagal menonaktifkan tim'
              showToast(message, 'error')
            }
            setDeleteTimId(null)
          }
        }}
      />

      <ConfirmDialog
        open={nonaktifTimId != null}
        onOpenChange={(open) => !open && setNonaktifTimId(null)}
        title="Nonaktifkan tim penyusun?"
        description="Tugas tim penyusun ini akan diakhiri. Data SOP yang pernah disusun tetap dapat diakses per OPD. Riwayat tetap tercatat."
        onConfirm={handleNonaktifkan}
      />

      <PindahOPDTimPenyusunDialog
        open={pindahTim != null}
        onOpenChange={(open) => !open && handlePindahClose()}
        tim={pindahTim}
        opdTujuanId={opdTujuanId ?? ''}
        setOpdTujuanId={setOpdTujuanId}
        opdList={opdList}
        onConfirm={handlePindahConfirm}
        onClose={handlePindahClose}
      />
    </ListPageLayout>
  )
}
