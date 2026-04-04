import { useState, useMemo } from 'react'
import { SOPHeaderSection } from './SOPHeaderSection'
import { LawBasisDialog } from './LawBasisDialog'
import { RelatedPosDialog } from './RelatedPosDialog'
import { PelaksanaDialog } from './PelaksanaDialog'
import type { Peraturan } from '@/features/organisasi'
import type { SOPDetailMetadata } from '@/features/sop'
import { useSop } from '@/features/sop'

export interface DetailSOPMetadataPanelProps {
  metadata: SOPDetailMetadata
  onMetadataChange: <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => void
  implementers: { id: string; name: string }[]
  onImplementersChange: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
  /** Jika true, daftar pelaksana dari master (Kelola Pelaksana SOP) — editable: tambah dari dropdown, hapus */
  implementersFromMaster?: boolean
  /** Opsi pelaksana dari master (untuk dropdown Tambah) */
  masterPelaksanaOptions?: { 
    id: string
    name: string
    jabatan?: string
    pangkat?: string
    email?: string
    nohp?: string
  }[]
  peraturanList: Peraturan[]
}

export function DetailSOPMetadataPanel({
  metadata,
  onMetadataChange,
  implementers,
  onImplementersChange,
  implementersFromMaster,
  masterPelaksanaOptions,
  peraturanList,
}: DetailSOPMetadataPanelProps) {
  const [isLawBasisOpen, setIsLawBasisOpen] = useState(false)
  const [isRelatedPosOpen, setIsRelatedPosOpen] = useState(false)
  const [isPelaksanaDialogOpen, setIsPelaksanaDialogOpen] = useState(false)
  
  // Use real API instead of stub
  const { list: sops = [] } = useSop()
  const relatedPosOptions = useMemo(() => {
    if (!sops || sops.length === 0) return []
    return sops.map(sop => sop.judul)
  }, [sops])

  return (
    <>
      <div className="p-3 space-y-4">
        <SOPHeaderSection
          metadata={metadata}
          onMetadataChange={onMetadataChange}
          implementers={implementers}
          onImplementersChange={onImplementersChange}
          implementersFromMaster={implementersFromMaster}
          onOpenLawBasisDialog={() => setIsLawBasisOpen(true)}
          onOpenRelatedPosDialog={() => setIsRelatedPosOpen(true)}
          onOpenPelaksanaDialog={() => setIsPelaksanaDialogOpen(true)}
        />
      </div>

      <LawBasisDialog
        open={isLawBasisOpen}
        onOpenChange={setIsLawBasisOpen}
        peraturanList={peraturanList}
        existingLawBasis={metadata.lawBasis ?? []}
        onAdd={(newLabels) => onMetadataChange('lawBasis', newLabels)}
      />

      <RelatedPosDialog
        open={isRelatedPosOpen}
        onOpenChange={setIsRelatedPosOpen}
        options={relatedPosOptions}
        existingRelatedSop={metadata.relatedSop ?? []}
        onAdd={(newItems) => onMetadataChange('relatedSop', newItems)}
      />

      {implementersFromMaster && masterPelaksanaOptions && (
        <PelaksanaDialog
          open={isPelaksanaDialogOpen}
          onOpenChange={setIsPelaksanaDialogOpen}
          options={masterPelaksanaOptions}
          existingImplementers={implementers}
          onAdd={(fullList) => onImplementersChange(fullList)}
        />
      )}
    </>
  )
}
