import { useState } from 'react'
import { Building2, Plus, UserCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { showErrorMessages, useToast } from '@/utils/toast'
import { useOpd } from '@/features/organisasi'
import { useRiwayatJabatan, useSetKepalaAktif, useAkhiriJabatan, usePindahJabatan } from '@/features/auth/hooks/useJabatan'
import type { OPDUI as OPD } from '@/features/organisasi/types/ui'
import type { FormTambahKepalaState } from '@/types/common'
import { OPDTab } from './components/OPDTab'
import { KepalaOPDTab } from './components/KepalaOPDTab'
import type {
  KepalaOPDRow as KepalaAssignment,
  KepalaCandidate,
  PersonWithActive,
  PindahDialogPersonState,
  RiwayatRow,
} from './components/types'

type KepalaFormState = { name: string; nip: string; email: string; phone: string }
type RiwayatDialogPersonState = { name: string; email: string; nip?: string }
type OpdNameLookup = Map<string, string>

const NOT_FOUND_OPD_LABEL = 'OPD tidak ditemukan'
const EMPTY_KEPALA_FORM: KepalaFormState = { name: '', nip: '', email: '', phone: '' }
const EMPTY_TAMBAH_KEPALA_FORM: FormTambahKepalaState = { opdId: '', userId: '' }
const EMPTY_PINDAH_FORM = { opdId: '' }

// Local utility functions
function hasRelasiData(opd: OPD): boolean {
  if (!opd._count) return false
  return (opd._count.sop > 0 || opd._count.pengguna > 0 || opd._count.pengajuanEvaluasi > 0)
}

function canDeleteKepala(kepala: { totalSOP?: number }): boolean {
  return !kepala.totalSOP || kepala.totalSOP === 0
}

function getOpdName(opdNameById: OpdNameLookup, opdId?: string): string {
  if (!opdId) return NOT_FOUND_OPD_LABEL
  return opdNameById.get(opdId) ?? NOT_FOUND_OPD_LABEL
}

function buildKepalaCandidates(kepalaList: KepalaAssignment[]): KepalaCandidate[] {
  return kepalaList.map((k) => ({
    id: k.id,
    nama: k.name,
    email: k.email ?? '',
    nip: k.nip ?? '',
  }))
}

function buildFilteredPersons(
  kepalaList: KepalaAssignment[],
  opdNameById: OpdNameLookup,
  searchUserQuery: string,
): PersonWithActive[] {
  return Array.from(
    new Map(
      kepalaList.map((k) => [
        `${k.name}|${k.email}`,
        {
          name: k.name,
          email: k.email ?? '',
          phone: k.phone ?? '',
          nip: k.nip ?? '',
          activeAssignment:
            k.isActive && k.opdId
              ? {
                  id: k.id,
                  name: k.name,
                  nip: k.nip ?? '',
                  startDate: k.startDate,
                  endDate: k.endDate,
                  endedAt: k.endedAt,
                  totalSOP: k.totalSOP,
                  opdId: k.opdId,
                  opdName: getOpdName(opdNameById, k.opdId),
                }
              : undefined,
        } satisfies PersonWithActive,
      ]),
    ).values(),
  ).filter((kepala) => kepala.name.toLowerCase().includes(searchUserQuery.toLowerCase()))
}

function buildRiwayatRows(
  kepalaList: KepalaAssignment[],
  opdNameById: OpdNameLookup,
  name: string,
  email: string,
): RiwayatRow[] {
  return kepalaList
    .filter((k) => k.name === name && k.email === email)
    .map((k) => ({
      ...k,
      opdName: getOpdName(opdNameById, k.opdId),
    }))
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

  // Fetch Kepala OPD riwayat jabatan dari API jabatan
  const { data: riwayatJabatan } = useRiwayatJabatan()
  const kepalaList: KepalaAssignment[] =
    riwayatJabatan?.map((u) => ({
      id: u.id,
      name: u.nama,
      nip: u.nip,
      email: u.email,
      phone: u.nohp,
      opdId: u.opdId ?? undefined,
      isActive: u.isActive,
      startDate: u.updatedAt,
      endDate: undefined,
      endedAt: undefined,
      totalSOP: u.totalSopDisusun,
    })) ?? []

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
  const [editingKepala, setEditingKepala] = useState<KepalaAssignment | null>(null)
  const [kepalaForm, setKepalaForm] = useState<KepalaFormState>(EMPTY_KEPALA_FORM)
  const [formTambahKepala, setFormTambahKepala] = useState<FormTambahKepalaState>(EMPTY_TAMBAH_KEPALA_FORM)
  const [pindahForm, setPindahForm] = useState<{ opdId: string }>(EMPTY_PINDAH_FORM)
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<RiwayatDialogPersonState | null>(null)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<PindahDialogPersonState | null>(null)

  // Simple filtering
  const opdNameById: OpdNameLookup = new Map(opdList.map((opd) => [opd.id, opd.name]))
  const filteredOPD = opdList.filter((opd) =>
    opd.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPersons = buildFilteredPersons(kepalaList, opdNameById, searchUserQuery)
  const kepalaCandidates = buildKepalaCandidates(kepalaList)

  const getKepalaAktif = (opdId: string): KepalaAssignment | undefined =>
    kepalaList.find((k) => (!opdId || k.opdId === opdId) && k.isActive)
  const getKepalaByOPD = (opdId: string): KepalaAssignment[] =>
    kepalaList.filter((k) => k.opdId === opdId)
  const getRiwayatForUser = (_name: string, _email: string) =>
    buildRiwayatRows(kepalaList, opdNameById, _name, _email)

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

  const openKepalaForm = (kepala?: { id: string; name: string; nip?: string; email?: string; phone?: string }) => {
    if (kepala) {
      setEditingKepala({
        id: kepala.id,
        name: kepala.name,
        nip: kepala.nip,
        email: kepala.email ?? "",
        phone: kepala.phone ?? "",
      })
      setKepalaForm({
        name: kepala.name,
        nip: kepala.nip ?? '',
        email: kepala.email ?? '',
        phone: kepala.phone ?? '',
      })
    } else {
      setEditingKepala(null)
      setKepalaForm(EMPTY_KEPALA_FORM)
    }
    setKepalaFormOpen(true)
  }

  const closeTambahKepalaDialog = () => {
    setTambahKepalaOpen(false)
    setFormTambahKepala(EMPTY_TAMBAH_KEPALA_FORM)
  }

  const closePindahDialog = () => {
    setPindahDialogOpen(false)
    setPindahDialogPerson(null)
    setPindahForm(EMPTY_PINDAH_FORM)
  }

  const runJabatanMutationSafely = async (
    action: () => Promise<void>,
    fallbackMessage: string,
  ) => {
    try {
      await action()
      return true
    } catch (error: unknown) {
      showErrorMessages(error, fallbackMessage)
      return false
    }
  }

  const deleteKepala = (id: string) => setDeleteKepalaId(id)

  const doDeleteKepala = async (id: string) => {
    const success = await runJabatanMutationSafely(
      // Use akhiriJabatan to end the tenure, NOT deleteUser which deletes the entire account
      async () => {
        await akhiriJabatanMutation(id)
      },
      'Gagal mengakhiri jabatan Kepala OPD',
    )
    if (success) {
      showToast('Jabatan Kepala OPD berhasil diakhiri', 'success')
    }
    setDeleteKepalaId(null)
  }

  // Real API-based jabatan operations
  const saveKepala = async () => {
    if (!selectedOPD || !kepalaForm.name) return
    const success = await runJabatanMutationSafely(async () => {
      await setKepalaAktifMutation({ userId: editingKepala?.id ?? '', opdId: selectedOPD.id })
    }, 'Gagal menyimpan Kepala OPD')
    if (success) {
      setKepalaFormOpen(false)
    }
  }

  const saveTambahKepala = async () => {
    if (!formTambahKepala.opdId || !formTambahKepala.userId) return

    const success = await runJabatanMutationSafely(async () => {
      await setKepalaAktifMutation({
        userId: formTambahKepala.userId,
        opdId: formTambahKepala.opdId,
      })
    }, 'Gagal menambah Kepala OPD')
    if (success) {
      closeTambahKepalaDialog()
    }
  }

  const savePindahJabatan = async () => {
    if (!pindahDialogPerson || !pindahForm.opdId) return
    const success = await runJabatanMutationSafely(async () => {
      await pindahJabatanMutation({ userId: pindahDialogPerson.id, opdId: pindahForm.opdId })
    }, 'Gagal memindah jabatan')
    if (success) {
      closePindahDialog()
    }
  }

  const setKepalaAktif = async (kepalaId: string) => {
    const k = kepalaList.find((x) => x.id === kepalaId)
    if (!k?.opdId) return
    const opdId = k.opdId
    await runJabatanMutationSafely(async () => {
      await setKepalaAktifMutation({ userId: kepalaId, opdId })
    }, 'Gagal mengatur Kepala OPD')
  }

  const akhiriJabatan = async (kepalaId: string) => {
    await runJabatanMutationSafely(async () => {
      await akhiriJabatanMutation(kepalaId)
    }, 'Gagal mengakhiri jabatan')
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
                setFormTambahKepala({ ...EMPTY_TAMBAH_KEPALA_FORM, opdId: opdList[0]?.id ?? '' })
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
            kepalaCandidates={kepalaCandidates}
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
