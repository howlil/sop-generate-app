import { useState } from 'react'
import { Building2, Plus, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useToast } from '@/utils/ui'
import { useOpd } from '@/features/organisasi'
import { OPDTab } from './manajemen-opd/OPDTab'
import { KepalaOPDTab } from './manajemen-opd/KepalaOPDTab'

// UI-only types for this page (not server types)
export interface OPD {
  id: string
  name: string
  email?: string
  phone?: string
  totalSOP?: number
  sopBerlaku?: number
  sopDraft?: number
  createdAt?: string
  _count?: { sop: number; pengguna: number; pengajuanEvaluasi: number }
}

export interface KepalaOPD {
  id: string
  name: string
  nip?: string
  email?: string
  phone?: string
  opdId?: string
  isActive?: boolean
  endedAt?: string
  totalSOP?: number
}

// Local utility functions
function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function hasRelasiData(opd: OPD): boolean {
  if (!opd._count) return false
  return (opd._count.sop > 0 || opd._count.pengguna > 0 || opd._count.pengajuanEvaluasi > 0)
}

function canDeleteKepala(kepala: any): boolean {
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
    _count: o._count as any,
  }))
  const [kepalaList, setKepalaList] = useState<KepalaOPD[]>([])
  const [deleteOpdId, setDeleteOpdId] = useState<string | null>(null)
  const [deleteKepalaId, setDeleteKepalaId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [riwayatKepalaOpen, setRiwayatKepalaOpen] = useState(false)
  
  // Local state management (replacing useManajemenOPDState)
  const [kepalaFormOpen, setKepalaFormOpen] = useState(false)
  const [tambahKepalaOpen, setTambahKepalaOpen] = useState(false)
  const [pindahDialogOpen, setPindahDialogOpen] = useState(false)
  const [riwayatDialogOpen, setRiwayatDialogOpen] = useState(false)
  const [editingKepala, setEditingKepala] = useState<any>(null)
  const [kepalaForm, setKepalaForm] = useState<any>({})
  const [formTambahKepala, setFormTambahKepala] = useState<any>({})
  const [pindahForm, setPindahForm] = useState<any>({})
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<any>(null)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<any>(null)

  // Simple filtering (replacing useManajemenOPDData)
  const filteredOPD = opdList.filter((opd) =>
    opd.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPersons = kepalaList.filter((kepala: any) =>
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
      setKepalaList((prev: KepalaOPD[]) => {
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

  const saveTambahKepala = () => {
    const today = new Date().toISOString().slice(0, 10)
    if (!formTambahKepala.opdId || !formTambahKepala.name) return
    const existingActive = getKepalaAktif(formTambahKepala.opdId)
    const newKepala: KepalaOPD = {
      id: generateId('k'),
      opdId: formTambahKepala.opdId,
      name: formTambahKepala.name,
      nip: formTambahKepala.nip,
      email: formTambahKepala.email,
      phone: '',
      isActive: true,
      totalSOP: 0,
    }
    setKepalaList((prev: KepalaOPD[]) => {
      let next = [...prev, newKepala]
      if (existingActive) {
        next = next.map((k) =>
          k.id === existingActive.id ? { ...k, isActive: false, endedAt: today } : k
        )
      }
      return next
    })
    setTambahKepalaOpen(false)
    setFormTambahKepala({ opdId: '', name: '', nip: '', email: '' })
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
    setKepalaList((prev: KepalaOPD[]) => {
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
    if (k && (k.totalSOP ?? 0) > 0) return
    setDeleteKepalaId(id)
  }

  const doDeleteKepala = (id: string) => {
    setKepalaList((prev) => prev.filter((x) => x.id !== id))
    setKepalaFormOpen(false)
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
              Tambah OPD
            </Button>
          )}
        </SearchToolbar>
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'opd' | 'kepala')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 w-full">
          <TabsTrigger value="opd" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Manajemen OPD
          </TabsTrigger>
          <TabsTrigger value="kepala" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            OPD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opd" className="space-y-3 mt-3">
          <OPDTab
            filteredOPD={filteredOPD as any}
            opdList={opdList as any}
            selectedOPD={selectedOPD as any}
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
            getKepalaAktif={getKepalaAktif as any}
            getKepalaByOPD={getKepalaByOPD as any}
            hasRelasiData={hasRelasiData as any}
            onOpenDetail={(opd: any) => {
              setSelectedOPD(opd)
              setIsDetailDialogOpen(true)
            }}
            onOpenEdit={openEditDialog as any}
            onOpenRiwayat={(opd: any) => {
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
            opdList={opdList as any}
            filteredPersons={filteredPersons as any}
            kepalaFormOpen={kepalaFormOpen}
            setKepalaFormOpen={setKepalaFormOpen}
            tambahKepalaOpen={tambahKepalaOpen}
            setTambahKepalaOpen={setTambahKepalaOpen}
            pindahDialogOpen={pindahDialogOpen}
            setPindahDialogOpen={setPindahDialogOpen}
            setPindahDialogPerson={setPindahDialogPerson as any}
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
            selectedOPD={selectedOPD as any}
            setSelectedOPD={setSelectedOPD as any}
            getKepalaAktif={getKepalaAktif as any}
            getKepalaByOPD={getKepalaByOPD as any}
            getRiwayatForUser={getRiwayatForUser as any}
            canDeleteKepala={canDeleteKepala as any}
            onSaveKepala={saveKepala}
            onSaveTambahKepala={saveTambahKepala}
            onSavePindah={savePindahJabatan}
            onOpenKepalaForm={openKepalaForm as any}
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
        title="Hapus riwayat jabatan?"
        description={
          deleteKepalaId
            ? `Riwayat jabatan "${kepalaList.find((k) => k.id === deleteKepalaId)?.name ?? ''}" akan dihapus permanen.`
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
