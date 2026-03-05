import { useState } from 'react'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  MoreVertical,
  UserCheck,
  ArrowRightCircle,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDateId, formatDateIdLong } from '@/utils/format-date'
import { SEED_OPD_LIST, SEED_KEPALA_LIST } from '@/lib/seed/opd-seed'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { showToast } from '@/lib/stores'
import { generateId } from '@/utils/generate-id'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'

export function ManajemenOPD() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null)

  const [opdList, setOpdList] = useState<OPD[]>(() => [...SEED_OPD_LIST])
  const [kepalaList, setKepalaList] = useState<KepalaOPD[]>(() => [...SEED_KEPALA_LIST])
  const [deleteOpdId, setDeleteOpdId] = useState<string | null>(null)
  const [deleteKepalaId, setDeleteKepalaId] = useState<string | null>(null)

  const getKepalaAktif = (opdId: string) => kepalaList.find((k) => k.opdId === opdId && k.isActive)
  const getKepalaByOPD = (opdId: string) => kepalaList.filter((k) => k.opdId === opdId)

  const [formData, setFormData] = useState({ name: '' })

  const filteredOPD = opdList.filter(
    (opd) =>
      opd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getKepalaAktif(opd.id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasRelasiData = (opd: OPD) => opd.totalSOP > 0
  const canDeleteKepala = (k: KepalaOPD) => k.totalSOP === 0

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

  const openEditDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setFormData({ name: opd.name })
    setIsEditDialogOpen(true)
  }

  const openDetailDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setIsDetailDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '' })
  }

  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'opd' | 'penugasan'>('opd')
  const [riwayatKepalaOpen, setRiwayatKepalaOpen] = useState(false)
  const [kepalaFormOpen, setKepalaFormOpen] = useState(false)
  const [tambahPenugasanOpen, setTambahPenugasanOpen] = useState(false)
  const [editingKepala, setEditingKepala] = useState<KepalaOPD | null>(null)
  const [kepalaForm, setKepalaForm] = useState({ name: '', nip: '', email: '', phone: '' })
  const [penugasanForm, setPenugasanForm] = useState({ opdId: '', name: '', nip: '', email: '' })
  const [riwayatDialogOpen, setRiwayatDialogOpen] = useState(false)
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<{ name: string; email: string } | null>(null)
  const [pindahDialogOpen, setPindahDialogOpen] = useState(false)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<{ name: string; email: string; phone: string; nip?: string } | null>(null)
  const [pindahForm, setPindahForm] = useState({ opdId: '' })

  const openRiwayatKepala = (opd: OPD) => {
    setSelectedOPD(opd)
    setRiwayatKepalaOpen(true)
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
    const currentActive = kepalaList.find((k) => k.name === name && (k.email ?? '') === email && k.isActive)
    const existingActiveAtTarget = getKepalaAktif(pindahForm.opdId)
    const newKepala: KepalaOPD = {
      id: generateId('k'),
      opdId: pindahForm.opdId,
      name,
      nip: currentActive?.nip ?? (pindahDialogPerson as { nip?: string }).nip ?? '',
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
        next = next.map((k) => (k.id === existingActiveAtTarget.id ? { ...k, isActive: false, endedAt: today } : k))
      }
      return next
    })
    setPindahDialogOpen(false)
    setPindahDialogPerson(null)
    setPindahForm({ opdId: '' })
  }

  const uniqueUsers = Array.from(
    new Map(kepalaList.map((k) => [k.name.trim() + '|' + (k.email ?? ''), { name: k.name, email: k.email ?? '' }])).values()
  )
  /** Satu baris per Kepala OPD (person). Satu orang hanya 1 jabatan aktif; punya banyak riwayat jabatan. */
  const personsWithActive: Array<{
    name: string
    email: string
    phone: string
    nip: string
    activeAssignment?: KepalaOPD & { opdName: string }
  }> = uniqueUsers.map((u) => {
    const first = kepalaList.find((k) => k.name === u.name && (k.email ?? '') === u.email)
    const active = kepalaList.find((k) => k.name === u.name && (k.email ?? '') === u.email && k.isActive)
    return {
      name: u.name,
      email: u.email,
      phone: first?.phone ?? '',
      nip: first?.nip ?? '',
      activeAssignment: active
        ? { ...active, opdName: opdList.find((o) => o.id === active.opdId)?.name ?? active.opdId }
        : undefined,
    }
  })
  const filteredPersons = personsWithActive.filter(
    (p) =>
      p.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      (p.nip ?? '').includes(searchUserQuery) ||
      (p.activeAssignment?.opdName ?? '').toLowerCase().includes(searchUserQuery.toLowerCase())
  )
  const getRiwayatForUser = (name: string, email: string) =>
    kepalaList
      .filter((k) => k.name === name && (k.email ?? '') === email)
      .map((k) => ({
        ...k,
        opdName: opdList.find((o) => o.id === k.opdId)?.name ?? k.opdId,
      }))
      .sort((a, b) => ((b.endedAt ?? '') < (a.endedAt ?? '') ? 1 : -1))
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

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen OPD' }]}
      title="Manajemen OPD"
      description="Kelola data organisasi perangkat daerah dan penugasan kepala OPD"
      toolbar={
        <SearchToolbar
          searchPlaceholder={activeTab === 'opd' ? 'Cari OPD, kode, atau penanggung jawab...' : 'Cari OPD atau nama kepala...'}
          searchValue={activeTab === 'opd' ? searchQuery : searchUserQuery}
          onSearchChange={(e) => (activeTab === 'opd' ? setSearchQuery(e.target.value) : setSearchUserQuery(e.target.value))}
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
              Tambah Kepala OPD
            </Button>
          )}
        </SearchToolbar>
      }
    >
      {/* Tab mengarahkan ke Manajemen OPD / Kepala OPD */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'opd' | 'penugasan')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 w-full">
          <TabsTrigger value="opd" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Manajemen OPD
          </TabsTrigger>
          <TabsTrigger value="penugasan" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Kepala OPD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opd" className="space-y-3 mt-3">
          <Table.Card className="w-full">
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Nama OPD</Table.Th>
                  <Table.Th align="center">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {filteredOPD.map((opd) => (
                  <Table.BodyRow key={opd.id}>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="font-medium text-gray-900">{opd.name}</p>
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0"><MoreVertical className="w-3.5 h-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => openDetailDialog(opd)}><Eye className="w-3.5 h-3.5 mr-2" />Lihat Detail</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(opd)}><Edit className="w-3.5 h-3.5 mr-2" />Edit OPD</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRiwayatKepala(opd)}><Users className="w-3.5 h-3.5 mr-2" />Riwayat Kepala OPD</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(opd.id)} className="text-red-600" disabled={hasRelasiData(opd)} title={hasRelasiData(opd) ? 'OPD yang sudah mengait SOP tidak dapat dihapus' : undefined}><Trash2 className="w-3.5 h-3.5 mr-2" />{hasRelasiData(opd) ? 'Hapus (ditolak: ada SOP)' : 'Hapus OPD'}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          </Table.Card>
        </TabsContent>

        <TabsContent value="penugasan" className="space-y-3 mt-3">
          <Table.Card className="w-full">
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Nama Kepala</Table.Th>
                  <Table.Th>NIP</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Jabatan Aktif</Table.Th>
                  <Table.Th align="center">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {filteredPersons.map((p) => {
                  const act = p.activeAssignment
                  return (
                    <Table.BodyRow key={`${p.name}|${p.email}`}>
                      <Table.Td className="font-medium text-gray-900">{p.name}</Table.Td>
                      <Table.Td className="text-gray-600 font-mono text-xs">{p.nip || '—'}</Table.Td>
                      <Table.Td className="text-gray-600">{p.email}</Table.Td>
                      <Table.Td>{act?.opdName ?? '—'}</Table.Td>
                      <Table.Td>
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="icon-sm" className="h-7 w-7 p-0" onClick={() => { setRiwayatDialogPerson({ name: p.name, email: p.email }); setRiwayatDialogOpen(true); }} title="Riwayat jabatan">
                            <History className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 p-0"
                            title="Pindah jabatan"
                            onClick={() => {
                              setPindahDialogPerson({ name: p.name, email: p.email, phone: p.phone, nip: p.nip })
                              setPindahForm({ opdId: '' })
                              setPindahDialogOpen(true)
                            }}
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 p-0"
                            title="Ubah"
                            onClick={() => {
                              if (act) {
                                setSelectedOPD(opdList.find((o) => o.id === act.opdId) ?? null)
                                openKepalaForm(act)
                              }
                            }}
                            disabled={!act}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                  )
                })}
              </tbody>
            </Table.Table>
          </Table.Card>
          {filteredPersons.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-xs">
              Belum ada data Kepala OPD. Gunakan &quot;Tambah Kepala OPD&quot; atau dari tab Manajemen OPD pilih OPD → Riwayat Kepala OPD.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah OPD Baru"
        description="Lengkapi form berikut untuk menambah OPD baru"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={() => {
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
        }}
        confirmDisabled={!formData.name}
        size="md"
      >
        <FormField label="Nama OPD" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Dinas Pendidikan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit OPD"
        description="Perbarui informasi OPD"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={() => {
          if (selectedOPD) {
            setOpdList(
              opdList.map((opd) =>
                opd.id === selectedOPD.id ? { ...opd, name: formData.name } : opd
              )
            )
          }
          setIsEditDialogOpen(false)
        }}
        confirmDisabled={!formData.name}
        size="md"
      >
        <FormField label="Nama OPD" required>
          <Input
            className="h-9 text-xs"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormField>
      </FormDialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-gray-900">Detail OPD</DialogTitle>
          </DialogHeader>
          {selectedOPD && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{selectedOPD.name}</h3>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Kepala (aktif)</span>
                  <span className="font-medium text-gray-900">{getKepalaAktif(selectedOPD.id)?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Email OPD</span>
                  <span className="font-medium text-gray-900 break-all text-right">{selectedOPD.email}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Telepon</span>
                  <span className="font-medium text-gray-900">{selectedOPD.phone}</span>
                </div>
                <div className="flex justify-between gap-3 pt-1 border-t border-gray-200/80">
                  <span className="text-gray-500">Dibuat</span>
                  <span className="font-medium text-gray-900">
                    {formatDateIdLong(selectedOPD.createdAt)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-blue-50 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium mb-1">Total SOP</p>
                <p className="text-lg font-semibold text-gray-900">{selectedOPD.totalSOP}</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Riwayat Kepala OPD</h4>
                <div className="space-y-2">
                  {getKepalaByOPD(selectedOPD.id).map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-200 text-xs">
                      <div>
                        <span className="font-medium text-gray-900">{k.name}</span>
                        {k.nip && <span className="block text-gray-500 font-mono text-[10px] mt-0.5">{k.nip}</span>}
                      </div>
                      <StatusBadge status={k.isActive ? 'Aktif' : 'Nonaktif'} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
                    </div>
                  ))}
                  {getKepalaByOPD(selectedOPD.id).length === 0 && (
                    <p className="text-gray-500 text-xs py-2">Belum ada kepala OPD</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsDetailDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Riwayat Kepala OPD Dialog — hanya lihat, tanpa aksi tambah/edit/hapus */}
      <Dialog open={riwayatKepalaOpen} onOpenChange={setRiwayatKepalaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat Kepala OPD — {selectedOPD?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Daftar riwayat kepala OPD untuk OPD ini. Hanya untuk melihat; penugasan baru atau perubahan dikelola dari tab Penugasan atau Manajemen OPD.
            </DialogDescription>
          </DialogHeader>
          {selectedOPD && (
            <>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50/50">
                {getKepalaByOPD(selectedOPD.id).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada riwayat kepala OPD</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {getKepalaByOPD(selectedOPD.id).map((k) => (
                      <li key={k.id} className="bg-white px-4 py-3 hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm">{k.name}</p>
                            {k.nip && <p className="text-xs text-gray-600 mt-0.5 font-mono">{k.nip}</p>}
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{k.email}</p>
                            {k.phone && (
                              <p className="text-xs text-gray-400 mt-0.5">{k.phone}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <StatusBadge status={k.isActive ? 'Aktif' : 'Nonaktif'} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
                            {k.endedAt && (
                              <span className="text-xs text-gray-500">Selesai: {formatDateId(k.endedAt)}</span>
                            )}
                            <span className="text-[10px] text-gray-400">{k.totalSOP} SOP</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setRiwayatKepalaOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Tambah/Edit Kepala OPD */}
      <FormDialog
        open={kepalaFormOpen}
        onOpenChange={setKepalaFormOpen}
        title={editingKepala ? 'Edit Kepala OPD' : 'Tambah Kepala OPD'}
        description={selectedOPD && !editingKepala ? `OPD: ${selectedOPD.name}` : undefined}
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={saveKepala}
        confirmDisabled={!kepalaForm.name}
        size="md"
      >
        <FormField label="Nama" required>
          <Input className="h-9 text-xs" value={kepalaForm.name} onChange={(e) => setKepalaForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap dengan gelar" />
        </FormField>
        <FormField label="NIP">
          <Input className="h-9 text-xs" value={kepalaForm.nip} onChange={(e) => setKepalaForm((f) => ({ ...f, nip: e.target.value }))} placeholder="Contoh: 197503152000032001" />
        </FormField>
        <FormField label="Email">
          <Input type="email" className="h-9 text-xs" value={kepalaForm.email} onChange={(e) => setKepalaForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@pemda.go.id" />
        </FormField>
        <FormField label="Telepon">
          <Input className="h-9 text-xs" value={kepalaForm.phone} onChange={(e) => setKepalaForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0812-xxxx-xxxx" />
        </FormField>
      </FormDialog>

      {/* Tambah Kepala OPD: hanya Kepala baru */}
      <FormDialog
        open={tambahPenugasanOpen}
        onOpenChange={setTambahPenugasanOpen}
        title="Tambah Kepala OPD"
        description="Isi data Kepala OPD baru dan pilih OPD tujuan."
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={savePenugasanKepala}
        confirmDisabled={!penugasanForm.opdId || !penugasanForm.name}
        size="md"
      >
        <FormField label="OPD" required>
          <Select
            value={penugasanForm.opdId}
            onValueChange={(opdId) => setPenugasanForm((f) => ({ ...f, opdId }))}
            placeholder="Pilih OPD"
            options={opdList.map((opd) => ({ value: opd.id, label: opd.name }))}
          />
        </FormField>
        <FormField label="Nama Kepala" required>
          <Input className="h-9 text-xs" value={penugasanForm.name} onChange={(e) => setPenugasanForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap dengan gelar" />
        </FormField>
        <FormField label="NIP">
          <Input className="h-9 text-xs" value={penugasanForm.nip} onChange={(e) => setPenugasanForm((f) => ({ ...f, nip: e.target.value }))} placeholder="Contoh: 197503152000032001" />
        </FormField>
        <FormField label="Email">
          <Input type="email" className="h-9 text-xs" value={penugasanForm.email} onChange={(e) => setPenugasanForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@pemda.go.id" />
        </FormField>
      </FormDialog>

      {/* Pindah jabatan: per Kepala OPD (orang), pilih OPD tujuan */}
      <FormDialog
        open={pindahDialogOpen}
        onOpenChange={(open) => {
          setPindahDialogOpen(open)
          if (!open) {
            setPindahDialogPerson(null)
            setPindahForm({ opdId: '' })
          }
        }}
        title="Pindah jabatan"
        description="Pindahkan kepala OPD ini ke OPD lain. Jabatan aktif saat ini (jika ada) akan berakhir; penugasan baru dimulai di OPD tujuan."
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={savePindahJabatan}
        confirmDisabled={!pindahForm.opdId}
        size="md"
      >
        {pindahDialogPerson && (
          <>
            <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs">
              <p className="font-medium text-gray-900">{pindahDialogPerson.name}</p>
              {pindahDialogPerson.nip && <p className="text-gray-600 font-mono">{pindahDialogPerson.nip}</p>}
              <p className="text-gray-600">{pindahDialogPerson.email}</p>
            </div>
            <FormField label="OPD tujuan" required>
              <Select
                value={pindahForm.opdId}
                onValueChange={(opdId) => setPindahForm((f) => ({ ...f, opdId }))}
                placeholder="Pilih OPD"
                options={opdList
                  .filter((opd) => !getKepalaAktif(opd.id))
                  .map((opd) => ({ value: opd.id, label: opd.name }))}
              />
              <p className="text-xs text-gray-500 mt-1">Hanya OPD yang belum memiliki kepala yang dapat dipilih.</p>
            </FormField>
          </>
        )}
      </FormDialog>

      {/* Riwayat jabatan per orang (popup dari tab Penugasan) */}
      <Dialog
        open={riwayatDialogOpen}
        onOpenChange={(open) => {
          setRiwayatDialogOpen(open)
          if (!open) setRiwayatDialogPerson(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat jabatan</DialogTitle>
            <DialogDescription className="text-xs">
              {riwayatDialogPerson ? `${riwayatDialogPerson.name} — ${riwayatDialogPerson.email}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 min-h-0 border border-gray-200 rounded-md">
            {riwayatDialogPerson && (
              <Table.Table>
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <Table.HeadRow>
                    <Table.Th>OPD</Table.Th>
                    <Table.Th align="center">Selesai</Table.Th>
                    <Table.Th align="center">Status</Table.Th>
                    <Table.Th align="center">Aksi</Table.Th>
                  </Table.HeadRow>
                </thead>
                <tbody>
                  {getRiwayatForUser(riwayatDialogPerson.name, riwayatDialogPerson.email).map((r) => (
                    <Table.BodyRow key={r.id}>
                      <Table.Td>{r.opdName}</Table.Td>
                      <Table.Td className="text-center">{r.endedAt ? formatDateId(r.endedAt) : '—'}</Table.Td>
                      <Table.Td className="text-center">
                        <StatusBadge status={r.isActive ? 'Aktif' : 'Nonaktif'} domain={STATUS_DOMAIN.TIM_PENYUSUN} />
                      </Table.Td>
                      <Table.Td>
                        <div className="flex gap-1 justify-center flex-wrap">
                          {r.isActive && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => akhiriJabatan(r.id)}>Akhiri jabatan</Button>
                          )}
                          {!r.isActive && getKepalaByOPD(r.opdId).some((k) => k.id !== r.id && k.isActive) && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setKepalaAktif(r.id)}>Jadikan Aktif</Button>
                          )}
                          <Button variant="ghost" size="icon-sm" className="h-6 w-6 p-0" title="Ubah" onClick={() => { setRiwayatDialogOpen(false); setSelectedOPD(opdList.find((o) => o.id === r.opdId) ?? null); openKepalaForm(r); }}><Edit className="w-3 h-3" /></Button>
                          <Button variant="ghost" size="icon-sm" className="h-6 w-6 p-0 text-red-600" title="Hapus" onClick={() => deleteKepala(r.id)} disabled={!canDeleteKepala(r)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                  ))}
                </tbody>
              </Table.Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setRiwayatDialogOpen(false); setRiwayatDialogPerson(null); }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
