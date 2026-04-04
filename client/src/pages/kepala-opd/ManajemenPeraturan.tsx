import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Peraturan } from '@/features/organisasi'
import { usePeraturan, useOpd, usePeraturanRiwayat } from '@/features/organisasi'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/utils/ui'
import type { RiwayatVersiEntry } from '@/features/organisasi'
import { PeraturanTableTab } from './manajemen-peraturan/PeraturanTableTab'

export function ManajemenPeraturan() {
  const { showToast } = useToast()
  const currentUser = useAuthStore((s) => s.user)
  const currentOpdId = currentUser?.opdId ?? ''

  const {
    list: peraturanList,
    isLoading: isLoadingPeraturan,
    create,
    update,
    delete: deletePeraturan,
    revoke,
  } = usePeraturan(currentOpdId || undefined)

  const { list: opdList } = useOpd()

  // Build OPD names map from fetched data
  const opdNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const opd of opdList) {
      map[opd.id] = opd.nama
    }
    return map
  }, [opdList])

  // Inline state (replaced useManajemenPeraturanState)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPeraturanDialogOpen, setIsPeraturanDialogOpen] = useState(false)
  const [editingPeraturan, setEditingPeraturan] = useState<Peraturan | null>(null)
  const [peraturanFormData, setPeraturanFormData] = useState({
    peraturan: '',
    nomor: '',
    tahun: '',
    tentang: '',
  })
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null)

  // Riwayat data for selected peraturan (hook called at component level)
  const { data: peraturanRiwayatData = [] } = usePeraturanRiwayat(
    selectedPeraturanForRiwayat?.id ?? ''
  )

  const getRiwayatVersi = (_peraturanId: string): RiwayatVersiEntry[] => {
    // Use data from hook if available
    if (peraturanRiwayatData.length > 0) {
      return peraturanRiwayatData.map(d => ({
        version: d.version,
        tanggal: d.tanggal,
        diubahOleh: d.diubahOleh,
        sopYangMengait: d.sopYangMengait,
      }))
    }
    // Fallback: derive from peraturan data
    const p = peraturanList.find((x) => x.id === selectedPeraturanForRiwayat?.id)
    if (!p) return []
    return [{ version: 1, tanggal: new Date().toISOString().slice(0, 10), diubahOleh: opdNames[p.opdId] ?? p.opdId, sopYangMengait: [] }]
  }

  const filteredPeraturan = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return peraturanList
    return peraturanList.filter((item) =>
      ['namaPeraturan', 'nomor', 'tentang']
        .map((k) => String(item[k as keyof Peraturan] ?? ''))
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [peraturanList, searchQuery])

  const canEditPeraturan = (_p: Peraturan) => true

  const openPeraturanDialog = (peraturan?: Peraturan) => {
    if (peraturan) {
      setEditingPeraturan(peraturan)
      setPeraturanFormData({
        peraturan: peraturan.namaPeraturan,
        nomor: peraturan.nomor,
        tahun: String(peraturan.tahun),
        tentang: peraturan.tentang,
      })
    } else {
      setEditingPeraturan(null)
      setPeraturanFormData({ peraturan: '', nomor: '', tahun: '', tentang: '' })
    }
    setIsPeraturanDialogOpen(true)
  }

  const handleSavePeraturan = async () => {
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
    try {
      if (editingPeraturan) {
        await update({ id: editingPeraturan.id, payload: { ...peraturanFormData, tahun: Number(peraturanFormData.tahun) } })
      } else {
        await create({
          opdId: currentOpdId,
          namaPeraturan: peraturanFormData.peraturan,
          nomor: peraturanFormData.nomor,
          tahun: Number(peraturanFormData.tahun),
          tentang: peraturanFormData.tentang,
        })
      }
      setIsPeraturanDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      showToast(message, 'error')
    }
  }

  const handleDeletePeraturan = (id: string) => {
    const peraturan = peraturanList.find((p) => p.id === id)
    if (peraturan && !canEditPeraturan(peraturan)) {
      showToast('Hanya peraturan yang dibuat oleh OPD Anda yang dapat dihapus.', 'error')
      return
    }
    if (peraturan && peraturan.digunakan && peraturan.digunakan > 0) {
      showToast(`Tidak dapat menghapus. Masih ada ${peraturan.digunakan} SOP yang mengaitkan peraturan ini.`, 'error')
      return
    }
    setDeleteConfirm({ type: 'peraturan', id })
  }

  const doDeletePeraturan = async (id: string) => {
    try {
      await deletePeraturan(id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      showToast(message, 'error')
    }
  }

  const toggleStatusPeraturan = async (id: string) => {
    const p = peraturanList.find((x) => x.id === id)
    if (p && !canEditPeraturan(p)) return
    try {
      await revoke(id)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      showToast(message, 'error')
    }
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
      {isLoadingPeraturan ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
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
      )}

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
