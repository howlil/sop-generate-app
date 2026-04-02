import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Peraturan } from '@/features/organisasi'
import { useToast } from '@/utils/ui'
import { useFilteredList } from '@/utils/use-filtered-list'
import { useManajemenPeraturanState } from '@/utils/state/manajemen-peraturan'
import { usePeraturan, getInitialPeraturanListAsync, getRiwayatVersiPeraturanInitial, getManajemenPeraturanOpdId, getOpdNamesForPeraturan } from '@/features/organisasi'
import type { RiwayatVersiEntry } from '@/features/organisasi'
import { useState } from 'react'
import { generateId } from '@/utils/generate-id'
import { PeraturanTableTab } from './manajemen-peraturan/PeraturanTableTab'

const CURRENT_OPD_ID = getManajemenPeraturanOpdId()
const OPD_NAMES = getOpdNamesForPeraturan()

export function ManajemenPeraturan() {
  const { showToast } = useToast()
  const {
    list: peraturanList,
    initPeraturanList,
    addPeraturan,
    updatePeraturan,
    removePeraturan,
    setPeraturanDicabut,
  } = usePeraturan()

  useEffect(() => {
    getInitialPeraturanListAsync().then(initPeraturanList)
  }, [initPeraturanList])

  const {
    searchQuery,
    setSearchQuery,
    isPeraturanDialogOpen,
    setIsPeraturanDialogOpen,
    editingPeraturan,
    setEditingPeraturan,
    peraturanFormData,
    setPeraturanFormData,
    riwayatVersiOpen,
    setRiwayatVersiOpen,
    selectedPeraturanForRiwayat,
    setSelectedPeraturanForRiwayat,
    deleteConfirm,
    setDeleteConfirm,
  } = useManajemenPeraturanState()

  const [riwayatVersiPeraturan, setRiwayatVersiPeraturan] = useState<Record<string, RiwayatVersiEntry[]>>(() =>
    getRiwayatVersiPeraturanInitial()
  )

  const { filteredList: filteredPeraturan } = useFilteredList(peraturanList, {
    searchKeys: ['peraturan', 'nomor', 'tentang'],
    controlledSearch: [searchQuery, setSearchQuery],
  })

  const getRiwayatVersi = (peraturanId: string): RiwayatVersiEntry[] => {
    const list = riwayatVersiPeraturan[peraturanId]
    if (list) return list
    const p = peraturanList.find((x) => x.id === peraturanId)
    if (!p) return []
    return [{ version: p.version, tanggal: new Date().toISOString().slice(0, 10), diubahOleh: OPD_NAMES[p.createdBy] ?? p.createdBy, sopYangMengait: [] }]
  }

  const canEditPeraturan = (_p: Peraturan) => true

  const openPeraturanDialog = (peraturan?: Peraturan) => {
    if (peraturan) {
      setEditingPeraturan(peraturan)
      setPeraturanFormData({
        peraturan: peraturan.peraturan,
        nomor: peraturan.nomor,
        tahun: peraturan.tahun,
        tentang: peraturan.tentang,
      })
    } else {
      setEditingPeraturan(null)
      setPeraturanFormData({ peraturan: '', nomor: '', tahun: '', tentang: '' })
    }
    setIsPeraturanDialogOpen(true)
  }

  const handleSavePeraturan = () => {
    if (
      !peraturanFormData.peraturan ||
      !peraturanFormData.nomor ||
      !peraturanFormData.tahun ||
      !peraturanFormData.tentang
    ) {
      showToast('Semua field wajib diisi', 'error')
      return
    }
    if (editingPeraturan && !canEditPeraturan(editingPeraturan)) {
      showToast('Hanya peraturan yang dibuat oleh OPD Anda yang dapat diedit.', 'error')
      return
    }
    if (editingPeraturan) {
      const newVersion = editingPeraturan.version + 1
      updatePeraturan(editingPeraturan.id, { ...peraturanFormData, version: newVersion })
      setRiwayatVersiPeraturan((prev) => {
        const existing = prev[editingPeraturan.id] ?? []
        return {
          ...prev,
          [editingPeraturan.id]: [
            ...existing,
            {
              version: newVersion,
              tanggal: new Date().toISOString().slice(0, 10),
              diubahOleh: OPD_NAMES[CURRENT_OPD_ID],
              sopYangMengait: [],
            },
          ],
        }
      })
      showToast('Peraturan berhasil diperbarui (versi baru).')
    } else {
      addPeraturan({
        id: generateId(),
        ...peraturanFormData,
        status: 'Berlaku',
        digunakan: 0,
        createdBy: CURRENT_OPD_ID,
        version: 1,
      })
      showToast('Peraturan berhasil ditambahkan')
    }
    setIsPeraturanDialogOpen(false)
  }

  const handleDeletePeraturan = (id: string) => {
    const peraturan = peraturanList.find((p) => p.id === id)
    if (peraturan && !canEditPeraturan(peraturan)) {
      showToast('Hanya peraturan yang dibuat oleh OPD Anda yang dapat dihapus.', 'error')
      return
    }
    if (peraturan && peraturan.digunakan > 0) {
      showToast(`Tidak dapat menghapus. Masih ada ${peraturan.digunakan} SOP yang mengaitkan peraturan ini.`, 'error')
      return
    }
    setDeleteConfirm({ type: 'peraturan', id })
  }

  const doDeletePeraturan = (id: string) => {
    removePeraturan(id)
    showToast('Peraturan berhasil dihapus')
  }

  const toggleStatusPeraturan = (id: string) => {
    const p = peraturanList.find((x) => x.id === id)
    if (p && !canEditPeraturan(p)) return
    setPeraturanDicabut(id)
    showToast('Status peraturan berhasil diubah')
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Peraturan' }]}
      title="Database Peraturan"
      description="Kelola database peraturan"
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari peraturan..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => openPeraturanDialog()}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Peraturan
          </Button>
        </SearchToolbar>
      }
    >
      <PeraturanTableTab
        filteredPeraturan={filteredPeraturan}
        canEditPeraturan={canEditPeraturan}
        isPeraturanDialogOpen={isPeraturanDialogOpen}
        setIsPeraturanDialogOpen={setIsPeraturanDialogOpen}
        editingPeraturan={editingPeraturan}
        peraturanFormData={peraturanFormData}
        setPeraturanFormData={setPeraturanFormData}
        riwayatVersiOpen={riwayatVersiOpen}
        setRiwayatVersiOpen={setRiwayatVersiOpen}
        selectedPeraturanForRiwayat={selectedPeraturanForRiwayat}
        setSelectedPeraturanForRiwayat={setSelectedPeraturanForRiwayat}
        getRiwayatVersi={getRiwayatVersi}
        onOpenPeraturanDialog={openPeraturanDialog}
        onSavePeraturan={handleSavePeraturan}
        onDeletePeraturan={handleDeletePeraturan}
        onToggleStatus={toggleStatusPeraturan}
        confirmDisabled={
          !peraturanFormData.peraturan ||
          !peraturanFormData.nomor ||
          !peraturanFormData.tahun ||
          !peraturanFormData.tentang
        }
      />

      <ConfirmDialog
        open={deleteConfirm != null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Hapus peraturan?"
        description="Peraturan yang dihapus tidak dapat dikembalikan."
        onConfirm={() => {
          if (deleteConfirm?.type === 'peraturan') {
            doDeletePeraturan(deleteConfirm.id)
            setDeleteConfirm(null)
          }
        }}
      />
    </ListPageLayout>
  )
}
