import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { FormField } from '@/components/ui/form-field'
import { PageHeader } from '@/components/layout/PageHeader'
import { showToast } from '@/lib/stores/app-store'
import { generateId } from '@/utils/generate-id'
import { SEED_PELAKSANA_LIST } from '@/lib/seed/pelaksana-seed'
import type { PelaksanaSOP } from '@/lib/types/sop'

export function PelaksanaSOPPage() {
  const [pelaksanaList, setPelaksanaList] = useState<PelaksanaSOP[]>(SEED_PELAKSANA_LIST)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPelaksana, setEditingPelaksana] = useState<PelaksanaSOP | null>(null)
  const [deletePelaksana, setDeletePelaksana] = useState<PelaksanaSOP | null>(null)
  const [pelaksanaNama, setPelaksanaNama] = useState('')
  const [pelaksanaDeskripsi, setPelaksanaDeskripsi] = useState('')
  const [pelaksanaJumlahPos, setPelaksanaJumlahPos] = useState<string>('0')

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
      showToast('Nama pelaksana wajib diisi.', 'error')
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
      showToast('Data pelaksana SOP berhasil diperbarui.')
    } else {
      const newPel: PelaksanaSOP = {
        id: generateId('pel'),
        nama: trimmedNama,
        deskripsi: pelaksanaDeskripsi.trim(),
        jumlahPos: safeJumlah,
      }
      setPelaksanaList((prev) => [newPel, ...prev])
      showToast('Pelaksana SOP baru berhasil ditambahkan.')
    }
    setIsDialogOpen(false)
    setEditingPelaksana(null)
  }

  const handleHapusPelaksana = (pel: PelaksanaSOP) => {
    if (pel.jumlahPos > 0) {
      showToast(
        `Pelaksana "${pel.nama}" tidak dapat dihapus karena sudah terhubung ke ${pel.jumlahPos} POS.`,
        'error'
      )
      return
    }
    setDeletePelaksana(pel)
  }

  return (
    <div className="space-y-3">
      <PageHeader
        breadcrumb={[{ label: 'Kelola Pelaksana SOP' }]}
        title="Kelola Pelaksana SOP"
        description="Master data pelaksana SOP yang digunakan lintas POS."
      />

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
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th className="px-2 py-1.5 w-[26%]">Nama pelaksana</Table.Th>
                  <Table.Th className="px-2 py-1.5 w-[52%]">Deskripsi</Table.Th>
                  <Table.Th align="center" className="px-2 py-1.5 w-[10%]">Jumlah POS</Table.Th>
                  <Table.Th align="center" className="px-2 py-1.5 w-[12%]">Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pelaksanaList.map((pel) => (
                  <Table.BodyRow key={pel.id} className="last:border-0">
                    <Table.Td className="px-2 py-1.5 align-top">
                      <p className="text-xs font-medium text-gray-900">{pel.nama}</p>
                    </Table.Td>
                    <Table.Td className="px-2 py-1.5 align-top">
                      <p className="text-[11px] text-gray-700 whitespace-pre-line">
                        {pel.deskripsi || '-'}
                      </p>
                    </Table.Td>
                    <Table.Td className="px-2 py-1.5 text-center align-top">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[11px] text-gray-700 min-w-[32px]">
                        {pel.jumlahPos}
                      </span>
                    </Table.Td>
                    <Table.Td className="px-2 py-1.5 text-center align-top">
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
                    </Table.Td>
                  </Table.BodyRow>
                ))}
              </tbody>
            </Table.Table>
          )}
        </div>
      </div>

      {/* Dialog: tambah / edit Pelaksana SOP */}
      <FormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingPelaksana(null)
          }
        }}
        title={editingPelaksana ? 'Edit Pelaksana SOP' : 'Tambah Pelaksana SOP'}
        description="Atur master data pelaksana SOP yang dapat dikaitkan dengan berbagai POS."
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleSimpanPelaksana}
        confirmDisabled={!pelaksanaNama.trim()}
        size="md"
      >
        <FormField label="Nama pelaksana">
          <Input
            className="h-8 text-xs"
            value={pelaksanaNama}
            onChange={(e) => setPelaksanaNama(e.target.value)}
            placeholder="Mis. Pelaksana Utama"
          />
        </FormField>
        <FormField label="Deskripsi">
          <Input
            className="h-8 text-xs"
            value={pelaksanaDeskripsi}
            onChange={(e) => setPelaksanaDeskripsi(e.target.value)}
            placeholder="Ringkasan peran atau cakupan tugas"
          />
        </FormField>
        <FormField label="Jumlah POS">
          <Input
            type="number"
            min={0}
            className="h-8 text-xs w-24"
            value={pelaksanaJumlahPos}
            onChange={(e) => setPelaksanaJumlahPos(e.target.value)}
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Jika jumlah POS &gt; 0, pelaksana tidak dapat dihapus.
          </p>
        </FormField>
      </FormDialog>

      <ConfirmDialog
        open={deletePelaksana != null}
        onOpenChange={(open) => !open && setDeletePelaksana(null)}
        title="Hapus pelaksana?"
        description={
          deletePelaksana
            ? `Pelaksana "${deletePelaksana.nama}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        onConfirm={() => {
          if (deletePelaksana) {
            setPelaksanaList((prev) => prev.filter((p) => p.id !== deletePelaksana.id))
            showToast(`Pelaksana "${deletePelaksana.nama}" berhasil dihapus.`)
          }
        }}
      />
    </div>
  )
}

