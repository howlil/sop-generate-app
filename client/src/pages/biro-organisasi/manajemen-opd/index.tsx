import { useState } from 'react'
import { Building2, Plus, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useToast } from "@/utils/toast"
import { useOpd } from '@/features/organisasi'
import { useUsers } from '@/features/auth/hooks/useUsers'
import { useSetKepalaAktif, useAkhiriJabatan, usePindahJabatan } from '@/features/auth/hooks/useJabatan'
import type { OPDUI as OPD, KepalaOPDUI as KepalaOPD } from '@/features/organisasi/types/ui'
import { OPDTab } from './components/OPDTab'
import { KepalaOPDTab } from './components/KepalaOPDTab'

// Local utility functions
function hasRelasiData(opd: OPD): boolean {
  if (!opd._count) return false
  return (opd._count.sop > 0 || opd._count.pengguna > 0 || opd._count.pengajuanEvaluasi > 0)
}

function canDeleteKepala(kepala: KepalaOPD): boolean {
  return !kepala.totalSOP || kepala.totalSOP === 0
}

export function ManajemenOPD() {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'opd' | 'kepala'>('opd')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null)
  const { list: opdResponseList, create, update, delete: deleteOpd } = useOpd()
  // Transform server OpdResponse (nama) to UI OPD (name)
  const opdList: OPD[] = opdResponseList.map((o) => ({
    id: o.id,
    name: o.nama,
    totalSOP: o.totalSOP,
    sopBerlaku: o.sopBerlaku,
    sopDraft: o.sopDraft,
    createdAt: o.createdAt,
    _count: o._count
      ? {
          sop: o._count.sop ?? 0,
          pengguna: o._count.pengguna ?? 0,
          pengajuanEvaluasi: o._count.pengajuanEvaluasi ?? 0,
        }
      : undefined,
  }))

  // Fetch Kepala OPD users from API
  const { data: usersPage } = useUsers(1, 100)
  const usersList = usersPage?.data ?? []
  const kepalaList = usersList
    .filter((u) => u.peran === 'KEPALA_OPD' || u.jabatan?.toLowerCase().includes('kepala'))
    .map((u) => ({
      id: u.id,
      name: u.nama,
      nip: u.nip ?? '',
      email: u.email,
      phone: u.nohp ?? '',
      opdId: u.opdId ?? undefined,
      isActive: u.peran === 'KEPALA_OPD',
      // NOTE: Users API does not return SOP counts. When backend adds
      // a user stats endpoint, fetch and populate this field.
      totalSOP: 0 as number | undefined,
    }))

  const { mutateAsync: setKepalaAktifMutation } = useSetKepalaAktif()
  const { mutateAsync: akhiriJabatanMutation } = useAkhiriJabatan()
  const { mutateAsync: pindahJabatanMutation } = usePindahJabatan()
  const [deleteOpdId, setDeleteOpdId] = useState<string | null>(null)
  const [deleteKepalaId, setDeleteKepalaId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [riwayatKepalaOpen, setRiwayatKepalaOpen] = useState(false)
  
  // Local state management
  const [kepalaFormOpen, setKepalaFormOpen] = useState(false)
  const [tambahKepalaOpen, setTambahKepalaOpen] = useState(false)
  const [pindahDialogOpen, setPindahDialogOpen] = useState(false)
  const [riwayatDialogOpen, setRiwayatDialogOpen] = useState(false)
  const [editingKepala, setEditingKepala] = useState<KepalaOPD | null>(null)
  const [kepalaForm, setKepalaForm] = useState<{ name: string; nip: string; email: string; phone: string }>({ name: '', nip: '', email: '', phone: '' })
  const [formTambahKepala, setFormTambahKepala] = useState<{ opdId: string; name: string; nip: string; email: string }>({ opdId: '', name: '', nip: '', email: '' })
  const [pindahForm, setPindahForm] = useState<{ opdId: string }>({ opdId: '' })
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<{ name: string; email: string } | null>(null)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<{ name: string; email: string; phone: string; nip?: string } | null>(null)

  // Simple filtering
  const filteredOPD = opdList.filter((opd) =>
    opd.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPersons = kepalaList.filter((kepala) =>
    (kepala.name ?? '').toLowerCase().includes(searchUserQuery.toLowerCase())
  )

  const getKepalaAktif = (opdId?: string): KepalaOPD | undefined =>
    kepalaList.find((k) => (!opdId || k.opdId === opdId) && k.isActive)
  const getKepalaByOPD = (opdId: string): KepalaOPD[] =>
    kepalaList.filter((k) => k.opdId === opdId)
  const getRiwayatForUser = (_name: string, _email: string): KepalaOPD[] =>
    kepalaList.filter((k) => k.name === _name && k.email === _email)

  const handleDelete = (id: string) => {
    const opd = opdList.find((o) => o.id === id)
    if (opd && hasRelasiData(opd)) {
      showToast(
        'OPD dengan data (SOP, proyek, evaluasi) hanya dapat dinonaktifkan. Gunakan tombol Nonaktif untuk menonaktifkan akun; penghapusan permanen tidak diperbolehkan.',
        'error'
      )
      return
    }
    setDeleteOpdId(id)
  }

  const resetForm = () => setFormData({ name: '' })

  const openEditDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setFormData({ name: opd.name })
    setIsEditDialogOpen(true)
  }

  const openKepalaForm = (kepala?: KepalaOPD) => {
    if (kepala) {
      setEditingKepala(kepala)
      setKepalaForm({ name: kepala.name, nip: kepala.nip ?? '', email: kepala.email, phone: kepala.phone })
    } else {
      setEditingKepala(null)
      setKepalaForm({ name: '', nip: '', email: '', phone: '' })
    }
    setKepalaFormOpen(true)
  }

  const deleteKepala = (id: string) => setDeleteKepalaId(id)

  const doDeleteKepala = async (id: string) => {
    try {
      // Use akhiriJabatan to end the tenure, NOT deleteUser which deletes the entire account
      await akhiriJabatanMutation(id)
      showToast('Jabatan Kepala OPD berhasil diakhiri', 'success')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengakhiri jabatan Kepala OPD'
      showToast(message, 'error')
    } finally {
      setDeleteKepalaId(null)
    }
  }

  // Real API-based jabatan operations
  const saveKepala = async () => {
    if (!selectedOPD || !kepalaForm.name) return
    try {
      await setKepalaAktifMutation({ userId: editingKepala?.id ?? '', opdId: selectedOPD.id })
      setKepalaFormOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan Kepala OPD'
      showToast(message, 'error')
    }
  }

  const saveTambahKepala = async () => {
    if (!formTambahKepala.opdId || !formTambahKepala.name) return
    try {
      await setKepalaAktifMutation({ userId: formTambahKepala.userId, opdId: formTambahKepala.opdId })
      setTambahKepalaOpen(false)
      setFormTambahKepala({ opdId: '', name: '', nip: '', email: '' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menambah Kepala OPD'
      showToast(message, 'error')
    }
  }

  const savePindahJabatan = async () => {
    if (!pindahDialogPerson || !pindahForm.opdId) return
    try {
      await pindahJabatanMutation({ userId: pindahDialogPerson.id, opdId: pindahForm.opdId })
      setPindahDialogOpen(false)
      setPindahDialogPerson(null)
      setPindahForm({ opdId: '' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memindah jabatan'
      showToast(message, 'error')
    }
  }

  const setKepalaAktif = async (kepalaId: string) => {
    const k = kepalaList.find((x) => x.id === kepalaId)
    if (!k?.opdId) return
    try {
      await setKepalaAktifMutation({ userId: kepalaId, opdId: k.opdId })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengatur Kepala OPD'
      showToast(message, 'error')
    }
  }

  const akhiriJabatan = async (kepalaId: string) => {
    try {
      await akhiriJabatanMutation(kepalaId)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengakhiri jabatan'
      showToast(message, 'error')
    }
  }

  const onConfirmCreate = async () => {
    try {
      await create({ nama: formData.name })
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan OPD'
      showToast(message, 'error')
    }
  }

  const onConfirmEdit = async () => {
    if (!selectedOPD) return
    try {
      await update({ id: selectedOPD.id, payload: { nama: formData.name } })
      setIsEditDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui OPD'
      showToast(message, 'error')
    }
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen OPD' }]}
      title="Manajemen OPD"
      description="Kelola data organisasi perangkat daerah dan jabatan kepala OPD"
      toolbar={
        <SearchToolbar
          searchPlaceholder={
            activeTab === 'opd' ? 'Cari OPD, kode, atau penanggung jawab...' : 'Cari OPD atau nama kepala...'
          }
          searchValue={activeTab === 'opd' ? searchQuery : searchUserQuery}
          onSearchChange={(e) =>
            activeTab === 'opd' ? setSearchQuery(e.target.value) : setSearchUserQuery(e.target.value)
          }
        >
          {activeTab === 'opd' ? (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs shrink-0"
              onClick={() => {
                resetForm()
                setIsCreateDialogOpen(true)
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah OPD
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs shrink-0"
              onClick={() => {
                setFormTambahKepala({ opdId: opdList[0]?.id ?? '', name: '', nip: '', email: '' })
                setTambahKepalaOpen(true)
              }}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Tambah Kepala OPD
            </Button>
          )}
        </SearchToolbar>
      }
    >
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'opd' | 'kepala')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 w-full">
          <TabsTrigger value="opd" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Manajemen OPD
          </TabsTrigger>
          <TabsTrigger value="kepala" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Kepala OPD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opd" className="space-y-3 mt-3">
          <OPDTab
            filteredOPD={filteredOPD}
            opdList={opdList}
            selectedOPD={selectedOPD}
            isCreateDialogOpen={isCreateDialogOpen}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            isDetailDialogOpen={isDetailDialogOpen}
            setIsDetailDialogOpen={setIsDetailDialogOpen}
            riwayatKepalaOpen={riwayatKepalaOpen}
            setRiwayatKepalaOpen={setRiwayatKepalaOpen}
            formData={formData}
            setFormData={setFormData}
            getKepalaAktif={getKepalaAktif}
            getKepalaByOPD={getKepalaByOPD}
            hasRelasiData={hasRelasiData}
            onOpenDetail={(opd) => {
              setSelectedOPD(opd)
              setIsDetailDialogOpen(true)
            }}
            onOpenEdit={openEditDialog}
            onOpenRiwayat={(opd) => {
              setSelectedOPD(opd)
              setRiwayatKepalaOpen(true)
            }}
            onDelete={handleDelete}
            onConfirmCreate={onConfirmCreate}
            onConfirmEdit={onConfirmEdit}
          />
        </TabsContent>

        <TabsContent value="kepala" className="space-y-3 mt-3">
          <KepalaOPDTab
            opdList={opdList}
            filteredPersons={filteredPersons}
            kepalaFormOpen={kepalaFormOpen}
            setKepalaFormOpen={setKepalaFormOpen}
            tambahKepalaOpen={tambahKepalaOpen}
            setTambahKepalaOpen={setTambahKepalaOpen}
            pindahDialogOpen={pindahDialogOpen}
            setPindahDialogOpen={setPindahDialogOpen}
            setPindahDialogPerson={setPindahDialogPerson}
            riwayatDialogOpen={riwayatDialogOpen}
            setRiwayatDialogOpen={setRiwayatDialogOpen}
            riwayatDialogPerson={riwayatDialogPerson}
            setRiwayatDialogPerson={setRiwayatDialogPerson}
            editingKepala={editingKepala}
            kepalaForm={kepalaForm}
            setKepalaForm={setKepalaForm}
            formTambahKepala={formTambahKepala}
            setFormTambahKepala={setFormTambahKepala}
            pindahForm={pindahForm}
            setPindahForm={setPindahForm}
            pindahDialogPerson={pindahDialogPerson}
            selectedOPD={selectedOPD}
            setSelectedOPD={setSelectedOPD}
            getKepalaAktif={getKepalaAktif}
            getKepalaByOPD={getKepalaByOPD}
            getRiwayatForUser={getRiwayatForUser}
            canDeleteKepala={canDeleteKepala}
            onSaveKepala={saveKepala}
            onSaveTambahKepala={saveTambahKepala}
            onSavePindah={savePindahJabatan}
            onOpenKepalaForm={openKepalaForm}
            onSetKepalaAktif={setKepalaAktif}
            onAkhiriJabatan={akhiriJabatan}
            onDeleteKepala={deleteKepala}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteOpdId != null}
        onOpenChange={(open) => !open && setDeleteOpdId(null)}
        title="Hapus OPD?"
        description="Apakah Anda yakin ingin menghapus OPD ini? Hapus permanen hanya untuk OPD tanpa data."
        onConfirm={async () => {
          if (deleteOpdId) {
            try {
              await deleteOpd(deleteOpdId)
              setDeleteOpdId(null)
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'Gagal menghapus OPD'
              showToast(message, 'error')
            }
          }
        }}
      />

      <ConfirmDialog
        open={deleteKepalaId != null}
        onOpenChange={(open) => !open && setDeleteKepalaId(null)}
        title="Akhiri Jabatan Kepala OPD?"
        description={
          deleteKepalaId
            ? `Jabatan Kepala OPD "${kepalaList.find((k) => k.id === deleteKepalaId)?.name ?? ''}" akan diakhiri. User tetap ada tapi tidak lagi menjabat sebagai Kepala OPD.`
            : undefined
        }
        onConfirm={async () => {
          if (deleteKepalaId) {
            await doDeleteKepala(deleteKepalaId)
          }
        }}
      />
    </ListPageLayout>
  )
}
