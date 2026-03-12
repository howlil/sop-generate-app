import { useEffect, Fragment } from 'react'
import { Plus, Edit, Trash2, ChevronRight, UserMinus, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/hooks/useFilteredList'
import { usePagination } from '@/hooks/usePagination'
import { useToast } from '@/hooks/useUI'
import { useManajemenTimPenyusunState } from '@/hooks/useManajemenTimPenyusunState'
import { generateId } from '@/utils/generate-id'
import { useOpdList } from '@/lib/data/opd'
import { useTimPenyusunList } from '@/hooks/useTimPenyusunList'
import {
  addTimPenyusun,
  updateTimPenyusun,
  removeTimPenyusun,
} from '@/lib/stores/tim-penyusun-store'
import type { TimPenyusun } from '@/lib/types/tim'
import { ROUTES } from '@/lib/constants/routes'
import { TimPenyusunFormDialog } from './manajemen-tim-penyusun/TimPenyusunFormDialog'
import { PindahOPDTimPenyusunDialog } from './manajemen-tim-penyusun/PindahOPDTimPenyusunDialog'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId } from '@/utils/format-date'

export function ManajemenTimPenyusun() {
  const { showToast } = useToast()
  const opdList = useOpdList()
  const state = useManajemenTimPenyusunState()
  const {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    selectedTim,
    deleteTimId,
    setDeleteTimId,
    nonaktifTimId,
    setNonaktifTimId,
    pindahTim,
    setPindahTim,
    opdTujuanId,
    setOpdTujuanId,
    formData,
    setFormData,
    createOpdId,
    setCreateOpdId,
    expandedOpdIds,
    setExpandedOpdIds,
    resetForm,
    openEditDialog,
  } = state

  useEffect(() => {
    if (opdList.length > 0 && !createOpdId) setCreateOpdId(opdList[0].id)
  }, [opdList, createOpdId, setCreateOpdId])

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
  }

  const handleEdit = () => {
    if (!selectedTim) return
    updateTimPenyusun(selectedTim.id, formData)
    showToast('Data tim penyusun berhasil diperbarui')
    setIsEditOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setDeleteTimId(id)
  }

  const today = new Date().toISOString().split('T')[0]

  const handleNonaktifkan = () => {
    if (!nonaktifTimId) return
    updateTimPenyusun(nonaktifTimId, { status: 'Nonaktif', endedAt: today })
    showToast('Tim penyusun berhasil dinonaktifkan. Data SOP yang pernah disusun tetap dapat diakses per OPD.')
    setNonaktifTimId(null)
  }

  const handlePindahConfirm = () => {
    if (!pindahTim || !opdTujuanId) return
    updateTimPenyusun(pindahTim.id, { status: 'Nonaktif', endedAt: today })
    addTimPenyusun({
      ...pindahTim,
      id: generateId(),
      opdId: opdTujuanId,
      status: 'Aktif',
      tanggalBergabung: today,
      endedAt: undefined,
    })
    showToast('Tim penyusun berhasil dipindah ke OPD baru. Tugas lama dicatat dengan status nonaktif.')
    setPindahTim(null)
    setOpdTujuanId('')
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
  const pagination = usePagination(opdEntries.length)
  const entriesToShow = pagination.showPagination
    ? opdEntries.slice(pagination.startIndex, pagination.endIndex)
    : opdEntries

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
              <Table.Th>Status</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {entriesToShow.map(([opdId, tims]) => {
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
                          <p className="font-medium text-gray-900">{tim.nama}</p>
                        </Table.Td>
                        <Table.Td className="font-mono text-gray-600 text-[11px]">
                          {tim.nip}
                        </Table.Td>
                        <Table.Td className="text-gray-600">{tim.jabatan}</Table.Td>
                        <Table.Td className="text-gray-600">{tim.email}</Table.Td>
                        <Table.Td className="text-gray-600">{tim.noHP}</Table.Td>
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
                              onClick={() => openEditDialog(tim)}
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
        <Table.Pagination
          totalItems={opdEntries.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="OPD"
        />
      </Table.Card>

      {filteredList.length === 0 && (
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
        createOpdId={createOpdId}
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
        createOpdId={createOpdId}
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
        onConfirm={() => {
          if (deleteTimId) {
            removeTimPenyusun(deleteTimId)
            showToast('Tim penyusun berhasil dihapus')
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
        opdTujuanId={opdTujuanId}
        setOpdTujuanId={setOpdTujuanId}
        opdList={opdList}
        onConfirm={handlePindahConfirm}
        onClose={handlePindahClose}
      />
    </ListPageLayout>
  )
}
