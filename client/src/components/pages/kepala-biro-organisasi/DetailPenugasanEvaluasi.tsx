import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, CheckCircle, Download, Building, ChevronLeft, ChevronRight, List, MessageSquare } from 'lucide-react'
import { SOPPreviewTemplate } from '@/components/sop/SOPPreviewTemplate'
import { getPenugasanById, getPenugasanList, subscribe, updatePenugasan } from '@/lib/penugasan-store'
import type { Penugasan } from '@/lib/penugasan-store'
import { getTTEProfile, verifyPin, addTTESignature } from '@/lib/tte'
import { PinVerificationDialog } from '@/components/tte/PinVerificationDialog'
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/ui/status-badge'

function getHasilStatusColor(s: string) {
  switch (s) {
    case 'Sesuai': return 'bg-green-100 text-green-700'
    case 'Perlu Perbaikan': return 'bg-yellow-100 text-yellow-700'
    case 'Revisi Biro': return 'bg-amber-100 text-amber-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function DetailPenugasanEvaluasi() {
  const { id } = useParams({ from: '/kepala-biro-organisasi/manajemen-evaluasi-sop/detail/$id' })
  const navigate = useNavigate()
  const [penugasan, setPenugasan] = useState<Penugasan | null>(() => getPenugasanById(id) ?? null)
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isBAOpen, setIsBAOpen] = useState(false)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [pinDialogOpen, setPinDialogOpen] = useState(false)
  const tteProfile = getTTEProfile('kepala-biro-organisasi')
  const canVerifyWithTTE = tteProfile?.emailVerified === true

  useEffect(() => {
    const unsub = subscribe(() => setPenugasan(getPenugasanById(id) ?? null))
    return unsub
  }, [id])

  /** Verifikasi batch tersedia jika status Selesai, ada SOP, dan belum diverifikasi (tanpa syarat semua SOP Sesuai). */
  const canVerify = (item: Penugasan) =>
    item.status === 'Selesai' &&
    (item.sopList?.length ?? 0) > 0 &&
    !item.isVerified

  const runVerifikasiWithTTE = () => {
    if (!penugasan || !tteProfile) return
    const verifiedCount = getPenugasanList().filter((h) => h.isVerified).length
    const batchNumber = `BA/BIRO/${String(verifiedCount + 1).padStart(3, '0')}/II/2026`
    const payload = addTTESignature(
      'kepala-biro-organisasi',
      tteProfile.nip,
      tteProfile.nama,
      'batch-evaluasi-' + penugasan.id,
      penugasan.opd,
      batchNumber
    )
    updatePenugasan(penugasan.id, {
      status: 'Terverifikasi',
      isVerified: true,
      nomorBA: batchNumber,
      tanggalVerifikasi: new Date().toISOString().split('T')[0],
      kepalaBiro: tteProfile.nama,
      tteSignaturePayload: payload,
    })
    setToastMessage('Batch evaluasi berhasil diverifikasi dengan TTE BSRE. Berita Acara telah dibuat.')
    setPinDialogOpen(false)
  }

  const handlePinConfirm = (pin: string): boolean => {
    const profile = getTTEProfile('kepala-biro-organisasi')
    if (!profile || !verifyPin(pin, profile.pinHash)) return false
    runVerifikasiWithTTE()
    return true
  }

  const sopList = penugasan?.sopList ?? []
  const firstSopId = sopList[0]?.id ?? null
  const effectiveSopId = selectedSopId ?? firstSopId
  const displaySop = sopList.find((s) => s.id === effectiveSopId)

  if (!penugasan) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Penugasan tidak ditemukan.</p>
        <Button variant="outline" size="icon" className="h-8 w-8 mt-4" onClick={() => navigate({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' })} title="Kembali">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0">
      <PageHeader
        breadcrumb={[
          { label: 'Manajemen Evaluasi SOP', to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' },
          { label: 'Detail' },
        ]}
        title="Detail Evaluasi SOP"
        description="Informasi penugasan dan hasil evaluasi"
        leading={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: '/kepala-biro-organisasi/manajemen-evaluasi-sop' })}
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        }
      />

      {toastMessage && (
        <div className="flex-shrink-0 bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-2 rounded-md">
          {toastMessage}
        </div>
      )}

      {/* Satu blok: tinggi mengisi sisa viewport, scroll hanya di dalam panel */}
      <div className="flex-1 min-h-0 rounded-lg border border-gray-200 overflow-hidden bg-white flex flex-col">
        {/* Bagian atas: informasi OPD & detail evaluasi */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Informasi OPD & Evaluasi</h2>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">{penugasan.opd}</span>
              </div>
              <Badge variant="outline" className="text-xs">{penugasan.jenis}</Badge>
              <StatusBadge status={penugasan.status} domain="evaluasi-biro" />
            </div>
            {canVerify(penugasan) && (
              canVerifyWithTTE ? (
                <Button size="sm" className="h-8 text-xs gap-1.5 shrink-0" onClick={() => setPinDialogOpen(true)}>
                  <CheckCircle className="w-3.5 h-3.5" /> Verifikasi Batch (TTE)
                </Button>
              ) : (
                <Link to="/kepala-biro-organisasi/ttd-elektronik">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> Buat TTD dulu
                  </Button>
                </Link>
              )
            )}
            {penugasan.isVerified && penugasan.nomorBA && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0" onClick={() => setIsBAOpen(true)}>
                <FileText className="w-3.5 h-3.5" /> Lihat BA
              </Button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs text-gray-600">
            {penugasan.tanggalRequest && (
              <div><span className="text-gray-500">Tanggal Request:</span> {new Date(penugasan.tanggalRequest).toLocaleDateString('id-ID')}</div>
            )}
            {penugasan.timMonev && <div><span className="text-gray-500">Tim Monev:</span> {penugasan.timMonev}</div>}
            {penugasan.tanggalEvaluasi && (
              <div><span className="text-gray-500">Tgl Evaluasi:</span> {new Date(penugasan.tanggalEvaluasi).toLocaleDateString('id-ID')}</div>
            )}
            {penugasan.tanggalVerifikasi && (
              <div><span className="text-gray-500">Tgl Verifikasi:</span> {new Date(penugasan.tanggalVerifikasi).toLocaleDateString('id-ID')}</div>
            )}
            {penugasan.nomorBA && <div><span className="text-gray-500">Nomor BA:</span> {penugasan.nomorBA}</div>}
          </div>
          {penugasan.catatan && (
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <p className="text-xs"><strong>Catatan penugasan:</strong> {penugasan.catatan}</p>
            </div>
          )}
        </div>

        {/* Bagian bawah: 3 panel satu kesatuan, kiri & kanan bisa di-minimize; scroll di dalam tiap panel */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Kiri: Daftar SOP (bisa minimize) */}
        <div
          className={`flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 overflow-hidden ${
            leftPanelCollapsed ? 'w-12' : 'w-[min(240px,20%)] min-w-[180px]'
          }`}
        >
          {leftPanelCollapsed ? (
            <button
              type="button"
              onClick={() => setLeftPanelCollapsed(false)}
              className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              title="Tampilkan daftar SOP"
            >
              <List className="w-5 h-5" />
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-gray-700 truncate">Daftar SOP</h3>
                  <span className="text-[10px] text-gray-500">{sopList.length} dokumen</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => setLeftPanelCollapsed(true)}
                  title="Sembunyikan panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
                {sopList.map((sop) => (
                  <button
                    key={sop.id}
                    type="button"
                    onClick={() => setSelectedSopId(sop.id)}
                    className={`w-full text-left p-2 rounded-md border text-xs transition-colors ${
                      (effectiveSopId === sop.id)
                        ? 'border-blue-300 bg-blue-50 text-blue-900'
                        : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="block font-medium truncate" title={sop.nama}>{sop.nama}</span>
                    <span className="block text-[10px] text-gray-500 font-mono">{sop.nomor}</span>
                    {sop.status && (
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] ${getHasilStatusColor(sop.status)}`}>
                        {sop.status}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tengah: Preview SOP (template sama dengan Kepala OPD / Tim Penyusun) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700">Preview SOP</h3>
            {displaySop?.status && (
              <Badge className={`text-xs ${getHasilStatusColor(displaySop.status)}`}>{displaySop.status}</Badge>
            )}
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            {displaySop ? (
              <SOPPreviewTemplate name={displaySop.nama} number={displaySop.nomor} />
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-gray-400">
                Pilih SOP di daftar kiri
              </div>
            )}
          </div>
        </div>

        {/* Kanan: Catatan & Rekomendasi (bisa minimize) */}
        <div
          className={`flex flex-col flex-shrink-0 bg-white transition-[width] duration-200 overflow-hidden ${
            rightPanelCollapsed ? 'w-12' : 'w-[min(320px,33%)] min-w-[220px]'
          }`}
        >
          {rightPanelCollapsed ? (
            <button
              type="button"
              onClick={() => setRightPanelCollapsed(false)}
              className="flex flex-col items-center justify-center flex-1 py-4 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              title="Tampilkan catatan & rekomendasi"
            >
              <MessageSquare className="w-5 h-5" />
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <h3 className="text-xs font-semibold text-gray-700 truncate">Catatan & Rekomendasi</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => setRightPanelCollapsed(true)}
                  title="Sembunyikan panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 min-h-0" />
            </>
          )}
        </div>
        </div>
      </div>

      {/* Dialog Berita Acara */}
      <Dialog open={isBAOpen} onOpenChange={setIsBAOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Berita Acara Verifikasi Evaluasi SOP</DialogTitle>
          </DialogHeader>
          {penugasan.nomorBA && penugasan.isVerified && (
            <div className="space-y-4 text-xs">
              <div className="text-center border-b pb-4">
                <h2 className="text-sm font-semibold mb-1">BERITA ACARA</h2>
                <h3 className="text-sm font-semibold mb-2">VERIFIKASI MONITORING DAN EVALUASI SOP</h3>
                <p>Nomor: {penugasan.nomorBA}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md space-y-1">
                <p><strong>Batch:</strong> {penugasan.opd}</p>
                <p><strong>Evaluator:</strong> {penugasan.timMonev}</p>
                <p><strong>Tanggal Verifikasi:</strong> {penugasan.tanggalVerifikasi && new Date(penugasan.tanggalVerifikasi).toLocaleDateString('id-ID')}</p>
                <p><strong>Jumlah SOP:</strong> {sopList.length}</p>
              </div>
              <p className="leading-relaxed">
                Berdasarkan hasil monitoring dan evaluasi, batch ini telah diverifikasi dengan {sopList.length} SOP.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-6">
                <div className="text-center"><p className="mb-12">Evaluator</p><p className="font-semibold">{penugasan.timMonev}</p></div>
                <div className="text-center">
                  {penugasan.tteSignaturePayload ? (
                    <TTESignatureBlock
                      payload={penugasan.tteSignaturePayload}
                      roleLabel="Kepala Biro Organisasi"
                      qrSize={80}
                    />
                  ) : (
                    <>
                      <p className="mb-12">Kepala Biro Organisasi</p>
                      <p className="font-semibold">{penugasan.kepalaBiro}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsBAOpen(false)}>Tutup</Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => window.print()}><Download className="w-3.5 h-3.5" /> Unduh PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinVerificationDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        title="Verifikasi PIN TTE"
        description="Masukkan PIN TTE BSRE untuk memverifikasi batch evaluasi ini."
        onConfirm={handlePinConfirm}
        confirmLabel="Verifikasi"
      />
    </div>
  )
}
