import { useEffect, useState } from 'react'
import { Plus, BookOpen, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Peraturan } from '@/lib/types/peraturan'
import { useToast } from '@/hooks/useUI'
import { useFilteredList } from '@/hooks/useFilteredList'
import { useManajemenPeraturanState } from '@/hooks/useManajemenPeraturanState'
import { usePeraturan } from '@/hooks/usePeraturan'
import {
  getInitialPeraturanListAsync,
  getJenisPeraturanList,
  getRiwayatVersiPeraturanInitial,
  getManajemenPeraturanOpdId,
  getOpdNamesForPeraturan,
} from '@/lib/data/peraturan'
import type { JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
import { generateId } from '@/utils/generate-id'
import { JenisPeraturanTab } from './manajemen-peraturan/JenisPeraturanTab'
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
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isJenisDialogOpen,
    setIsJenisDialogOpen,
    editingJenis,
    setEditingJenis,
    jenisFormData,
    setJenisFormData,
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

  const [jenisList, setJenisList] = useState<JenisPeraturan[]>(() => getJenisPeraturanList())
  const [riwayatVersiPeraturan, setRiwayatVersiPeraturan] = useState<Record<string, RiwayatVersiEntry[]>>(() =>
    getRiwayatVersiPeraturanInitial()
  )

  const { filteredList: filteredJenis } = useFilteredList(jenisList, {
    searchKeys: ['nama', 'kode'],
    controlledSearch: [searchQuery, setSearchQuery],
  })
  const { filteredList: filteredPeraturan } = useFilteredList(peraturanList, {
    searchKeys: ['jenisPeraturan', 'nomor', 'tentang'],
    controlledSearch: [searchQuery, setSearchQuery],
  })

  const getRiwayatVersi = (peraturanId: string): RiwayatVersiEntry[] => {
    const list = riwayatVersiPeraturan[peraturanId]
    if (list) return list
    const p = peraturanList.find((x) => x.id === peraturanId)
    if (!p) return []
    return [{ version: p.version, tanggal: p.tanggalTerbit, diubahOleh: OPD_NAMES[p.createdBy] ?? p.createdBy, sopYangMengait: [] }]
  }

  const canEditJenis = (jenis: JenisPeraturan) => jenis.createdBy === CURRENT_OPD_ID
  const canEditPeraturan = (p: Peraturan) => p.createdBy === CURRENT_OPD_ID

  const openJenisDialog = (jenis?: JenisPeraturan) => {
    if (jenis) {
      setEditingJenis(jenis)
      setJenisFormData({ nama: jenis.nama, kode: jenis.kode, deskripsi: jenis.deskripsi, tingkat: jenis.tingkat })
    } else {
      setEditingJenis(null)
      setJenisFormData({ nama: '', kode: '', deskripsi: '', tingkat: 'Pusat' })
    }
    setIsJenisDialogOpen(true)
  }

  const handleSaveJenis = () => {
    if (!jenisFormData.nama || !jenisFormData.kode) {
      showToast('Nama dan kode jenis peraturan harus diisi', 'error')
      return
    }
    if (editingJenis && !canEditJenis(editingJenis)) {
      showToast('Hanya peraturan yang dibuat oleh OPD Anda yang dapat diedit.', 'error')
      return
    }
    if (editingJenis) {
      setJenisList((prev) =>
        prev.map((j) => (j.id === editingJenis.id ? { ...j, ...jenisFormData } : j))
      )
      showToast('Jenis peraturan berhasil diperbarui')
    } else {
      setJenisList((prev) => [
        ...prev,
        { id: generateId(), ...jenisFormData, jumlahPeraturan: 0, createdBy: CURRENT_OPD_ID },
      ])
      showToast('Jenis peraturan berhasil ditambahkan')
    }
    setIsJenisDialogOpen(false)
  }

  const handleDeleteJenis = (id: string) => {
    const jenis = jenisList.find((j) => j.id === id)
    if (jenis && !canEditJenis(jenis)) {
      showToast('Hanya peraturan yang dibuat oleh OPD Anda yang dapat dihapus.', 'error')
      return
    }
    if (jenis && jenis.jumlahPeraturan > 0) {
      showToast(`Tidak dapat menghapus. Masih ada ${jenis.jumlahPeraturan} peraturan menggunakan jenis ini`, 'error')
      return
    }
    setDeleteConfirm({ type: 'jenis', id })
  }

  const doDeleteJenis = (id: string) => {
    setJenisList((prev) => prev.filter((j) => j.id !== id))
    showToast('Jenis peraturan berhasil dihapus')
  }

  const openPeraturanDialog = (peraturan?: Peraturan) => {
    if (peraturan) {
      setEditingPeraturan(peraturan)
      setPeraturanFormData({
        jenisPeraturan: peraturan.jenisPeraturan,
        nomor: peraturan.nomor,
        tahun: peraturan.tahun,
        tentang: peraturan.tentang,
        tanggalTerbit: peraturan.tanggalTerbit,
      })
    } else {
      setEditingPeraturan(null)
      setPeraturanFormData({
        jenisPeraturan: '',
        nomor: '',
        tahun: '',
        tentang: '',
        tanggalTerbit: '',
      })
    }
    setIsPeraturanDialogOpen(true)
  }

  const handleSavePeraturan = () => {
    if (
      !peraturanFormData.jenisPeraturan ||
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
      title="Master Data Peraturan"
      description="Kelola jenis peraturan dan database peraturan"
      toolbar={
        <SearchToolbar
          searchPlaceholder={
            activeTab === 'jenis' ? 'Cari jenis peraturan...' : 'Cari peraturan...'
          }
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() =>
              activeTab === 'jenis' ? openJenisDialog() : openPeraturanDialog()
            }
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah {activeTab === 'jenis' ? 'Jenis' : 'Peraturan'}
          </Button>
        </SearchToolbar>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200">
          <TabsTrigger value="jenis" className="text-xs gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Jenis Peraturan ({jenisList.length})
          </TabsTrigger>
          <TabsTrigger value="peraturan" className="text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Database Peraturan ({peraturanList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jenis" className="mt-3">
          <JenisPeraturanTab
            filteredJenis={filteredJenis}
            canEditJenis={canEditJenis}
            isJenisDialogOpen={isJenisDialogOpen}
            setIsJenisDialogOpen={setIsJenisDialogOpen}
            editingJenis={editingJenis}
            jenisFormData={jenisFormData}
            setJenisFormData={setJenisFormData}
            onOpenJenisDialog={openJenisDialog}
            onSaveJenis={handleSaveJenis}
            onDeleteJenis={handleDeleteJenis}
          />
        </TabsContent>

        <TabsContent value="peraturan" className="mt-3">
          <PeraturanTableTab
            filteredPeraturan={filteredPeraturan}
            jenisList={jenisList}
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
              !peraturanFormData.jenisPeraturan ||
              !peraturanFormData.nomor ||
              !peraturanFormData.tahun ||
              !peraturanFormData.tentang
            }
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm != null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={deleteConfirm?.type === 'jenis' ? 'Hapus jenis peraturan?' : 'Hapus peraturan?'}
        description={
          deleteConfirm?.type === 'jenis'
            ? 'Jenis peraturan yang dihapus tidak dapat dikembalikan.'
            : 'Peraturan yang dihapus tidak dapat dikembalikan.'
        }
        onConfirm={() => {
          if (deleteConfirm?.type === 'jenis') {
            doDeleteJenis(deleteConfirm.id)
            setDeleteConfirm(null)
          } else if (deleteConfirm?.type === 'peraturan') {
            doDeletePeraturan(deleteConfirm.id)
            setDeleteConfirm(null)
          }
        }}
      />
    </ListPageLayout>
  )
}
