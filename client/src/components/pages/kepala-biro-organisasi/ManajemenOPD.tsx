import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface OPD {
  id: string
  name: string
  code: string
  category: string
  email: string
  phone: string
  totalSOP: number
  sopBerlaku: number
  sopDraft: number
  createdAt: string
}

/** Riwayat Kepala OPD per OPD. Status aktif/nonaktif ada di sini. */
interface KepalaOPD {
  id: string
  opdId: string
  name: string
  nip: string
  email: string
  phone: string
  isActive: boolean
  startedAt: string
  endedAt?: string
  /** SOP yang dibuat saat kepala ini aktif (untuk constraint hapus). */
  totalSOP: number
}

export function ManajemenOPD() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null)

  const [opdList, setOpdList] = useState<OPD[]>([
    { id: '1', name: 'Dinas Pendidikan', code: 'DISDIK', category: 'Dinas', email: 'disdik@pemda.go.id', phone: '0812-3456-7890', totalSOP: 245, sopBerlaku: 220, sopDraft: 12, createdAt: '2024-01-15' },
    { id: '2', name: 'Dinas Kesehatan', code: 'DINKES', category: 'Dinas', email: 'dinkes@pemda.go.id', phone: '0812-9876-5432', totalSOP: 189, sopBerlaku: 170, sopDraft: 8, createdAt: '2024-01-15' },
    { id: '3', name: 'Dinas Perhubungan', code: 'DISHUB', category: 'Dinas', email: 'dishub@pemda.go.id', phone: '0812-5555-6666', totalSOP: 156, sopBerlaku: 128, sopDraft: 15, createdAt: '2024-01-20' },
    { id: '4', name: 'Dinas Pekerjaan Umum', code: 'DISPU', category: 'Dinas', email: 'dispu@pemda.go.id', phone: '0813-7777-8888', totalSOP: 178, sopBerlaku: 158, sopDraft: 10, createdAt: '2024-01-18' },
    { id: '5', name: 'BAPPEDA', code: 'BAPPEDA', category: 'Badan', email: 'bappeda@pemda.go.id', phone: '0814-2222-3333', totalSOP: 98, sopBerlaku: 88, sopDraft: 5, createdAt: '2024-01-12' },
    { id: '6', name: 'Dinas Sosial', code: 'DINSOS', category: 'Dinas', email: 'dinsos@pemda.go.id', phone: '0815-4444-5555', totalSOP: 134, sopBerlaku: 115, sopDraft: 9, createdAt: '2024-02-01' },
  ])

  const [kepalaList, setKepalaList] = useState<KepalaOPD[]>([
    { id: 'k1', opdId: '1', name: 'Dr. Ahmad Pratama', nip: '196801151992031001', email: 'ahmad.pratama@pemda.go.id', phone: '0812-3456-7890', isActive: true, startedAt: '2024-01-15', totalSOP: 245 },
    { id: 'k2', opdId: '2', name: 'Dr. Siti Nurhaliza', nip: '197503152000032001', email: 'siti.nurhaliza@pemda.go.id', phone: '0812-9876-5432', isActive: true, startedAt: '2024-01-15', totalSOP: 189 },
    { id: 'k3', opdId: '3', name: 'Ir. Budi Santoso', nip: '198201102005011002', email: 'budi.santoso@pemda.go.id', phone: '0812-5555-6666', isActive: true, startedAt: '2024-01-20', totalSOP: 156 },
    { id: 'k4', opdId: '4', name: 'Ir. Andi Wijaya, MT', nip: '198505252010012003', email: 'andi.wijaya@pemda.go.id', phone: '0813-7777-8888', isActive: true, startedAt: '2024-01-18', totalSOP: 178 },
    { id: 'k5', opdId: '5', name: 'Drs. Hendra Kusuma, M.Si', nip: '197012081998031002', email: 'hendra.kusuma@pemda.go.id', phone: '0814-2222-3333', isActive: true, startedAt: '2024-01-12', totalSOP: 98 },
    { id: 'k6', opdId: '6', name: 'Dra. Sri Wahyuni', nip: '198305152003122001', email: 'sri.wahyuni@pemda.go.id', phone: '0815-4444-5555', isActive: true, startedAt: '2024-02-01', totalSOP: 134 },
  ])

  const getKepalaAktif = (opdId: string) => kepalaList.find((k) => k.opdId === opdId && k.isActive)
  const getKepalaByOPD = (opdId: string) => kepalaList.filter((k) => k.opdId === opdId)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Dinas',
  })

  const filteredOPD = opdList.filter(
    (opd) =>
      opd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opd.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getKepalaAktif(opd.id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasRelasiData = (opd: OPD) => opd.totalSOP > 0
  const canDeleteKepala = (k: KepalaOPD) => k.totalSOP === 0

  const handleDelete = (id: string) => {
    const opd = opdList.find((o) => o.id === id)
    if (opd && hasRelasiData(opd)) {
      alert(
        'OPD dengan data (SOP, proyek, evaluasi) hanya dapat dinonaktifkan. Gunakan tombol Nonaktif untuk menonaktifkan akun; penghapusan permanen tidak diperbolehkan.'
      )
      return
    }
    if (confirm('Apakah Anda yakin ingin menghapus OPD ini? Hapus permanen hanya untuk OPD tanpa data.')) {
      setOpdList(opdList.filter((opd) => opd.id !== id))
    }
  }

  const openEditDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setFormData({ name: opd.name, code: opd.code, category: opd.category })
    setIsEditDialogOpen(true)
  }

  const openDetailDialog = (opd: OPD) => {
    setSelectedOPD(opd)
    setIsDetailDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', code: '', category: 'Dinas' })
  }

  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'opd' | 'penugasan'>('opd')
  const [riwayatKepalaOpen, setRiwayatKepalaOpen] = useState(false)
  const [kepalaFormOpen, setKepalaFormOpen] = useState(false)
  const [tambahPenugasanOpen, setTambahPenugasanOpen] = useState(false)
  const [editingKepala, setEditingKepala] = useState<KepalaOPD | null>(null)
  const [kepalaForm, setKepalaForm] = useState({ name: '', nip: '', email: '', phone: '', startedAt: '' })
  const [penugasanForm, setPenugasanForm] = useState({ opdId: '', name: '', nip: '', email: '', startedAt: new Date().toISOString().slice(0, 10) })
  const [riwayatDialogOpen, setRiwayatDialogOpen] = useState(false)
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<{ name: string; email: string } | null>(null)
  const [pindahDialogOpen, setPindahDialogOpen] = useState(false)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<{ name: string; email: string; phone: string; nip?: string } | null>(null)
  const [pindahForm, setPindahForm] = useState({ opdId: '', startedAt: new Date().toISOString().slice(0, 10) })

  const openRiwayatKepala = (opd: OPD) => {
    setSelectedOPD(opd)
    setRiwayatKepalaOpen(true)
  }
  const openKepalaForm = (kepala?: KepalaOPD) => {
    if (kepala) {
      setEditingKepala(kepala)
      setKepalaForm({ name: kepala.name, nip: kepala.nip ?? '', email: kepala.email, phone: kepala.phone, startedAt: kepala.startedAt })
    } else {
      setEditingKepala(null)
      setKepalaForm({ name: '', nip: '', email: '', phone: '', startedAt: new Date().toISOString().slice(0, 10) })
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
        id: 'k' + Date.now(),
        opdId: selectedOPD.id,
        name: kepalaForm.name,
        nip: kepalaForm.nip,
        email: kepalaForm.email,
        phone: kepalaForm.phone,
        isActive: true,
        startedAt: kepalaForm.startedAt || today,
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
    const today = penugasanForm.startedAt || new Date().toISOString().slice(0, 10)
    if (!penugasanForm.opdId || !penugasanForm.name) return
    const existingActive = getKepalaAktif(penugasanForm.opdId)
    const newKepala: KepalaOPD = {
      id: 'k' + Date.now(),
      opdId: penugasanForm.opdId,
      name: penugasanForm.name,
      nip: penugasanForm.nip,
      email: penugasanForm.email,
      phone: '',
      isActive: true,
      startedAt: today,
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
    setPenugasanForm({ opdId: '', name: '', nip: '', email: '', startedAt: new Date().toISOString().slice(0, 10) })
  }

  const savePindahJabatan = () => {
    if (!pindahDialogPerson || !pindahForm.opdId) return
    const today = pindahForm.startedAt || new Date().toISOString().slice(0, 10)
    const { name, email, phone } = pindahDialogPerson
    const currentActive = kepalaList.find((k) => k.name === name && (k.email ?? '') === email && k.isActive)
    const existingActiveAtTarget = getKepalaAktif(pindahForm.opdId)
    const newKepala: KepalaOPD = {
      id: 'k' + Date.now(),
      opdId: pindahForm.opdId,
      name,
      email,
      phone,
      isActive: true,
      startedAt: today,
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
    setPindahForm({ opdId: '', startedAt: new Date().toISOString().slice(0, 10) })
  }

  const assignmentsForTab2 = kepalaList.map((k) => ({
    ...k,
    opdName: opdList.find((o) => o.id === k.opdId)?.name ?? k.opdId,
  }))
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
      .sort((a, b) => (b.startedAt > a.startedAt ? 1 : -1))
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
    setKepalaList((prev) => prev.filter((x) => x.id !== id))
    setKepalaFormOpen(false)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen OPD' }]}
        title="Manajemen OPD"
        description="Kelola data organisasi perangkat daerah dan penugasan kepala OPD"
      />

      {/* Search + tombol Tambah (grid 2): search kiri, tombol kanan */}
      <div className="bg-white rounded-md border border-gray-200 p-3 w-full">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="max-w-md">
            <SearchInput
              placeholder={activeTab === 'opd' ? 'Cari OPD, kode, atau penanggung jawab...' : 'Cari OPD atau nama kepala...'}
              value={activeTab === 'opd' ? searchQuery : searchUserQuery}
              onChange={(e) => activeTab === 'opd' ? setSearchQuery(e.target.value) : setSearchUserQuery(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            {activeTab === 'opd' ? (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs shrink-0"
                onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah OPD
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs shrink-0"
                onClick={() => {
                  setPenugasanForm({ opdId: opdList[0]?.id ?? '', name: '', nip: '', email: '', startedAt: new Date().toISOString().slice(0, 10) })
                  setTambahPenugasanOpen(true)
                }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Tambah Penugasan Kepala
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab mengarahkan ke Manajemen OPD / Penugasan Kepala OPD */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'opd' | 'penugasan')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 bg-white border border-gray-200 w-full">
          <TabsTrigger value="opd" className="text-xs gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Manajemen OPD
          </TabsTrigger>
          <TabsTrigger value="penugasan" className="text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Penugasan Kepala OPD
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opd" className="space-y-3 mt-3">
          <div className="bg-white rounded-md border border-gray-200 overflow-x-auto w-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nama OPD</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Kode</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Kategori</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOPD.map((opd) => (
                <tr key={opd.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">{opd.name}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-3"><Badge variant="outline" className="text-xs">{opd.code}</Badge></td>
                  <td className="py-2.5 px-3 text-gray-600">{opd.category}</td>
                  <td className="py-2.5 px-3 text-center">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </TabsContent>

        <TabsContent value="penugasan" className="space-y-3 mt-3">
          <div className="bg-white rounded-md border border-gray-200 overflow-x-auto w-full">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nama Kepala</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">NIP</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Email</th>
                <th className="text-left py-2.5 px-3 font-medium text-gray-700">Jabatan Aktif</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Mulai menjabat</th>
                <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersons.map((p) => {
                const act = p.activeAssignment
                return (
                  <tr key={`${p.name}|${p.email}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono text-xs">{p.nip || '—'}</td>
                    <td className="py-2.5 px-3 text-gray-600">{p.email}</td>
                    <td className="py-2.5 px-3">{act?.opdName ?? '—'}</td>
                    <td className="py-2.5 px-3 text-center">{act ? new Date(act.startedAt).toLocaleDateString('id-ID') : '—'}</td>
                    <td className="py-2.5 px-3">
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
                            setPindahForm({ opdId: '', startedAt: new Date().toISOString().slice(0, 10) })
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredPersons.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-xs">
              Belum ada penugasan kepala OPD. Gunakan &quot;Tambah Penugasan Kepala&quot; atau dari tab Manajemen OPD pilih OPD → Riwayat Kepala OPD.
            </div>
          )}
        </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah OPD Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Lengkapi form berikut untuk menambah OPD baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama OPD</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Dinas Pendidikan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Kode OPD</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="DISDIK"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori</Label>
                <select
                  className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Dinas">Dinas</option>
                  <option value="Badan">Badan</option>
                  <option value="Bagian">Bagian</option>
                  <option value="Kantor">Kantor</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (formData.name && formData.code) {
                  setOpdList((prev) => [
                    ...prev,
                    {
                      id: String(Date.now()),
                      name: formData.name,
                      code: formData.code,
                      category: formData.category,
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
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Edit OPD</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui informasi OPD
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama OPD</Label>
              <Input
                className="h-9 text-xs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Kode OPD</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Kategori</Label>
                <select
                  className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Dinas">Dinas</option>
                  <option value="Badan">Badan</option>
                  <option value="Bagian">Bagian</option>
                  <option value="Kantor">Kantor</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (selectedOPD) {
                  setOpdList(
                    opdList.map((opd) =>
                      opd.id === selectedOPD.id
                        ? {
                            ...opd,
                            name: formData.name,
                            code: formData.code,
                            category: formData.category,
                          }
                        : opd
                    )
                  )
                }
                setIsEditDialogOpen(false)
              }}
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-gray-900">Detail OPD</DialogTitle>
          </DialogHeader>
          {selectedOPD && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/80">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{selectedOPD.name}</h3>
                    <Badge variant="outline" className="mt-1.5 text-xs font-medium text-gray-600 border-gray-300">{selectedOPD.code}</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Kategori</span>
                  <span className="font-medium text-gray-900">{selectedOPD.category}</span>
                </div>
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
                    {new Date(selectedOPD.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider text-blue-600/80 font-medium mb-1">Total SOP</p>
                <p className="text-2xl font-bold text-blue-700">{selectedOPD.totalSOP}</p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Riwayat Kepala OPD</h4>
                <div className="space-y-2">
                  {getKepalaByOPD(selectedOPD.id).map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-100 text-xs">
                      <div>
                        <span className="font-medium text-gray-900">{k.name}</span>
                        {k.nip && <span className="block text-gray-500 font-mono text-[10px] mt-0.5">{k.nip}</span>}
                      </div>
                      <Badge className={k.isActive ? 'bg-emerald-100 text-emerald-700 border-0 text-xs' : 'bg-gray-100 text-gray-600 border-0 text-xs'}>
                        {k.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
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
                            <Badge className={`text-xs border-0 ${k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {k.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Mulai menjabat: {new Date(k.startedAt).toLocaleDateString('id-ID')}</span>
                              {k.endedAt && (
                                <span>Selesai: {new Date(k.endedAt).toLocaleDateString('id-ID')}</span>
                              )}
                            </div>
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
      <Dialog open={kepalaFormOpen} onOpenChange={setKepalaFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">{editingKepala ? 'Edit Kepala OPD' : 'Tambah Kepala OPD'}</DialogTitle>
            {selectedOPD && !editingKepala && (
              <DialogDescription className="text-xs">OPD: {selectedOPD.name}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nama *</Label>
              <Input className="h-9 text-xs" value={kepalaForm.name} onChange={(e) => setKepalaForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap dengan gelar" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP</Label>
              <Input className="h-9 text-xs" value={kepalaForm.nip} onChange={(e) => setKepalaForm((f) => ({ ...f, nip: e.target.value }))} placeholder="Contoh: 197503152000032001" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" className="h-9 text-xs" value={kepalaForm.email} onChange={(e) => setKepalaForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@pemda.go.id" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telepon</Label>
              <Input className="h-9 text-xs" value={kepalaForm.phone} onChange={(e) => setKepalaForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0812-xxxx-xxxx" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mulai menjabat</Label>
              <Input type="date" className="h-9 text-xs" value={kepalaForm.startedAt} onChange={(e) => setKepalaForm((f) => ({ ...f, startedAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setKepalaFormOpen(false)}>Batal</Button>
            <Button size="sm" className="h-8 text-xs" onClick={saveKepala} disabled={!kepalaForm.name}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tambah Penugasan Kepala: hanya Kepala baru */}
      <Dialog open={tambahPenugasanOpen} onOpenChange={setTambahPenugasanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Tambah Penugasan Kepala OPD</DialogTitle>
            <DialogDescription className="text-xs">
              Isi data kepala OPD baru dan pilih OPD tujuan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">OPD *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                value={penugasanForm.opdId}
                onChange={(e) => setPenugasanForm((f) => ({ ...f, opdId: e.target.value }))}
              >
                <option value="">Pilih OPD</option>
                {opdList.map((opd) => (
                  <option key={opd.id} value={opd.id}>{opd.name} ({opd.code})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Kepala *</Label>
              <Input className="h-9 text-xs" value={penugasanForm.name} onChange={(e) => setPenugasanForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap dengan gelar" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NIP</Label>
              <Input className="h-9 text-xs" value={penugasanForm.nip} onChange={(e) => setPenugasanForm((f) => ({ ...f, nip: e.target.value }))} placeholder="Contoh: 197503152000032001" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" className="h-9 text-xs" value={penugasanForm.email} onChange={(e) => setPenugasanForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@pemda.go.id" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mulai menjabat</Label>
              <Input type="date" className="h-9 text-xs" value={penugasanForm.startedAt} onChange={(e) => setPenugasanForm((f) => ({ ...f, startedAt: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setTambahPenugasanOpen(false)}>Batal</Button>
            <Button size="sm" className="h-8 text-xs" onClick={savePenugasanKepala} disabled={!penugasanForm.opdId || !penugasanForm.name}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pindah jabatan: per Kepala OPD (orang), pilih OPD tujuan */}
      <Dialog
        open={pindahDialogOpen}
        onOpenChange={(open) => {
          setPindahDialogOpen(open)
          if (!open) {
            setPindahDialogPerson(null)
            setPindahForm({ opdId: '', startedAt: new Date().toISOString().slice(0, 10) })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">Pindah jabatan</DialogTitle>
            <DialogDescription className="text-xs">
              Pindahkan kepala OPD ini ke OPD lain. Jabatan aktif saat ini (jika ada) akan berakhir; penugasan baru dimulai di OPD tujuan.
            </DialogDescription>
          </DialogHeader>
          {pindahDialogPerson && (
            <div className="space-y-3">
              <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs">
                <p className="font-medium text-gray-900">{pindahDialogPerson.name}</p>
                {pindahDialogPerson.nip && <p className="text-gray-600 font-mono">{pindahDialogPerson.nip}</p>}
                <p className="text-gray-600">{pindahDialogPerson.email}</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">OPD tujuan *</Label>
                <select
                  className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={pindahForm.opdId}
                  onChange={(e) => setPindahForm((f) => ({ ...f, opdId: e.target.value }))}
                >
                  <option value="">Pilih OPD</option>
                  {opdList
                    .filter((opd) => !getKepalaAktif(opd.id))
                    .map((opd) => (
                      <option key={opd.id} value={opd.id}>{opd.name} ({opd.code})</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">Hanya OPD yang belum memiliki kepala yang dapat dipilih.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Mulai menjabat</Label>
                <Input type="date" className="h-9 text-xs" value={pindahForm.startedAt} onChange={(e) => setPindahForm((f) => ({ ...f, startedAt: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setPindahDialogOpen(false); setPindahDialogPerson(null); }}>Batal</Button>
            <Button size="sm" className="h-8 text-xs" onClick={savePindahJabatan} disabled={!pindahForm.opdId}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">OPD</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Mulai menjabat</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Selesai</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Status</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {getRiwayatForUser(riwayatDialogPerson.name, riwayatDialogPerson.email).map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">{r.opdName}</td>
                      <td className="py-2 px-3 text-center">{new Date(r.startedAt).toLocaleDateString('id-ID')}</td>
                      <td className="py-2 px-3 text-center">{r.endedAt ? new Date(r.endedAt).toLocaleDateString('id-ID') : '—'}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={r.isActive ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-gray-200 text-gray-600 border-0 text-xs'}>{r.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                      </td>
                      <td className="py-2 px-3">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setRiwayatDialogOpen(false); setRiwayatDialogPerson(null); }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
