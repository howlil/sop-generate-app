import { useState } from 'react'
import { AlertTriangle, Check, CloudOff, CloudUpload, GitBranchPlus, Printer, RefreshCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SopStatusBadge } from '@/components/status/sop-status-badge'
import { cn } from '@/utils/cn'
import type { SOPDetailMetadata } from "@/types/ui/sop";
import type { StatusSOP } from "@/types/dto/sop.dto";
import type { SopHeaderAutosaveStatus } from '@/hooks/useSopHeaderAutosave'

export interface DetailSOPPenyusunHeaderProps {
  metadata: SOPDetailMetadata
  currentSopStatus: StatusSOP
  currentSopStatusLabel: string
  isRevisionFlow: boolean
  primaryActionLabel: string
  /**
   * Status autosave gabungan (header + prosedur) — ditampilkan sebagai indikator
   * kecil di kanan tombol aksi.
   */
  autosaveStatus?: SopHeaderAutosaveStatus
  /** Handler untuk mencoba ulang autosave saat status `error`. */
  onRetryAutosave?: () => void | Promise<void>
  onComplete: () => void
  onPrint: () => void
  /** Menonaktifkan tombol aksi utama (mis. saat POST kirim ulang evaluasi). */
  isPrimaryActionPending?: boolean
  /** Mode lihat: sembunyikan autosave, Selesai, dan retry. */
  isReadOnly?: boolean
  /** Pesan blokir kirim ulang (tindak lanjut belum SELESAI). */
  kirimUlangBlockingReason?: string | null
  /** Tampilkan tombol buat versi baru dari BERLAKU. */
  canBuatVersiBaru?: boolean
  buatVersiBaruBlockingReason?: string | null
  onBuatVersiBaru?: () => void
  isBuatVersiBaruPending?: boolean
}

interface AutosaveBadgeAppearance {
  Icon: typeof Save
  label: string
  className: string
}

function autosaveAppearance(status: SopHeaderAutosaveStatus): AutosaveBadgeAppearance | null {
  switch (status) {
    case 'pending':
      return {
        Icon: CloudUpload,
        label: 'Perubahan menunggu disimpan',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    case 'saving':
      return {
        Icon: CloudUpload,
        label: 'Menyimpan...',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    case 'saved':
      return {
        Icon: Check,
        label: 'Tersimpan',
        className: 'bg-green-50 text-green-700 border-green-200',
      }
    case 'error':
      return {
        Icon: CloudOff,
        label: 'Gagal menyimpan',
        className: 'bg-red-50 text-red-700 border-red-200',
      }
    case 'idle':
    default:
      return null
  }
}

export function DetailSOPPenyusunHeader({
  metadata,
  currentSopStatus,
  currentSopStatusLabel,
  isRevisionFlow,
  primaryActionLabel,
  autosaveStatus = 'idle',
  onRetryAutosave,
  onComplete,
  onPrint,
  isPrimaryActionPending = false,
  isReadOnly = false,
  kirimUlangBlockingReason = null,
  canBuatVersiBaru = false,
  buatVersiBaruBlockingReason = null,
  onBuatVersiBaru,
  isBuatVersiBaruPending = false,
}: DetailSOPPenyusunHeaderProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const indicator = isReadOnly ? null : autosaveAppearance(autosaveStatus)
  const confirmTitle = isRevisionFlow
    ? 'Kirim ulang ke evaluator?'
    : 'Yakin SOP sudah siap?'
  const confirmDescription = isRevisionFlow
    ? kirimUlangBlockingReason ??
      'SOP akan langsung diajukan kembali ke evaluator. Pastikan umpan balik evaluasi sudah ditandai selesai dan semua perbaikan tersimpan.'
    : 'Status SOP akan diubah menjadi Siap dievaluasi. PJ Penyusun dapat membuka pengajuan evaluasi ke Biro Organisasi. Pastikan dokumen sudah lengkap sebelum melanjutkan.'
  const confirmLabel = isRevisionFlow ? 'Ya, kirim ulang' : 'Ya, selesai'
  const handleConfirmComplete = () => {
    setIsConfirmOpen(false)
    onComplete()
  }
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-gray-900">Dokumen SOP</h2>
        <div className="flex items-center gap-2">
          {indicator !== null ? (
            <span
              role="status"
              aria-live="polite"
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium',
                indicator.className,
              )}
              title={
                autosaveStatus === 'error'
                  ? 'Autosave header SOP gagal — klik tombol di sebelahnya untuk coba lagi.'
                  : 'Status autosave header SOP'
              }
            >
              <indicator.Icon className="h-3 w-3" aria-hidden />
              {indicator.label}
            </span>
          ) : null}
          {autosaveStatus === 'error' && !isReadOnly && onRetryAutosave !== undefined ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-[11px] text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => void onRetryAutosave()}
              title="Kirim ulang perubahan header"
            >
              <RefreshCcw className="h-3 w-3" />
              Coba lagi
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
            onClick={onPrint}
          >
            <Printer className="w-3.5 h-3.5" /> Print SOP
          </Button>
          {canBuatVersiBaru && onBuatVersiBaru ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs gap-1.5 rounded-md border-emerald-200 text-emerald-800 hover:bg-emerald-50"
              onClick={onBuatVersiBaru}
              disabled={isBuatVersiBaruPending || Boolean(buatVersiBaruBlockingReason)}
              title={buatVersiBaruBlockingReason ?? undefined}
            >
              <GitBranchPlus className="w-3.5 h-3.5" />
              {isBuatVersiBaruPending ? 'Membuat…' : 'Buat versi baru'}
            </Button>
          ) : null}
          {!isReadOnly ? (
          <Button
            size="sm"
            className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5 disabled:opacity-60"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isPrimaryActionPending || Boolean(kirimUlangBlockingReason)}
            title={kirimUlangBlockingReason ?? undefined}
          >
            <Check className="w-3.5 h-3.5" />
            {isPrimaryActionPending ? 'Mengirim…' : primaryActionLabel}
          </Button>
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        cancelLabel="Batal"
        onConfirm={handleConfirmComplete}
      />
      <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <Badge className="h-4 px-1.5 text-xs bg-blue-100 text-blue-700 border-0">
          v{metadata.version || '1.0'}
        </Badge>
        {metadata.revisiDariVersi != null ? (
          <span className="text-gray-500">Revisi dari v{metadata.revisiDariVersi}</span>
        ) : null}
        <SopStatusBadge
          status={currentSopStatus}
          label={currentSopStatusLabel}
          showDomain={false}
          className="text-xs"
        />
      </div>
      {isRevisionFlow && !isReadOnly && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mr-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
          {kirimUlangBlockingReason ? (
            kirimUlangBlockingReason
          ) : (
            <>
              SOP ini dikembalikan oleh evaluator untuk revisi. Tandai umpan balik selesai di tab
              {' '}
              <span className="font-semibold">Umpan balik</span>
              , lalu klik{' '}
              <span className="font-semibold">Kirim ulang ke evaluator</span>.
            </>
          )}
        </div>
      )}
    </>
  )
}
