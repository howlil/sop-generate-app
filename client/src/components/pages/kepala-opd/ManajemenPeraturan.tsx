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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
} from '@/lib/peraturan-store'
import type { Peraturan } from '@/lib/peraturan-store'

/** OPD yang sedang login (mock). Hanya peraturan dengan createdBy === currentOPDId yang bisa diedit. */
const CURRENT_OPD_ID = '1'

const SEED_PERATURAN: Peraturan[] = [
  { id: '1', jenisPeraturan: 'Permendikbud', nomor: '1', tahun: '2026', tentang: 'Penerimaan Peserta Didik Baru', tanggalTerbit: '2026-01-05', status: 'Berlaku', digunakan: 3, createdBy: 'biro', version: 1 },
  { id: '2', jenisPeraturan: 'Perda', nomor: '12', tahun: '2025', tentang: 'Penyelenggaraan Pendidikan', tanggalTerbit: '2025-11-20', status: 'Berlaku', digunakan: 5, createdBy: 'biro', version: 1 },
  { id: '3', jenisPeraturan: 'SK Kadis', nomor: '15', tahun: '2026', tentang: 'Evaluasi Kinerja Guru', tanggalTerbit: '2026-01-10', status: 'Berlaku', digunakan: 2, createdBy: CURRENT_OPD_ID, version: 2 },
  { id: '4', jenisPeraturan: 'Perpres', nomor: '12', tahun: '2025', tentang: 'Pengadaan Barang dan Jasa Pemerintah', tanggalTerbit: '2025-03-15', status: 'Berlaku', digunakan: 4, createdBy: '2', version: 1 },
  { id: '5', jenisPeraturan: 'Permendikbud', nomor: '10', tahun: '2025', tentang: 'Ujian Sekolah', tanggalTerbit: '2025-09-01', status: 'Berlaku', digunakan: 1, createdBy: CURRENT_OPD_ID, version: 1 },
  { id: '6', jenisPeraturan: 'SK Kadis', nomor: '8', tahun: '2026', tentang: 'Pembentukan Tim Penyusun SOP', tanggalTerbit: '2026-01-03', status: 'Berlaku', digunakan: 0, createdBy: CURRENT_OPD_ID, version: 1 },
  { id: '7', jenisPeraturan: 'Permendikbud', nomor: '5', tahun: '2024', tentang: 'Kurikulum Merdeka', tanggalTerbit: '2024-08-10', status: 'Dicabut', digunakan: 0, createdBy: 'biro', version: 1 },
]

const OPD_NAMES: Record<string, string> = {
  '1': 'Dinas Pendidikan',
  '2': 'Dinas Kesehatan',
  '3': 'Dinas Perhubungan',
  biro: 'Biro Organisasi',
}

interface JenisPeraturan {
  id: string
  nama: string
  kode: string
  deskripsi: string
  tingkat: 'Pusat' | 'Daerah' | 'Internal'
  jumlahPeraturan: number
  createdBy: string
}

/** Satu entri riwayat versi: versi keberapa, kapan, siapa, dan SOP mana saja yang mengait ke versi ini. */
interface RiwayatVersiEntry {
  version: number
  tanggal: string
  diubahOleh: string
  sopYangMengait: { id: string; nama: string }[]
}

export function ManajemenPeraturan() {
  const [activeTab, setActiveTab] = useState('jenis')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const [isJenisDialogOpen, setIsJenisDialogOpen] = useState(false)
  const [editingJenis, setEditingJenis] = useState<JenisPeraturan | null>(null)
  const [jenisFormData, setJenisFormData] = useState({
    nama: '',
    kode: '',
    deskripsi: '',
    tingkat: 'Pusat' as 'Pusat' | 'Daerah' | 'Internal',
  })

  const [jenisList, setJenisList] = useState<JenisPeraturan[]>([
    { id: '1', nama: 'Peraturan Menteri Pendidikan dan Kebudayaan', kode: 'Permendikbud', deskripsi: 'Peraturan yang ditetapkan oleh Menteri Pendidikan dan Kebudayaan', tingkat: 'Pusat', jumlahPeraturan: 3, createdBy: 'biro' },
    { id: '2', nama: 'Peraturan Daerah', kode: 'Perda', deskripsi: 'Peraturan yang ditetapkan oleh DPRD bersama Kepala Daerah', tingkat: 'Daerah', jumlahPeraturan: 2, createdBy: 'biro' },
    { id: '3', nama: 'Surat Keputusan Kepala Dinas', kode: 'SK Kadis', deskripsi: 'Keputusan yang ditetapkan oleh Kepala Dinas', tingkat: 'Internal', jumlahPeraturan: 4, createdBy: CURRENT_OPD_ID },
    { id: '4', nama: 'Peraturan Presiden', kode: 'Perpres', deskripsi: 'Peraturan yang ditetapkan oleh Presiden', tingkat: 'Pusat', jumlahPeraturan: 1, createdBy: '2' },
    { id: '5', nama: 'Keputusan Gubernur', kode: 'Kepgub', deskripsi: 'Keputusan yang ditetapkan oleh Gubernur', tingkat: 'Daerah', jumlahPeraturan: 0, createdBy: 'biro' },
  ])

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
  const [riwayatVersiPeraturan, setRiwayatVersiPeraturan] = useState<Record<string, RiwayatVersiEntry[]>>({
    '1': [
      { version: 1, tanggal: '2026-01-05', diubahOleh: 'Biro Organisasi', sopYangMengait: [{ id: 's1', nama: 'SOP Penerimaan Siswa Baru' }, { id: 's2', nama: 'SOP Ujian Sekolah' }, { id: 's3', nama: 'SOP Kelulusan' }] },
    ],
    '2': [
      { version: 1, tanggal: '2025-11-20', diubahOleh: 'Biro Organisasi', sopYangMengait: [{ id: 's4', nama: 'SOP Penyelenggaraan Pendidikan Daerah' }, { id: 's5', nama: 'SOP Bantuan Operasional' }] },
    ],
    '3': [
      { version: 1, tanggal: '2026-01-05', diubahOleh: OPD_NAMES[CURRENT_OPD_ID], sopYangMengait: [{ id: 's6', nama: 'SOP Penilaian Kinerja Guru (lama)' }] },
      { version: 2, tanggal: '2026-01-10', diubahOleh: OPD_NAMES[CURRENT_OPD_ID], sopYangMengait: [{ id: 's7', nama: 'SOP Evaluasi Kinerja Guru' }, { id: 's8', nama: 'SOP Sertifikasi Guru' }] },
    ],
    '4': [
      { version: 1, tanggal: '2025-03-15', diubahOleh: 'Dinas Kesehatan', sopYangMengait: [{ id: 's9', nama: 'SOP Pengadaan Barang' }, { id: 's10', nama: 'SOP Lelang' }] },
    ],
  })
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)

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
      setToastMessage('Nama dan kode jenis peraturan harus diisi')
      return
    }
    if (editingJenis && !canEditJenis(editingJenis)) {
      setToastMessage('Hanya peraturan yang dibuat oleh OPD Anda yang dapat diedit.')
      return
    }
    if (editingJenis) {
      setJenisList((prev) =>
        prev.map((j) => (j.id === editingJenis.id ? { ...j, ...jenisFormData } : j))
      )
      setToastMessage('Jenis peraturan berhasil diperbarui')
    } else {
      setJenisList((prev) => [
        ...prev,
        { id: String(Date.now()), ...jenisFormData, jumlahPeraturan: 0, createdBy: CURRENT_OPD_ID },
      ])
      setToastMessage('Jenis peraturan berhasil ditambahkan')
    }
    setIsJenisDialogOpen(false)
  }

  const handleDeleteJenis = (id: string) => {
    const jenis = jenisList.find((j) => j.id === id)
    if (jenis && !canEditJenis(jenis)) {
      setToastMessage('Hanya peraturan yang dibuat oleh OPD Anda yang dapat dihapus.')
      return
    }
    if (jenis && jenis.jumlahPeraturan > 0) {
      setToastMessage(`Tidak dapat menghapus. Masih ada ${jenis.jumlahPeraturan} peraturan menggunakan jenis ini`)
      return
    }
    setJenisList((prev) => prev.filter((j) => j.id !== id))
    setToastMessage('Jenis peraturan berhasil dihapus')
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
      setToastMessage('Semua field wajib diisi')
      return
    }
    if (editingPeraturan && !canEditPeraturan(editingPeraturan)) {
      setToastMessage('Hanya peraturan yang dibuat oleh OPD Anda yang dapat diedit.')
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
      setToastMessage('Peraturan berhasil diperbarui (versi baru).')
    } else {
      addPeraturan({
        id: String(Date.now()),
        ...peraturanFormData,
        status: 'Berlaku',
        digunakan: 0,
        createdBy: CURRENT_OPD_ID,
        version: 1,
      })
      setToastMessage('Peraturan berhasil ditambahkan')
    }
    setIsPeraturanDialogOpen(false)
  }

  const handleDeletePeraturan = (id: string) => {
    const peraturan = peraturanList.find((p) => p.id === id)
    if (peraturan && !canEditPeraturan(peraturan)) {
      setToastMessage('Hanya peraturan yang dibuat oleh OPD Anda yang dapat dihapus.')
      return
    }
    if (peraturan && peraturan.digunakan > 0) {
      setToastMessage(`Tidak dapat menghapus. Masih ada ${peraturan.digunakan} SOP yang mengaitkan peraturan ini.`)
      return
    }
    removePeraturan(id)
    setToastMessage('Peraturan berhasil dihapus')
  }

  const toggleStatusPeraturan = (id: string) => {
    const p = peraturanList.find((x) => x.id === id)
    if (p && !canEditPeraturan(p)) return
    setPeraturanDicabut(id)
    setToastMessage('Status peraturan berhasil diubah')
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
      {toastMessage && (
        <div
          className={`rounded-md border px-4 py-2 text-xs ${
            toastMessage.includes('berhasil')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {toastMessage}
        </div>
      )}

      <PageHeader
        breadcrumb={[{ label: 'Manajemen Peraturan' }]}
        title="Master Data Peraturan"
        description="Kelola jenis peraturan dan database peraturan"
      />

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between gap-4">
          <SearchInput
            placeholder={
              activeTab === 'jenis' ? 'Cari jenis peraturan...' : 'Cari peraturan...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        </div>
      </div>

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
          <div className="bg-white rounded-md border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700">Tingkat</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700">Kode</th>
                  <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nama</th>
                  <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredJenis.map((jenis) => (
                  <tr key={jenis.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <Badge className={`text-xs border-0 ${getTingkatColor(jenis.tingkat)}`}>
                        {jenis.tingkat}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-600">{jenis.kode}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{jenis.nama}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => openJenisDialog(jenis)}
                          disabled={!canEditJenis(jenis)}
                          title={!canEditJenis(jenis) ? 'Hanya peraturan yang Anda buat yang dapat diedit' : undefined}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDeleteJenis(jenis.id)}
                          disabled={!canEditJenis(jenis)}
                          title={!canEditJenis(jenis) ? 'Hanya peraturan yang Anda buat yang dapat dihapus' : undefined}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredJenis.length === 0 && (
            <div className="bg-white rounded-md border border-gray-200 p-8 text-center">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Tidak ada jenis peraturan ditemukan</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="peraturan" className="mt-3">
          <div className="bg-white rounded-md border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2.5 px-3 font-medium text-gray-700">Jenis</th>
                    <th className="text-left py-2.5 px-3 font-medium text-gray-700">Nomor</th>
                    <th className="text-left py-2.5 px-3 font-medium text-gray-700">Tentang</th>
                    <th className="text-center py-2.5 px-3 font-medium text-gray-700">Status</th>
                    <th className="text-center py-2.5 px-3 font-medium text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeraturan.map((peraturan) => (
                    <tr
                      key={peraturan.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-xs">
                          {peraturan.jenisPeraturan}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-700">
                        No. {peraturan.nomor}/{peraturan.tahun}
                      </td>
                      <td className="py-2.5 px-3 text-gray-900">{peraturan.tentang}</td>
                      <td className="py-2.5 px-3 text-center">
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
                      </td>
                      <td className="py-2.5 px-3 text-center">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => openPeraturanDialog(peraturan)}
                            disabled={!canEditPeraturan(peraturan)}
                            title={!canEditPeraturan(peraturan) ? 'Hanya peraturan yang Anda buat yang dapat diedit' : undefined}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                            onClick={() => handleDeletePeraturan(peraturan.id)}
                            disabled={!canEditPeraturan(peraturan) || peraturan.digunakan > 0}
                            title={!canEditPeraturan(peraturan) ? 'Hanya peraturan yang Anda buat yang dapat dihapus' : peraturan.digunakan > 0 ? 'Tidak dapat dihapus: sudah ada SOP yang mengait' : undefined}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-center py-2 px-3 font-medium text-gray-700 w-16">Versi</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Tanggal</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Diubah oleh</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">SOP yang mengait</th>
                  </tr>
                </thead>
                <tbody>
                  {getRiwayatVersi(selectedPeraturanForRiwayat.id)
                    .slice()
                    .reverse()
                    .map((entry) => (
                      <tr key={entry.version} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-center font-medium">{entry.version}</td>
                        <td className="py-2 px-3 text-gray-600">
                          {new Date(entry.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{entry.diubahOleh}</td>
                        <td className="py-2 px-3 text-gray-700">
                          {entry.sopYangMengait.length > 0 ? (
                            <ul className="list-disc pl-4 space-y-0.5">
                              {entry.sopYangMengait.map((s) => (
                                <li key={s.id}>{s.nama}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Nama Jenis Peraturan *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Peraturan Menteri Pendidikan dan Kebudayaan"
                value={jenisFormData.nama}
                onChange={(e) => setJenisFormData({ ...jenisFormData, nama: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kode/Singkatan *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Permendikbud"
                value={jenisFormData.kode}
                onChange={(e) => setJenisFormData({ ...jenisFormData, kode: e.target.value })}
              />
              <p className="text-xs text-gray-500">Kode yang akan muncul di dropdown</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tingkat *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-0"
                value={jenisFormData.tingkat}
                onChange={(e) =>
                  setJenisFormData({
                    ...jenisFormData,
                    tingkat: e.target.value as 'Pusat' | 'Daerah' | 'Internal',
                  })
                }
              >
                <option value="Pusat">Pusat</option>
                <option value="Daerah">Daerah</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Deskripsi</Label>
              <Textarea
                className="text-xs min-h-[60px]"
                placeholder="Deskripsi singkat tentang jenis peraturan ini..."
                value={jenisFormData.deskripsi}
                onChange={(e) =>
                  setJenisFormData({ ...jenisFormData, deskripsi: e.target.value })
                }
              />
            </div>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Jenis Peraturan *</Label>
              <select
                className="h-9 w-full rounded-md border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={peraturanFormData.jenisPeraturan}
                onChange={(e) =>
                  setPeraturanFormData({
                    ...peraturanFormData,
                    jenisPeraturan: e.target.value,
                  })
                }
              >
                <option value="">Pilih Jenis Peraturan</option>
                {jenisList.map((jenis) => (
                  <option key={jenis.id} value={jenis.kode}>
                    {jenis.kode} - {jenis.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nomor *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="Contoh: 1"
                  value={peraturanFormData.nomor}
                  onChange={(e) =>
                    setPeraturanFormData({ ...peraturanFormData, nomor: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tahun *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="2026"
                  value={peraturanFormData.tahun}
                  onChange={(e) =>
                    setPeraturanFormData({ ...peraturanFormData, tahun: e.target.value })
                  }
                  maxLength={4}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tentang *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="Contoh: Penerimaan Peserta Didik Baru"
                value={peraturanFormData.tentang}
                onChange={(e) =>
                  setPeraturanFormData({ ...peraturanFormData, tentang: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Terbit</Label>
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
            </div>
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
    </div>
  )
}
