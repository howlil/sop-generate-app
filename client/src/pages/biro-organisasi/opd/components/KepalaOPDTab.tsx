import { Edit, History, ArrowRightCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { KepalaOPDFormDialog } from './KepalaOPDFormDialog'
import { TambahKepalaOPDDialog } from './TambahKepalaOPDDialog'
import { PindahJabatanDialog } from './PindahJabatanDialog'
import { RiwayatJabatanDialog } from './RiwayatJabatanDialog'
import type {
  FormTambahKepalaState,
  KepalaFormState,
  RiwayatDialogPerson,
} from '@/types/ui/organisasi'
import type {
  OPDOption as OPD,
  KepalaOPDRow,
  PersonWithActive,
  KepalaCandidate,
  PindahDialogPersonState,
  RiwayatRow,
} from './types'

export interface KepalaOPDTabProps {
  opdList: OPD[]
  filteredPersons: PersonWithActive[]
  selectedOPD: OPD | null
  setSelectedOPD: (opd: OPD | null) => void
  // Dialog state (dari useManajemenOPDState atau parent)
  kepalaFormOpen: boolean
  setKepalaFormOpen: (open: boolean) => void
  tambahKepalaOpen: boolean
  setTambahKepalaOpen: (open: boolean) => void
  pindahDialogOpen: boolean
  setPindahDialogOpen: (open: boolean) => void
  setPindahDialogPerson: (p: PindahDialogPersonState | null) => void
  riwayatDialogOpen: boolean
  setRiwayatDialogOpen: (open: boolean) => void
  riwayatDialogPerson: RiwayatDialogPerson | null
  setRiwayatDialogPerson: (p: RiwayatDialogPerson | null) => void
  editingKepala: KepalaOPDRow | null
  kepalaForm: KepalaFormState
  setKepalaForm: React.Dispatch<React.SetStateAction<KepalaFormState>>
  formTambahKepala: FormTambahKepalaState
  setFormTambahKepala: React.Dispatch<React.SetStateAction<FormTambahKepalaState>>
  kepalaCandidates: KepalaCandidate[]
  pindahForm: { opdId: string }
  setPindahForm: React.Dispatch<React.SetStateAction<{ opdId: string }>>
  pindahDialogPerson: PindahDialogPersonState | null
  // Helpers & handlers
  getKepalaAktif: (opdId: string) => KepalaOPDRow | undefined
  getKepalaByOPD: (opdId: string) => KepalaOPDRow[]
  getRiwayatForUser: (name: string, email: string) => RiwayatRow[]
  canDeleteKepala: (k: KepalaOPDRow) => boolean
  onSaveKepala: () => void
  onSaveTambahKepala: () => void
  onSavePindah: () => void
  onOpenKepalaForm: (kepala?: KepalaOPDRow) => void
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
  tambahKepalaOpen,
  setTambahKepalaOpen,
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
  formTambahKepala,
  setFormTambahKepala,
  kepalaCandidates,
  pindahForm,
  setPindahForm,
  pindahDialogPerson,
  getKepalaAktif,
  getKepalaByOPD,
  getRiwayatForUser,
  canDeleteKepala,
  onSaveKepala,
  onSaveTambahKepala,
  onSavePindah,
  onOpenKepalaForm,
  onSetKepalaAktif,
  onAkhiriJabatan,
  onDeleteKepala,
}: KepalaOPDTabProps) {
  const riwayatRows =
    riwayatDialogPerson && riwayatDialogPerson.email
      ? getRiwayatForUser(riwayatDialogPerson.name, riwayatDialogPerson.email)
      : []

  return (
    <>
      <Table.Paginated data={filteredPersons} label="kepala" className="w-full">
        {(pageData) => (
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
              {pageData.map((p) => {
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
                            const assignmentId = act?.id
                            if (!assignmentId) return
                            setPindahDialogPerson({
                              id: assignmentId,
                              name: p.name,
                              email: p.email,
                              phone: p.phone,
                              nip: p.nip,
                            })
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
        )}
      </Table.Paginated>
      {filteredPersons.length === 0 && (
        <div className="p-6 text-center text-gray-500 text-xs">
          Belum ada data OPD. Gunakan &quot;Tambah OPD&quot; atau dari tab Manajemen OPD pilih OPD → Riwayat OPD.
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

      <TambahKepalaOPDDialog
        open={tambahKepalaOpen}
        onOpenChange={setTambahKepalaOpen}
        form={formTambahKepala}
        setForm={setFormTambahKepala}
        opdList={opdList}
        users={kepalaCandidates}
        onConfirm={onSaveTambahKepala}
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
