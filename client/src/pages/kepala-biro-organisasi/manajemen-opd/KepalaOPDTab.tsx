import { Edit, History, ArrowRightCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import { KepalaOPDFormDialog } from './KepalaOPDFormDialog'
import { TambahPenugasanKepalaDialog } from './TambahPenugasanKepalaDialog'
import { PindahJabatanDialog } from './PindahJabatanDialog'
import { RiwayatJabatanDialog } from './RiwayatJabatanDialog'
import { usePagination } from '@/hooks/usePagination'

type PersonWithActive = {
  name: string
  email: string
  phone: string
  nip: string
  activeAssignment?: KepalaOPD & { opdName: string }
}

type RiwayatRow = KepalaOPD & { opdName: string }

export interface KepalaOPDTabProps {
  opdList: OPD[]
  filteredPersons: PersonWithActive[]
  selectedOPD: OPD | null
  setSelectedOPD: (opd: OPD | null) => void
  // Dialog state (dari useManajemenOPDState atau parent)
  kepalaFormOpen: boolean
  setKepalaFormOpen: (open: boolean) => void
  tambahPenugasanOpen: boolean
  setTambahPenugasanOpen: (open: boolean) => void
  pindahDialogOpen: boolean
  setPindahDialogOpen: (open: boolean) => void
  setPindahDialogPerson: (p: { name: string; email: string; phone: string; nip?: string } | null) => void
  riwayatDialogOpen: boolean
  setRiwayatDialogOpen: (open: boolean) => void
  riwayatDialogPerson: { name: string; email: string } | null
  setRiwayatDialogPerson: (p: { name: string; email: string } | null) => void
  editingKepala: KepalaOPD | null
  kepalaForm: { name: string; nip: string; email: string; phone: string }
  setKepalaForm: React.Dispatch<React.SetStateAction<{ name: string; nip: string; email: string; phone: string }>>
  penugasanForm: { opdId: string; name: string; nip: string; email: string }
  setPenugasanForm: React.Dispatch<React.SetStateAction<{ opdId: string; name: string; nip: string; email: string }>>
  pindahForm: { opdId: string }
  setPindahForm: React.Dispatch<React.SetStateAction<{ opdId: string }>>
  pindahDialogPerson: { name: string; email: string; phone: string; nip?: string } | null
  // Helpers & handlers
  getKepalaAktif: (opdId: string) => KepalaOPD | undefined
  getKepalaByOPD: (opdId: string) => KepalaOPD[]
  getRiwayatForUser: (name: string, email: string) => RiwayatRow[]
  canDeleteKepala: (k: KepalaOPD) => boolean
  onSaveKepala: () => void
  onSavePenugasan: () => void
  onSavePindah: () => void
  onOpenKepalaForm: (kepala?: KepalaOPD) => void
  onSetKepalaAktif: (kepalaId: string) => void
  onAkhiriJabatan: (kepalaId: string) => void
  onDeleteKepala: (id: string) => void
}

export function KepalaOPDTab({
  opdList,
  filteredPersons,
  selectedOPD,
  setSelectedOPD,
  kepalaFormOpen,
  setKepalaFormOpen,
  tambahPenugasanOpen,
  setTambahPenugasanOpen,
  pindahDialogOpen,
  setPindahDialogOpen,
  setPindahDialogPerson,
  riwayatDialogOpen,
  setRiwayatDialogOpen,
  riwayatDialogPerson,
  setRiwayatDialogPerson,
  editingKepala,
  kepalaForm,
  setKepalaForm,
  penugasanForm,
  setPenugasanForm,
  pindahForm,
  setPindahForm,
  pindahDialogPerson,
  getKepalaAktif,
  getKepalaByOPD,
  getRiwayatForUser,
  canDeleteKepala,
  onSaveKepala,
  onSavePenugasan,
  onSavePindah,
  onOpenKepalaForm,
  onSetKepalaAktif,
  onAkhiriJabatan,
  onDeleteKepala,
}: KepalaOPDTabProps) {
  const riwayatRows = riwayatDialogPerson
    ? getRiwayatForUser(riwayatDialogPerson.name, riwayatDialogPerson.email)
    : []

  const pagination = usePagination(filteredPersons.length)
  const rowsToShow = pagination.showPagination
    ? filteredPersons.slice(pagination.startIndex, pagination.endIndex)
    : filteredPersons

  return (
    <>
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
            {rowsToShow.map((p) => {
              const act = p.activeAssignment
              return (
                <Table.BodyRow key={`${p.name}|${p.email}`}>
                  <Table.Td className="font-medium text-gray-900">{p.name}</Table.Td>
                  <Table.Td className="text-gray-600 font-mono text-xs">{p.nip || '—'}</Table.Td>
                  <Table.Td className="text-gray-600">{p.email}</Table.Td>
                  <Table.Td>{act?.opdName ?? '—'}</Table.Td>
                  <Table.Td>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setRiwayatDialogPerson({ name: p.name, email: p.email })
                          setRiwayatDialogOpen(true)
                        }}
                        title="Riwayat jabatan"
                      >
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
                            onOpenKepalaForm(act)
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
        <Table.Pagination
          totalItems={filteredPersons.length}
          currentPage={pagination.page}
          onPageChange={pagination.setPage}
          label="kepala"
        />
      </Table.Card>
      {filteredPersons.length === 0 && (
        <div className="p-6 text-center text-gray-500 text-xs">
          Belum ada data Kepala OPD. Gunakan &quot;Tambah Kepala OPD&quot; atau dari tab Manajemen OPD pilih OPD → Riwayat Kepala OPD.
        </div>
      )}

      <KepalaOPDFormDialog
        open={kepalaFormOpen}
        onOpenChange={setKepalaFormOpen}
        title={editingKepala ? 'Edit Kepala OPD' : 'Tambah Kepala OPD'}
        description={selectedOPD && !editingKepala ? `OPD: ${selectedOPD.name}` : undefined}
        form={kepalaForm}
        setForm={setKepalaForm}
        editingKepala={editingKepala}
        selectedOPD={selectedOPD}
        onConfirm={onSaveKepala}
      />

      <TambahPenugasanKepalaDialog
        open={tambahPenugasanOpen}
        onOpenChange={setTambahPenugasanOpen}
        form={penugasanForm}
        setForm={setPenugasanForm}
        opdList={opdList}
        onConfirm={onSavePenugasan}
      />

      <PindahJabatanDialog
        open={pindahDialogOpen}
        onOpenChange={setPindahDialogOpen}
        person={pindahDialogPerson}
        form={pindahForm}
        setForm={setPindahForm}
        opdList={opdList}
        getKepalaAktif={getKepalaAktif}
        onConfirm={onSavePindah}
        onClose={() => {
          setPindahDialogPerson(null)
          setPindahForm({ opdId: '' })
        }}
      />

      <RiwayatJabatanDialog
        open={riwayatDialogOpen}
        onOpenChange={setRiwayatDialogOpen}
        person={riwayatDialogPerson}
        riwayatRows={riwayatRows}
        opdList={opdList}
        onAkhiriJabatan={onAkhiriJabatan}
        onSetKepalaAktif={onSetKepalaAktif}
        onOpenKepalaForm={onOpenKepalaForm}
        onDeleteKepala={onDeleteKepala}
        canDeleteKepala={canDeleteKepala}
        getKepalaByOPD={getKepalaByOPD}
        setSelectedOPD={setSelectedOPD}
        onClose={() => setRiwayatDialogPerson(null)}
      />
    </>
  )
}
