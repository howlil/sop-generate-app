import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Eye, Building, History, Pencil } from 'lucide-react'
import { getActiveCaseForSop, addEvaluationCase } from '@/lib/stores/evaluasi-store'
import type { Penugasan, SOPItem } from '@/lib/types/penugasan'
import {
  getPenugasanList,
  setPenugasanList as setStorePenugasanList,
  addPenugasan as addStorePenugasan,
  updatePenugasan as updateStorePenugasan,
  subscribePenugasan,
} from '@/lib/stores/penugasan-store'
import {
  SEED_PENUGASAN_INITIAL,
  SEED_OPD_LIST_EVALUASI,
  SEED_SOP_BY_OPD,
  SEED_TIM_MONEV_OPTIONS,
} from '@/lib/seed/penugasan-evaluasi-seed'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/data-table'
import { IconActionButton } from '@/components/ui/icon-action-button'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { useFilteredList } from '@/hooks/useFilteredList'
import { showToast } from '@/lib/stores'
import { generateId } from '@/utils/generate-id'
import { SearchToolbar } from '@/components/ui/search-toolbar'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { STATUS_SOP_CAN_SELECT_FOR_EVALUASI } from '@/lib/types/sop'
import { formatDateId } from '@/utils/format-date'
import { STATUS_DOMAIN } from '@/lib/constants/status-domains'
import { ROUTES } from '@/lib/constants/routes'

export function ManajemenEvaluasiSOP() {
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPenugasanId, setEditingPenugasanId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    jenis: 'Inisiasi Biro' as 'Inisiasi Biro' | 'Request OPD',
    opd: '',
    selectedSOPs: [] as string[],
    timMonev: '',
    catatan: '',
  })

  const [penugasanList, setPenugasanList] = useState<Penugasan[]>(() =>
    getPenugasanList().length > 0 ? getPenugasanList() : SEED_PENUGASAN_INITIAL
  )

  useEffect(() => {
    if (getPenugasanList().length === 0) setStorePenugasanList(SEED_PENUGASAN_INITIAL)
    const unsub = subscribePenugasan(() => setPenugasanList(getPenugasanList()))
    return unsub
  }, [])

  const opdList = SEED_OPD_LIST_EVALUASI

  /** OPD yang mengajukan request evaluasi ke Biro (request dari OPD). Tampilkan badge "Request Biro" saat pilih OPD. */
  const opdYangRequestBiro = ['DPMPTSP']

  /** SOP per OPD; status SOP = single source of truth. Filter layak evaluasi: Siap Dievaluasi, Berlaku, Diajukan Evaluasi. Batch/penugasan dipakai untuk verifikasi Berita Acara (1 BA = 1 evaluasi OPD). */
  const [sopByOPD] = useState(SEED_SOP_BY_OPD)

  /** Riwayat evaluasi untuk satu SOP: penugasan yang sudah Selesai/Terverifikasi dan memuat SOP ini. */
  const getRiwayatEvaluasiSop = (sopId: string) =>
    penugasanList.filter(
      (p) =>
        (p.status === 'Selesai' || p.status === 'Terverifikasi') &&
        p.sopList.some((s: SOPItem) => s.id === sopId)
    )

  const [riwayatSopId, setRiwayatSopId] = useState<string | null>(null)

  const timMonevList = SEED_TIM_MONEV_OPTIONS

  const { filteredList, searchQuery, setSearchQuery } = useFilteredList(penugasanList, {
    searchKeys: [
      (item) =>
        `${item.opd} ${item.jenis} ${(item.sopList ?? []).map((s: SOPItem) => s.nama).join(' ')}`,
    ],
  })

  const goToDetail = (item: Penugasan) => {
    navigate({ to: ROUTES.BIRO_ORGANISASI.DETAIL_EVALUASI, params: { id: item.id } })
  }

  const resetForm = () => {
    setFormData({
      jenis: 'Inisiasi Biro',
      opd: '',
      selectedSOPs: [],
      timMonev: '',
      catatan: '',
    })
    setEditingPenugasanId(null)
  }

  const openEditDialog = (item: Penugasan) => {
    setFormData({
      jenis: item.jenis,
      opd: item.opd,
      selectedSOPs: item.sopList.map((s: SOPItem) => s.id),
      timMonev: item.timMonev ?? '',
      catatan: item.catatan ?? '',
    })
    setEditingPenugasanId(item.id)
    setIsCreateOpen(true)
  }

  const toggleSOP = (sopId: string) => {
    if (getActiveCaseForSop(sopId)) return
    if (formData.selectedSOPs.includes(sopId)) {
      setFormData({
        ...formData,
        selectedSOPs: formData.selectedSOPs.filter((id) => id !== sopId),
      })
    } else {
      setFormData({ ...formData, selectedSOPs: [...formData.selectedSOPs, sopId] })
    }
  }

  const canSubmit = () => {
    return !!(formData.opd && formData.selectedSOPs.length > 0 && formData.timMonev)
  }

  const handleTugaskan = () => {
    if (!canSubmit()) return
    const opdSOPs = (sopByOPD[formData.opd] ?? []).filter((s) =>
      STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status)
    )
    const sopList = opdSOPs.filter((s) => formData.selectedSOPs.includes(s.id))
    try {
      const sourceRef = generateId('src')
      const ec = addEvaluationCase({
        source_type: formData.jenis === 'Request OPD' ? 'OPD_REQUEST' : 'BIRO_INITIATIVE',
        source_ref: sourceRef,
        status: 'Assigned',
        sopIds: formData.selectedSOPs,
        timEvaluator: formData.timMonev,
        opd: formData.opd,
      })
      addStorePenugasan({
        id: generateId(),
        jenis: formData.jenis,
        tanggalRequest: formData.jenis === 'Request OPD' ? new Date().toISOString().slice(0, 10) : undefined,
        opd: formData.opd,
        sopList: sopList.map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor })),
        timMonev: formData.timMonev,
        status: 'Sudah Ditugaskan',
        catatan: formData.catatan || '',
        evaluationCaseId: ec.id,
      })
      showToast('Penugasan evaluasi berhasil dibuat. Tim evaluator telah ditugaskan.')
      setIsCreateOpen(false)
      resetForm()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'SOP yang dipilih sudah dalam evaluasi aktif.', 'error')
    }
  }

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Manajemen Evaluasi SOP' }]}
      title="Manajemen Evaluasi SOP"
      description="Kelola batch evaluasi per OPD untuk verifikasi Berita Acara (1 BA = 1 evaluasi OPD). Tim Evaluasi evaluasi langsung dari Daftar SOP Evaluasi."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari OPD atau SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              resetForm()
              setEditingPenugasanId(null)
              setIsCreateOpen(true)
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Penugasan Baru
          </Button>
        </SearchToolbar>
      }
    >
      <Table.Card>
        <Table.Table>
          <thead>
            <Table.HeadRow>
              <Table.Th>OPD</Table.Th>
              <Table.Th>Jenis</Table.Th>
              <Table.Th align="center">Status</Table.Th>
              <Table.Th align="center">Aksi</Table.Th>
            </Table.HeadRow>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <Table.Td colSpan={4} className="p-8 text-center text-gray-500">
                  Tidak ada batch evaluasi. Gunakan &quot;Buat Penugasan Baru&quot; untuk membuat batch verifikasi per OPD.
                </Table.Td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <Table.BodyRow key={item.id}>
                  <Table.Td className="font-medium text-gray-900">{item.opd}</Table.Td>
                  <Table.Td>
                    <Badge variant="outline" className="text-xs">{item.jenis}</Badge>
                  </Table.Td>
                  <Table.Td className="text-center">
                    <StatusBadge status={item.status} domain={STATUS_DOMAIN.EVALUASI_BIRO} />
                  </Table.Td>
                  <Table.Td>
                    <div className="flex items-center justify-center gap-1">
                      <IconActionButton icon={Eye} title="Detail" onClick={() => goToDetail(item)} />
                      {item.status !== 'Selesai' && item.status !== 'Terverifikasi' && (
                        <IconActionButton icon={Pencil} title="Edit" onClick={() => openEditDialog(item)} />
                      )}
                    </div>
                  </Table.Td>
                </Table.BodyRow>
              ))
            )}
          </tbody>
        </Table.Table>
      </Table.Card>

      {/* Create / Edit Dialog - Form sama untuk buat dan edit */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setEditingPenugasanId(null)
        }}
        title={editingPenugasanId ? 'Edit Perencanaan & Penugasan' : 'Buat Perencanaan & Penugasan'}
        description={
          editingPenugasanId
            ? 'Ubah OPD, SOP, atau tim monev untuk penugasan ini.'
            : 'Pilih OPD dan SOP yang akan dievaluasi, lalu tugaskan tim monev.'
        }
        confirmLabel={editingPenugasanId ? 'Simpan' : 'Tugaskan'}
        cancelLabel="Batal"
        onConfirm={() => {
          if (editingPenugasanId) {
            const opdSOPs = (sopByOPD[formData.opd] ?? []).filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
            const sopList = opdSOPs.filter((s) => formData.selectedSOPs.includes(s.id)).map((s) => ({ id: s.id, nama: s.nama, nomor: s.nomor }))
            updateStorePenugasan(editingPenugasanId, {
              jenis: formData.jenis,
              opd: formData.opd,
              sopList,
              timMonev: formData.timMonev,
              catatan: formData.catatan,
            })
            showToast('Penugasan berhasil diperbarui.')
            setIsCreateOpen(false)
            setEditingPenugasanId(null)
          } else {
            handleTugaskan()
          }
        }}
        confirmDisabled={!canSubmit()}
        size="xl"
      >
        <FormField label="Pilih OPD" required>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="flex-1 min-w-[200px]"
              value={formData.opd}
              onValueChange={(opd) => {
                setFormData({
                  ...formData,
                  opd,
                  selectedSOPs: [],
                  jenis: opdYangRequestBiro.includes(opd) ? 'Request OPD' : 'Inisiasi Biro',
                })
              }}
              placeholder="Pilih OPD"
              options={opdList.map((opd) => ({
                value: opd.nama,
                label: `${opd.nama} (${opd.kode})${opdYangRequestBiro.includes(opd.nama) ? ' — Request Biro' : ''}`,
              }))}
            />
            {formData.opd && opdYangRequestBiro.includes(formData.opd) && (
              <Badge variant="default" className="shrink-0 px-2.5 py-1 text-xs font-semibold gap-1">
                <Building className="w-3.5 h-3.5" aria-hidden />
                Request Biro
              </Badge>
            )}
          </div>
        </FormField>

        {formData.opd && (
          <FormField
            label="Pilih SOP untuk Dievaluasi (layak evaluasi). Gunakan ikon Riwayat untuk melihat riwayat evaluasi SOP."
            required
          >
            <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
              {(sopByOPD[formData.opd] ?? [])
                .filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
                .length > 0 ? (
                (sopByOPD[formData.opd] ?? [])
                  .filter((s) => STATUS_SOP_CAN_SELECT_FOR_EVALUASI.includes(s.status))
                  .map((sop) => {
                    const activeCase = getActiveCaseForSop(sop.id)
                    const inCase = !!activeCase
                    return (
                      <label
                        key={sop.id}
                        className={`flex items-start gap-2 p-2 rounded ${inCase ? 'bg-gray-100 cursor-not-allowed opacity-80' : 'hover:bg-gray-50 cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 mt-0.5 rounded border-gray-300"
                          checked={formData.selectedSOPs.includes(sop.id)}
                          onChange={() => toggleSOP(sop.id)}
                          disabled={inCase}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{sop.nama}</p>
                          <p className="text-xs text-gray-500">{sop.nomor}</p>
                          {inCase && (
                            <p className="text-xs text-amber-700 mt-0.5">
                              Sudah dalam evaluasi ({activeCase.id})
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 p-0 shrink-0"
                          title="Riwayat evaluasi SOP ini"
                          onClick={(e) => { e.preventDefault(); setRiwayatSopId(sop.id); }}
                        >
                          <History className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </label>
                    )
                  })
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  Tidak ada SOP dengan status Siap Dievaluasi / Berlaku / Diajukan Evaluasi untuk OPD ini
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{formData.selectedSOPs.length} SOP dipilih</p>
          </FormField>
        )}

        <FormField label="Pilih Tim Monev" required>
          <Select
            value={formData.timMonev}
            onValueChange={(timMonev) => setFormData({ ...formData, timMonev })}
            placeholder="Pilih Tim Monev"
            options={timMonevList.map((tim) => ({
              value: tim.nama,
              label: tim.nama,
            }))}
          />
        </FormField>

        <FormField label="Catatan">
          <Textarea
            className="text-xs min-h-[60px]"
            placeholder="Catatan atau instruksi untuk tim monev"
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
          />
        </FormField>
      </FormDialog>

      {/* Dialog Riwayat Evaluasi per SOP */}
      <Dialog open={!!riwayatSopId} onOpenChange={(open) => !open && setRiwayatSopId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Riwayat Evaluasi SOP
            </DialogTitle>
            <DialogDescription className="text-xs">
              {riwayatSopId && (() => {
                const nama = formData.opd
                  ? (sopByOPD[formData.opd] ?? []).find((s) => s.id === riwayatSopId)?.nama
                  : penugasanList.flatMap((p) => p.sopList).find((s) => s.id === riwayatSopId)?.nama
                return nama ? `SOP: ${nama}` : `SOP ID: ${riwayatSopId}`
              })()}
            </DialogDescription>
          </DialogHeader>
          {riwayatSopId && (
            <div className="max-h-72 overflow-y-auto space-y-2">
              {getRiwayatEvaluasiSop(riwayatSopId).length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">Belum pernah dievaluasi</p>
              ) : (
                getRiwayatEvaluasiSop(riwayatSopId).map((p) => {
                  const sopInBatch = p.sopList.find((s: SOPItem) => s.id === riwayatSopId)
                  return (
                    <div
                      key={p.id}
                      className="p-3 border border-gray-200 rounded-md text-xs space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">{p.opd} — {p.jenis}</span>
                        <StatusBadge status={p.status} domain={STATUS_DOMAIN.EVALUASI_BIRO} />
                      </div>
                      {p.tanggalEvaluasi && (
                        <p className="text-gray-600">Tgl evaluasi: {formatDateId(p.tanggalEvaluasi)}</p>
                      )}
                      {sopInBatch?.status && (
                        <p className="text-gray-700">Hasil SOP ini: <span className={sopInBatch.status === 'Sesuai' ? 'text-green-700 font-medium' : sopInBatch.status === 'Revisi Biro' ? 'text-amber-700 font-medium' : ''}>{sopInBatch.status}</span></p>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRiwayatSopId(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ListPageLayout>
  )
}
