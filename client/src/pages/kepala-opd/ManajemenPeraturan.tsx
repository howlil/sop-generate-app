import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getPeraturanList,
  initPeraturanList,
  addPeraturan,
  updatePeraturan,
  removePeraturan,
  setPeraturanDicabut,
  subscribe as subscribePeraturan,
} from '@/lib/stores/peraturan-store'
import type { Peraturan } from '@/lib/types/peraturan'
import {
  SEED_PERATURAN,
  SEED_MANAJEMEN_PERATURAN_OPD_ID as CURRENT_OPD_ID,
  SEED_OPD_NAMES as OPD_NAMES,
  SEED_JENIS_PERATURAN,
  SEED_RIWAYAT_VERSI_PERATURAN,
  type JenisPeraturan,
  type RiwayatVersiEntry,
} from '@/lib/seed/peraturan-seed'

export function ManajemenPeraturan() {
  const [activeTab, setActiveTab] = useState('jenis')
  const [searchQuery, setSearchQuery] = useState('')

  const [isJenisDialogOpen, setIsJenisDialogOpen] = useState(false)
  const [editingJenis, setEditingJenis] = useState<JenisPeraturan | null>(null)
  const [jenisFormData, setJenisFormData] = useState({
    nama: '',
    kode: '',
    deskripsi: '',
    tingkat: 'Pusat' as 'Pusat' | 'Daerah' | 'Internal',
  })

  const [jenisList, setJenisList] = useState<JenisPeraturan[]>(() => [...SEED_JENIS_PERATURAN])

  const [isPeraturanDialogOpen, setIsPeraturanDialogOpen] = useState(false)
  const [editingPeraturan, setEditingPeraturan] = useState<Peraturan | null>(null)
  const [peraturanFormData, setPeraturanFormData] = useState({
    jenisPeraturan: '',
    nomor: '',
    tahun: '',
    tentang: '',
    tanggalTerbit: '',
  })

  const [peraturanList, setPeraturanList] = useState<Peraturan[]>(() => getPeraturanList())

  useEffect(() => {
    if (getPeraturanList().length === 0) initPeraturanList(SEED_PERATURAN)
    setPeraturanList(getPeraturanList())
    return subscribePeraturan(() => setPeraturanList(getPeraturanList()))
  }, [])

  /** Riwayat versi per peraturan: versi keberapa, kapan, siapa, SOP mana yang mengait ke versi itu. */
  const [riwayatVersiPeraturan, setRiwayatVersiPeraturan] = useState<Record<string, RiwayatVersiEntry[]>>(() => ({ ...SEED_RIWAYAT_VERSI_PERATURAN }))
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'jenis'; id: string } | { type: 'peraturan'; id: string } | null>(null)

  const getRiwayatVersi = (peraturanId: string): RiwayatVersiEntry[] => {
    const list = riwayatVersiPeraturan[peraturanId]
    if (list) return list
    const p = peraturanList.find((x) => x.id === peraturanId)
    if (!p) return []
    return [{ version: p.version, tanggal: p.tanggalTerbit, diubahOleh: OPD_NAMES[p.createdBy] ?? p.createdBy, sopYangMengait: [] }]
  }

  const filteredJenis = jenisList.filter(
    (jenis) =>
      jenis.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jenis.kode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPeraturan = peraturanList.filter(
    (peraturan) =>
      peraturan.tentang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peraturan.nomor.includes(searchQuery) ||
      peraturan.jenisPeraturan.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        { id: String(Date.now()), ...jenisFormData, jumlahPeraturan: 0, createdBy: CURRENT_OPD_ID },
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
    if (!peraturanFormData.jenisPeraturan || !peraturanFormData.nomor || !peraturanFormData.tahun || !peraturanFormData.tentang) {
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
            { version: newVersion, tanggal: new Date().toISOString().slice(0, 10), diubahOleh: OPD_NAMES[CURRENT_OPD_ID], sopYangMengait: [] },
          ],
        }
      })
      showToast('Peraturan berhasil diperbarui (versi baru).')
    } else {
      addPeraturan({
        id: String(Date.now()),
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

  const getTingkatColor = (tingkat: string) => {
    switch (tingkat) {
      case 'Pusat':
        return 'bg-blue-100 text-blue-700'
      case 'Daerah':
        return 'bg-green-100 text-green-700'
      case 'Internal':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Manajemen Peraturan' }]}
        title="Master Data Peraturan"
        description="Kelola jenis peraturan dan database peraturan"
      />

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
          <Table.Card>
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Tingkat</Table.Th>
                  <Table.Th>Kode</Table.Th>
                  <Table.Th>Nama</Table.Th>
                  <Table.Th align="center">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {filteredJenis.map((jenis) => (
                  <Table.BodyRow key={jenis.id}>
                    <Table.Td>
                      <Badge className={`text-xs border-0 ${getTingkatColor(jenis.tingkat)}`}>
                        {jenis.tingkat}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="font-mono text-blue-600">{jenis.kode}</Table.Td>
                    <Table.Td className="font-medium text-gray-900">{jenis.nama}</Table.Td>
                    <Table.Td>
                      <div className="flex items-center justify-center gap-1">
                        <IconActionButton
                          icon={Edit}
                          title={!canEditJenis(jenis) ? 'Hanya peraturan yang Anda buat yang dapat diedit' : 'Edit'}
                          onClick={() => openJenisDialog(jenis)}
                          disabled={!canEditJenis(jenis)}
                        />
                        <IconActionButton
                          icon={Trash2}
                          title={!canEditJenis(jenis) ? 'Hanya peraturan yang Anda buat yang dapat dihapus' : 'Hapus'}
                          destructive
                          onClick={() => handleDeleteJenis(jenis.id)}
                          disabled={!canEditJenis(jenis)}
                        />
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          </Table.Card>
          {filteredJenis.length === 0 && (
            <div className="bg-white rounded-md border border-gray-200 p-8 text-center">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Tidak ada jenis peraturan ditemukan</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="peraturan" className="mt-3">
          <Table.Card>
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Jenis</Table.Th>
                  <Table.Th>Nomor</Table.Th>
                  <Table.Th>Tentang</Table.Th>
                  <Table.Th align="center">Status</Table.Th>
                  <Table.Th align="center">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {filteredPeraturan.map((peraturan) => (
                  <Table.BodyRow key={peraturan.id}>
                    <Table.Td>
                      <Badge variant="outline" className="text-xs">
                        {peraturan.jenisPeraturan}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="font-mono text-gray-700">
                      No. {peraturan.nomor}/{peraturan.tahun}
                    </Table.Td>
                    <Table.Td className="text-gray-900">{peraturan.tentang}</Table.Td>
                    <Table.Td className="text-center">
                      <button
                        type="button"
                        onClick={() => canEditPeraturan(peraturan) && toggleStatusPeraturan(peraturan.id)}
                        className={!canEditPeraturan(peraturan) ? 'cursor-default' : 'cursor-pointer'}
                        disabled={!canEditPeraturan(peraturan)}
                      >
                        <Badge
                          className={`text-xs border-0 ${
                            peraturan.status === 'Berlaku'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } ${!canEditPeraturan(peraturan) ? 'opacity-90' : ''}`}
                        >
                          {peraturan.status}
                        </Badge>
                      </button>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => { setSelectedPeraturanForRiwayat(peraturan); setRiwayatVersiOpen(true) }}
                          title="Riwayat versi & SOP yang mengait"
                        >
                          <History className="w-3 h-3" />
                        </Button>
                        <IconActionButton
                          icon={Edit}
                          title={!canEditPeraturan(peraturan) ? 'Hanya peraturan yang Anda buat yang dapat diedit' : 'Edit'}
                          onClick={() => openPeraturanDialog(peraturan)}
                          disabled={!canEditPeraturan(peraturan)}
                        />
                        <IconActionButton
                          icon={Trash2}
                          title={!canEditPeraturan(peraturan) ? 'Hanya peraturan yang Anda buat yang dapat dihapus' : peraturan.digunakan > 0 ? 'Tidak dapat dihapus: sudah ada SOP yang mengait' : 'Hapus'}
                          destructive
                          onClick={() => handleDeletePeraturan(peraturan.id)}
                          disabled={!canEditPeraturan(peraturan) || peraturan.digunakan > 0}
                        />
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          </Table.Card>
          {filteredPeraturan.length === 0 && (
            <div className="bg-white rounded-md border border-gray-200 p-8 text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Tidak ada peraturan ditemukan</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Riwayat Versi Peraturan */}
      <Dialog open={riwayatVersiOpen} onOpenChange={setRiwayatVersiOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Riwayat versi</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedPeraturanForRiwayat
                ? `${selectedPeraturanForRiwayat.jenisPeraturan} No. ${selectedPeraturanForRiwayat.nomor}/${selectedPeraturanForRiwayat.tahun} — ${selectedPeraturanForRiwayat.tentang}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedPeraturanForRiwayat && (
            <Table.Root className="border rounded-md">
              <Table.Table>
                <thead>
                  <Table.HeadRow>
                    <Table.Th className="text-center w-16">Versi</Table.Th>
                    <Table.Th>Tanggal</Table.Th>
                    <Table.Th>Diubah oleh</Table.Th>
                    <Table.Th>SOP yang mengait</Table.Th>
                  </Table.HeadRow>
                </thead>
                <tbody>
                  {getRiwayatVersi(selectedPeraturanForRiwayat.id)
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <Table.BodyRow key={entry.version}>
                        <Table.Td className="text-center font-medium">{entry.version}</Table.Td>
                        <Table.Td className="text-gray-600">
                          {new Date(entry.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Table.Td>
                        <Table.Td className="text-gray-600">{entry.diubahOleh}</Table.Td>
                        <Table.Td className="text-gray-700">
                          {entry.sopYangMengait.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-0.5">
                              {entry.sopYangMengait.map((s) => (
                                <li key={s.id}>{s.nama}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </Table.Td>
                      </Table.BodyRow>
                    ))}
                </tbody>
              </Table.Table>
            </Table.Root>
          )}
          <DialogFooter>
            <Button size="sm" className="h-8 text-xs" onClick={() => setRiwayatVersiOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Jenis Dialog */}
      <Dialog open={isJenisDialogOpen} onOpenChange={setIsJenisDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingJenis ? 'Edit Jenis Peraturan' : 'Tambah Jenis Peraturan'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingJenis
                ? 'Perbarui informasi jenis peraturan'
                : 'Tambahkan jenis peraturan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Nama Jenis Peraturan" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Peraturan Menteri Pendidikan dan Kebudayaan"
                value={jenisFormData.nama}
                onChange={(e) => setJenisFormData({ ...jenisFormData, nama: e.target.value })}
              />
            </FormField>
            <FormField label="Kode/Singkatan" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Permendikbud"
                value={jenisFormData.kode}
                onChange={(e) => setJenisFormData({ ...jenisFormData, kode: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Kode yang akan muncul di dropdown</p>
            </FormField>
            <FormField label="Tingkat" required>
              <Select
                value={jenisFormData.tingkat}
                onValueChange={(tingkat) =>
                  setJenisFormData({
                    ...jenisFormData,
                    tingkat: tingkat as 'Pusat' | 'Daerah' | 'Internal',
                  })
                }
                options={[
                  { value: 'Pusat', label: 'Pusat' },
                  { value: 'Daerah', label: 'Daerah' },
                  { value: 'Internal', label: 'Internal' },
                ]}
              />
            </FormField>
            <FormField label="Deskripsi">
              <Textarea
                className="text-xs min-h-[60px]"
                placeholder="Deskripsi singkat tentang jenis peraturan ini..."
                value={jenisFormData.deskripsi}
                onChange={(e) =>
                  setJenisFormData({ ...jenisFormData, deskripsi: e.target.value })
                }
              />
            </FormField>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsJenisDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleSaveJenis}
              disabled={!jenisFormData.nama || !jenisFormData.kode}
            >
              {editingJenis ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Peraturan Dialog */}
      <Dialog open={isPeraturanDialogOpen} onOpenChange={setIsPeraturanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingPeraturan ? 'Edit Peraturan' : 'Tambah Peraturan'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingPeraturan
                ? 'Perbarui informasi peraturan'
                : 'Tambahkan peraturan baru ke database'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Jenis Peraturan" required>
              <Select
                value={peraturanFormData.jenisPeraturan}
                onValueChange={(jenisPeraturan) =>
                  setPeraturanFormData({
                    ...peraturanFormData,
                    jenisPeraturan,
                  })
                }
                placeholder="Pilih Jenis Peraturan"
                options={jenisList.map((jenis) => ({
                  value: jenis.kode,
                  label: `${jenis.kode} - ${jenis.nama}`,
                }))}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nomor" required>
                <Input
                  className="h-9 text-xs"
                  placeholder="Contoh: 1"
                  value={peraturanFormData.nomor}
                  onChange={(e) =>
                    setPeraturanFormData({ ...peraturanFormData, nomor: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Tahun" required>
                <Input
                  className="h-9 text-xs"
                  placeholder="2026"
                  value={peraturanFormData.tahun}
                  onChange={(e) =>
                    setPeraturanFormData({ ...peraturanFormData, tahun: e.target.value })
                  }
                  maxLength={4}
                />
              </FormField>
            </div>
            <FormField label="Tentang" required>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Penerimaan Peserta Didik Baru"
                value={peraturanFormData.tentang}
                onChange={(e) =>
                  setPeraturanFormData({ ...peraturanFormData, tentang: e.target.value })
                }
              />
            </FormField>
            <FormField label="Tanggal Terbit">
              <Input
                type="date"
                className="h-9 text-xs"
                value={peraturanFormData.tanggalTerbit}
                onChange={(e) =>
                  setPeraturanFormData({
                    ...peraturanFormData,
                    tanggalTerbit: e.target.value,
                  })
                }
              />
            </FormField>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsPeraturanDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleSavePeraturan}
              disabled={
                !peraturanFormData.jenisPeraturan ||
                !peraturanFormData.nomor ||
                !peraturanFormData.tahun ||
                !peraturanFormData.tentang
              }
            >
              {editingPeraturan ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          if (deleteConfirm?.type === 'jenis') doDeleteJenis(deleteConfirm.id)
          else if (deleteConfirm?.type === 'peraturan') doDeletePeraturan(deleteConfirm.id)
        }}
      />
    </div>
  )
}
