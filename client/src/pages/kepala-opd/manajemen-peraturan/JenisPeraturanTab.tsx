import { Edit, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { usePagination } from '@/hooks/usePagination'
import type { JenisPeraturan } from '@/lib/types/peraturan'

function getTingkatColor(tingkat: string): string {
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

export interface JenisPeraturanTabProps {
  filteredJenis: JenisPeraturan[]
  canEditJenis: (jenis: JenisPeraturan) => boolean
  isJenisDialogOpen: boolean
  setIsJenisDialogOpen: (open: boolean) => void
  editingJenis: JenisPeraturan | null
  jenisFormData: {
    nama: string
    kode: string
    deskripsi: string
    tingkat: 'Pusat' | 'Daerah' | 'Internal'
  }
  setJenisFormData: React.Dispatch<React.SetStateAction<JenisPeraturanTabProps['jenisFormData']>>
  onOpenJenisDialog: (jenis?: JenisPeraturan) => void
  onSaveJenis: () => void
  onDeleteJenis: (id: string) => void
}

export function JenisPeraturanTab({
  filteredJenis,
  canEditJenis,
  isJenisDialogOpen,
  setIsJenisDialogOpen,
  editingJenis,
  jenisFormData,
  setJenisFormData,
  onOpenJenisDialog,
  onSaveJenis,
  onDeleteJenis,
}: JenisPeraturanTabProps) {
  const pagination = usePagination(filteredJenis.length)
  const rowsToShow = pagination.showPagination
    ? filteredJenis.slice(pagination.startIndex, pagination.endIndex)
    : filteredJenis

  return (
    <>
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
            {rowsToShow.map((jenis) => (
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
                      onClick={() => onOpenJenisDialog(jenis)}
                      disabled={!canEditJenis(jenis)}
                    />
                    <IconActionButton
                      icon={Trash2}
                      title={!canEditJenis(jenis) ? 'Hanya peraturan yang Anda buat yang dapat dihapus' : 'Hapus'}
                      destructive
                      onClick={() => onDeleteJenis(jenis.id)}
                      disabled={!canEditJenis(jenis)}
                    />
                  </div>
                </Table.Td>
              </Table.BodyRow>
            ))}
          </tbody>
        </Table.Table>
        <Table.Pagination
          totalItems={filteredJenis.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="jenis"
        />
      </Table.Card>
      {filteredJenis.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tidak ada jenis peraturan ditemukan</p>
        </div>
      )}

      <FormDialog
        open={isJenisDialogOpen}
        onOpenChange={setIsJenisDialogOpen}
        title={editingJenis ? 'Edit Jenis Peraturan' : 'Tambah Jenis Peraturan'}
        description={
          editingJenis
            ? 'Perbarui informasi jenis peraturan'
            : 'Tambahkan jenis peraturan baru'
        }
        confirmLabel={editingJenis ? 'Perbarui' : 'Tambah'}
        cancelLabel="Batal"
        onConfirm={onSaveJenis}
        confirmDisabled={!jenisFormData.nama || !jenisFormData.kode}
        size="md"
      >
        <FormField label="Nama Jenis Peraturan" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Peraturan Menteri Pendidikan dan Kebudayaan"
            value={jenisFormData.nama}
            onChange={(e) => setJenisFormData((prev) => ({ ...prev, nama: e.target.value }))}
          />
        </FormField>
        <FormField label="Kode/Singkatan" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Permendikbud"
            value={jenisFormData.kode}
            onChange={(e) => setJenisFormData((prev) => ({ ...prev, kode: e.target.value }))}
          />
          <p className="text-xs text-gray-500 mt-1">Kode yang akan muncul di dropdown</p>
        </FormField>
        <FormField label="Tingkat" required>
          <Select
            value={jenisFormData.tingkat}
            onValueChange={(tingkat) =>
              setJenisFormData((prev) => ({
                ...prev,
                tingkat: tingkat as 'Pusat' | 'Daerah' | 'Internal',
              }))
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
              setJenisFormData((prev) => ({ ...prev, deskripsi: e.target.value }))
            }
          />
        </FormField>
      </FormDialog>
    </>
  )
}
