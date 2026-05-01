import { Save, Check, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import type { SOPDetailMetadata } from "@/types/ui/sop";
import type { StatusSOP } from "@/types/dto/sop.dto";

export interface DetailSOPPenyusunHeaderProps {
  metadata: SOPDetailMetadata
  currentSopStatus: StatusSOP
  isRevisionFlow: boolean
  primaryActionLabel: string
  onSaveDraft: () => void
  onComplete: () => void
  onPrint: () => void
}

export function DetailSOPPenyusunHeader({
  metadata,
  currentSopStatus,
  isRevisionFlow,
  primaryActionLabel,
  onSaveDraft,
  onComplete,
  onPrint,
}: DetailSOPPenyusunHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-gray-900">Dokumen SOP</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
            onClick={onPrint}
          >
            <Printer className="w-3.5 h-3.5" /> Print SOP
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs gap-1.5 rounded-md border-gray-200 hover:bg-gray-50"
            onClick={onSaveDraft}
          >
            <Save className="w-3.5 h-3.5" />
            Simpan sebagai draft
          </Button>
          <Button
            size="sm"
            className="h-8 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs gap-1.5"
            onClick={onComplete}
          >
            <Check className="w-3.5 h-3.5" />
            {primaryActionLabel}
          </Button>
        </div>
      </div>
      <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        <Badge className="h-4 px-1.5 text-xs bg-blue-100 text-blue-700 border-0">
          v{metadata.version || '1.0'}
        </Badge>
        <StatusBadge status={currentSopStatus} className="text-xs border-0" />
      </div>
      {isRevisionFlow && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          SOP ini dikembalikan oleh Tim Evaluasi untuk revisi. Setelah perbaikan selesai, klik
          {' '}
          <span className="font-semibold">Selesaikan revisi</span>
          {' '}
          lalu ajukan ulang dari
          {' '}
          <span className="font-semibold">Manajemen SOP</span>.
        </div>
      )}
    </>
  )
}
