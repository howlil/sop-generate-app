import { useState } from 'react'
import { Building2, Plus, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getInitialOpdList, getInitialKepalaList } from '@/lib/data/opd'
import { hasRelasiData, canDeleteKepala } from '@/lib/domain/manajemen-opd'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useToast } from '@/hooks/useUI'
import { useManajemenOPDState } from '@/hooks/useManajemenOPDState'
import { useManajemenOPDData } from '@/hooks/useManajemenOPDData'
import { generateId } from '@/utils/generate-id'
import { OPDTab } from './manajemen-opd/OPDTab'
import { KepalaOPDTab } from './manajemen-opd/KepalaOPDTab'

export function ManajemenOPD() {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'opd' | 'penugasan'>('opd')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null)
  const [opdList, setOpdList] = useState<OPD[]>(() => getInitialOpdList())
  const [kepalaList, setKepalaList] = useState<KepalaOPD[]>(() => getInitialKepalaList())
  const [deleteOpdId, setDeleteOpdId] = useState<string | null>(null)
  const [deleteKepalaId, setDeleteKepalaId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [riwayatKepalaOpen, setRiwayatKepalaOpen] = useState(false)
  const kepalaState = useManajemenOPDState()
  const {
    kepalaFormOpen,
    setKepalaFormOpen,
    tambahPenugasanOpen,
    setTambahPenugasanOpen,
    pindahDialogOpen,
    setPindahDialogOpen,
    riwayatDialogOpen,
    setRiwayatDialogOpen,
    editingKepala,
    setEditingKepala,
    kepalaForm,
    setKepalaForm,
    penugasanForm,
    setPenugasanForm,
    pindahForm,
    setPindahForm,
    riwayatDialogPerson,
    setRiwayatDialogPerson,
    pindahDialogPerson,
    setPindahDialogPerson,
  } = kepalaState

  const {
    getKepalaAktif,
    getKepalaByOPD,
    filteredOPD,
    filteredPersons,
    getRiwayatForUser,
  } = useManajemenOPDData({
    opdList,
    kepalaList,
    searchQuery,
    setSearchQuery,
    searchUserQuery,
    setSearchUserQuery,
  })

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

  const saveKepala = () => {
    if (!selectedOPD || !kepalaForm.name) return
    if (editingKepala) {
      setKepalaList((prev) =>
        prev.map((k) => (k.id === editingKepala.id ? { ...k, ...kepalaForm, nip: kepalaForm.nip } : k))
      )
    } else {
      const existingActive = getKepalaAktif(selectedOPD.id)
      const today = new Date().toISOString().slice(0, 10)
      const newKepala: KepalaOPD = {
        id: generateId('k'),
        opdId: selectedOPD.id,
        name: kepalaForm.name,
        nip: kepalaForm.nip,
        email: kepalaForm.email,
        phone: kepalaForm.phone,
        isActive: true,
        totalSOP: 0,
      }
      setKepalaList((prev) => {
        let next = [...prev, newKepala]
        if (existingActive) {
          next = next.map((k) =>
            k.id === existingActive.id ? { ...k, isActive: false, endedAt: today } : k
          )
        }
        return next
      })
    }
    setKepalaFormOpen(false)
  }

  const savePenugasanKepala = () => {
    const today = new Date().toISOString().slice(0, 10)
    if (!penugasanForm.opdId || !penugasanForm.name) return
    const existingActive = getKepalaAktif(penugasanForm.opdId)
    const newKepala: KepalaOPD = {
      id: generateId('k'),
      opdId: penugasanForm.opdId,
      name: penugasanForm.name,
      nip: penugasanForm.nip,
      email: penugasanForm.email,
      phone: '',
      isActive: true,
      totalSOP: 0,
    }
    setKepalaList((prev) => {
      let next = [...prev, newKepala]
      if (existingActive) {
        next = next.map((k) =>
          k.id === existingActive.id ? { ...k, isActive: false, endedAt: today } : k
        )
      }
      return next
    })
    setTambahPenugasanOpen(false)
    setPenugasanForm({ opdId: '', name: '', nip: '', email: '' })
  }

  const savePindahJabatan = () => {
    if (!pindahDialogPerson || !pindahForm.opdId) return
    const today = new Date().toISOString().slice(0, 10)
    const { name, email, phone } = pindahDialogPerson
    const currentActive = kepalaList.find(
      (k) => k.name === name && (k.email ?? '') === email && k.isActive
    )
    const existingActiveAtTarget = getKepalaAktif(pindahForm.opdId)
    const newKepala: KepalaOPD = {
      id: generateId('k'),
      opdId: pindahForm.opdId,
      name,
      nip: currentActive?.nip ?? pindahDialogPerson.nip ?? '',
      email,
      phone,
      isActive: true,
      totalSOP: 0,
    }
    setKepalaList((prev) => {
      let next = [...prev, newKepala]
      if (currentActive) {
        next = next.map((k) => (k.id === currentActive.id ? { ...k, isActive: false, endedAt: today } : k))
      }
      if (existingActiveAtTarget) {
        next = next.map((k) =>
          k.id === existingActiveAtTarget.id ? { ...k, isActive: false, endedAt: today } : k
        )
      }
      return next
    })
    setPindahDialogOpen(false)
    setPindahDialogPerson(null)
    setPindahForm({ opdId: '' })
  }

  const setKepalaAktif = (kepalaId: string) => {
    const k = kepalaList.find((x) => x.id === kepalaId)
    if (!k) return
    const today = new Date().toISOString().slice(0, 10)
    setKepalaList((prev) =>
      prev.map((x) => {
        if (x.opdId !== k.opdId) return x
        if (x.id === kepalaId) return { ...x, isActive: true, endedAt: undefined }
        return { ...x, isActive: false, endedAt: x.endedAt || today }
      })
    )
  }

  const akhiriJabatan = (kepalaId: string) => {
    const today = new Date().toISOString().slice(0, 10)
    setKepalaList((prev) =>
      prev.map((k) => (k.id === kepalaId ? { ...k, isActive: false, endedAt: today } : k))
    )
  }

  const deleteKepala = (id: string) => {
    const k = kepalaList.find((x) => x.id === id)
    if (k && k.totalSOP > 0) return
    setDeleteKepalaId(id)
  }

  const doDeleteKepala = (id: string) => {
    setKepalaList((prev) => prev.filter((x) => x.id !== id))
    setKepalaFormOpen(false)
  }

  const onConfirmCreate = () => {
    if (formData.name) {
      setOpdList((prev) => [
        ...prev,
        {
          id: generateId(),
          name: formData.name,
          email: '',
          phone: '',
          totalSOP: 0,
          sopBerlaku: 0,
          sopDraft: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ])
    }
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const onConfirmEdit = () => {
    if (selectedOPD) {
      setOpdList((prev) =>
        prev.map((opd) => (opd.id === selectedOPD.id ? { ...opd, name: formData.name } : opd))
      )
    }
    setIsEditDialogOpen(false)
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen OPD' }]}
      title="Manajemen OPD"
      description="Kelola data organisasi perangkat daerah dan penugasan kepala OPD"
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
                setPenugasanForm({ opdId: opdList[0]?.id ?? '', name: '', nip: '', email: '' })
                setTambahPenugasanOpen(true)
              }}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Tambah OPD
            </Button>
          )}
        </SearchToolbar>
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'opd' | 'penugasan')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 w-full">
          <TabsTrigger value="opd" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Manajemen OPD
          </TabsTrigger>
          <TabsTrigger value="penugasan" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            OPD
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

        <TabsContent value="penugasan" className="space-y-3 mt-3">
          <KepalaOPDTab
            opdList={opdList}
            filteredPersons={filteredPersons}
            kepalaFormOpen={kepalaFormOpen}
            setKepalaFormOpen={setKepalaFormOpen}
            tambahPenugasanOpen={tambahPenugasanOpen}
            setTambahPenugasanOpen={setTambahPenugasanOpen}
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
            penugasanForm={penugasanForm}
            setPenugasanForm={setPenugasanForm}
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
            onSavePenugasan={savePenugasanKepala}
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
        onConfirm={() => {
          if (deleteOpdId) {
            setOpdList((prev) => prev.filter((o) => o.id !== deleteOpdId))
            setDeleteOpdId(null)
          }
        }}
      />

      <ConfirmDialog
        open={deleteKepalaId != null}
        onOpenChange={(open) => !open && setDeleteKepalaId(null)}
        title="Hapus riwayat penugasan?"
        description={
          deleteKepalaId
            ? `Riwayat penugasan "${kepalaList.find((k) => k.id === deleteKepalaId)?.name ?? ''}" akan dihapus permanen.`
            : undefined
        }
        onConfirm={() => {
          if (deleteKepalaId) {
            doDeleteKepala(deleteKepalaId)
            setDeleteKepalaId(null)
          }
        }}
      />
    </ListPageLayout>
  )
}
