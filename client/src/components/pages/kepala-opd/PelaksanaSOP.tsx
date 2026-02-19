import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toast } from '@/components/ui/toast'

interface PelaksanaSOP {
  id: string
  nama: string
  deskripsi: string
  /** Jumlah POS/SOP yang menggunakan pelaksana ini. Jika > 0, tidak boleh dihapus. */
  jumlahPos: number
}

export function PelaksanaSOPPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [pelaksanaList, setPelaksanaList] = useState<PelaksanaSOP[]>([
    {
      id: 'pel-1',
      nama: 'Pelaksana Utama',
      deskripsi: 'Menangani SOP layanan utama dan administrasi umum.',
      jumlahPos: 3,
    },
    {
      id: 'pel-2',
      nama: 'Pelaksana Pendukung',
      deskripsi: 'Membantu pelaksanaan POS pendukung lintas unit.',
      jumlahPos: 0,
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPelaksana, setEditingPelaksana] = useState<PelaksanaSOP | null>(null)
  const [pelaksanaNama, setPelaksanaNama] = useState('')
  const [pelaksanaDeskripsi, setPelaksanaDeskripsi] = useState('')
  const [pelaksanaJumlahPos, setPelaksanaJumlahPos] = useState<string>('0')

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  const openTambahPelaksana = () => {
    setEditingPelaksana(null)
    setPelaksanaNama('')
    setPelaksanaDeskripsi('')
    setPelaksanaJumlahPos('0')
    setIsDialogOpen(true)
  }

  const openEditPelaksana = (pel: PelaksanaSOP) => {
    setEditingPelaksana(pel)
    setPelaksanaNama(pel.nama)
    setPelaksanaDeskripsi(pel.deskripsi)
    setPelaksanaJumlahPos(String(pel.jumlahPos))
    setIsDialogOpen(true)
  }

  const handleSimpanPelaksana = () => {
    const trimmedNama = pelaksanaNama.trim()
    if (!trimmedNama) {
      setToastMessage('Nama pelaksana wajib diisi.')
      return
    }
    const parsedJumlah = Number.parseInt(pelaksanaJumlahPos || '0', 10)
    const safeJumlah = Number.isNaN(parsedJumlah) || parsedJumlah < 0 ? 0 : parsedJumlah

    if (editingPelaksana) {
      setPelaksanaList((prev) =>
        prev.map((p) =>
          p.id === editingPelaksana.id
            ? { ...p, nama: trimmedNama, deskripsi: pelaksanaDeskripsi.trim(), jumlahPos: safeJumlah }
            : p
        )
      )
      setToastMessage('Data pelaksana SOP berhasil diperbarui.')
    } else {
      const newPel: PelaksanaSOP = {
        id: `pel-${Date.now()}`,
        nama: trimmedNama,
        deskripsi: pelaksanaDeskripsi.trim(),
        jumlahPos: safeJumlah,
      }
      setPelaksanaList((prev) => [newPel, ...prev])
      setToastMessage('Pelaksana SOP baru berhasil ditambahkan.')
    }
    setIsDialogOpen(false)
    setEditingPelaksana(null)
  }

  const handleHapusPelaksana = (pel: PelaksanaSOP) => {
    if (pel.jumlahPos > 0) {
      setToastMessage(
        `Pelaksana "${pel.nama}" tidak dapat dihapus karena sudah terhubung ke ${pel.jumlahPos} POS.`
      )
      return
    }
    setPelaksanaList((prev) => prev.filter((p) => p.id !== pel.id))
    setToastMessage(`Pelaksana "${pel.nama}" berhasil dihapus.`)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Kelola Pelaksana SOP' }]}
        title="Kelola Pelaksana SOP"
        description="Master data pelaksana SOP yang digunakan lintas POS."
      />

      {toastMessage && <Toast message={toastMessage} type="success" />}

      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-900">Daftar Pelaksana</p>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={openTambahPelaksana}>
            <Plus className="w-3.5 h-3.5" />
            Tambah pelaksana
          </Button>
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {pelaksanaList.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Belum ada data pelaksana SOP.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-1.5 text-left w-[26%]">Nama pelaksana</th>
                  <th className="px-2 py-1.5 text-left w-[52%]">Deskripsi</th>
                  <th className="px-2 py-1.5 text-center w-[10%]">Jumlah POS</th>
                  <th className="px-2 py-1.5 text-center w-[12%]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pelaksanaList.map((pel) => (
                  <tr key={pel.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-1.5 align-top">
                      <p className="text-xs font-medium text-gray-900">{pel.nama}</p>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <p className="text-[11px] text-gray-700 whitespace-pre-line">
                        {pel.deskripsi || '-'}
                      </p>
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-700 min-w-[32px]">
                        {pel.jumlahPos}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center align-top">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          title="Edit pelaksana"
                          onClick={() => openEditPelaksana(pel)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-red-50"
                          title={
                            pel.jumlahPos > 0
                              ? 'Tidak dapat dihapus karena sudah dipakai di POS/SOP'
                              : 'Hapus pelaksana'
                          }
                          onClick={() => handleHapusPelaksana(pel)}
                          disabled={pel.jumlahPos > 0}
                        >
                          <Trash2
                            className={`w-3.5 h-3.5 ${
                              pel.jumlahPos > 0
                                ? 'text-gray-300'
                                : 'text-red-600 hover:text-red-700'
                            }`}
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Dialog: tambah / edit Pelaksana SOP */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingPelaksana ? 'Edit Pelaksana SOP' : 'Tambah Pelaksana SOP'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Atur master data pelaksana SOP yang dapat dikaitkan dengan berbagai POS.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Nama pelaksana</label>
              <Input
                className="h-8 text-xs"
                value={pelaksanaNama}
                onChange={(e) => setPelaksanaNama(e.target.value)}
                placeholder="Mis. Pelaksana Utama"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Deskripsi</label>
              <Input
                className="h-8 text-xs"
                value={pelaksanaDeskripsi}
                onChange={(e) => setPelaksanaDeskripsi(e.target.value)}
                placeholder="Ringkasan peran atau cakupan tugas"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Jumlah POS</label>
              <Input
                type="number"
                min={0}
                className="h-8 text-xs w-24"
                value={pelaksanaJumlahPos}
                onChange={(e) => setPelaksanaJumlahPos(e.target.value)}
              />
              <p className="text-[10px] text-gray-500">
                Jika jumlah POS &gt; 0, pelaksana tidak dapat dihapus.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setIsDialogOpen(false)
                setEditingPelaksana(null)
              }}
            >
              Batal
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSimpanPelaksana}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

