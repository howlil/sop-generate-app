/**
 * useDetailSopPenyusun hook
 * Extracted from DetailSOPPenyusun component for better separation of concerns
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useToast } from '@/utils/ui'
import { usePeraturan } from '@/features/organisasi'
import { usePelaksana, useSopStatus, type SOPDetailMetadata, type ProsedurRow, type StatusSop, DEFAULT_SOP_STATUS } from '@/features/sop'
import {
  getInitialSopDetailMetadata,
  getInitialSopDetailProsedurRows,
  getInitialSopDetailVersions,
  type VersionHistoryItem,
} from '@/features/sop'
import * as versionDiff from '@/utils/version-diff'
import type { Peraturan } from '@/features/organisasi'

export interface UseDetailSopPenyusunReturn {
  // State
  metadata: SOPDetailMetadata
  setMetadata: React.Dispatch<React.SetStateAction<SOPDetailMetadata>>
  prosedurRows: ProsedurRow[]
  setProsedurRows: React.Dispatch<React.SetStateAction<ProsedurRow[]>>
  implementers: { id: string; name: string }[]
  setImplementers: React.Dispatch<React.SetStateAction<{ id: string; name: string }[]>>
  versions: VersionHistoryItem[]
  
  // UI State
  diagramVersion: number
  setDiagramVersion: React.Dispatch<React.SetStateAction<number>>
  activeTab: 'flowchart' | 'bpmn'
  setActiveTab: React.Dispatch<React.SetStateAction<'flowchart' | 'bpmn'>>
  isEditingSteps: boolean
  setIsEditingSteps: React.Dispatch<React.SetStateAction<boolean>>
  isHistoryOpen: boolean
  setIsHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>
  isEditPanelCollapsed: boolean
  setIsEditPanelCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  rightPanelTab: 'edit' | 'komentar' | 'riwayat' | 'aktivitas'
  setRightPanelTab: React.Dispatch<React.SetStateAction<'edit' | 'komentar' | 'riwayat' | 'aktivitas'>>
  viewingVersion: VersionHistoryItem | null
  setViewingVersion: React.Dispatch<React.SetStateAction<VersionHistoryItem | null>>
  komentarDisplay: any[]
  
  // Computed
  masterPelaksanaOptions: { id: string; name: string }[]
  peraturanList: Peraturan[]
  versionDiffItems: any[]
  currentSopStatus: StatusSOP
  isRevisionFlow: boolean
  primaryActionLabel: string
  
  // Handlers
  handleMetadataChange: <K extends keyof SOPDetailMetadata>(field: K, value: SOPDetailMetadata[K]) => void
  handleSaveDraft: (id: string | undefined, role: string | null) => void
  handleComplete: (id: string | undefined, role: string | null, navigate: (opts: any) => void) => void
  handleResolveComment: (komentarId: string) => void
}

export function useDetailSopPenyusun(
  id: string | undefined,
  sopStatusOverride: StatusSop | undefined,
  isRevisionFlowOverride?: boolean,
  navigate?: (opts: any) => void,
  role?: string | null
): UseDetailSopPenyusunReturn {
  const { showToast } = useToast()
  const { getSopStatusOverride, setSopStatusOverride } = useSopStatus()
  const { list: peraturanList } = usePeraturan()
  const { list: pelaksanaList } = usePelaksana()

  // State
  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() => getInitialSopDetailMetadata())
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(() => getInitialSopDetailProsedurRows())
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([])
  const implementersSeededRef = useRef(false)
  const [versions, setVersions] = useState<VersionHistoryItem[]>(() => getInitialSopDetailVersions() as VersionHistoryItem[])
  
  // UI State
  const [diagramVersion, setDiagramVersion] = useState(0)
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [isEditingSteps, setIsEditingSteps] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isEditPanelCollapsed, setIsEditPanelCollapsed] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'edit' | 'komentar' | 'riwayat' | 'aktivitas'>('edit')
  const [viewingVersion, setViewingVersion] = useState<VersionHistoryItem | null>(null)
  
  // Komentar state (placeholder for future implementation)
  const [komentarDisplay] = useState<any[]>([])

  // Master pelaksana options
  const masterPelaksanaOptions = useMemo(
    () => pelaksanaList.map((p) => ({
      id: p.id,
      name: p.namaLengkap || p.namaPelaksana,
    })),
    [pelaksanaList]
  )

  // Seed implementers from prosedurRows
  useEffect(() => {
    if (implementersSeededRef.current || pelaksanaList.length === 0) return
    const ids = new Set(prosedurRows.flatMap((r) => Object.keys(r.pelaksana)))
    if (ids.size === 0) return
    implementersSeededRef.current = true
    setImplementers(
      Array.from(ids).map((id) => {
        const p = pelaksanaList.find((x) => x.id === id)
        return { id, name: p?.namaLengkap ?? id }
      })
    )
  }, [pelaksanaList, prosedurRows])

  // Current SOP status
  const currentSopStatus: StatusSOP =
    (id ? getSopStatusOverride(id) : undefined) ?? sopStatusOverride ?? DEFAULT_SOP_STATUS
  
  const isRevisionFlow = isRevisionFlowOverride ?? (currentSopStatus === 'Revisi dari Tim Evaluasi')
  const primaryActionLabel = isRevisionFlow ? 'Selesaikan revisi' : 'Selesai'

  // Version diff computation
  const versionDiffItems = useMemo(
    () => versionDiff.computeVersionDiff(metadata, prosedurRows, viewingVersion?.snapshot ?? undefined),
    [viewingVersion, metadata, prosedurRows]
  )

  // Handlers
  const handleMetadataChange = useCallback(<K extends keyof SOPDetailMetadata>(
    field: K,
    value: SOPDetailMetadata[K]
  ) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveDraft = useCallback((id: string | undefined, role: string | null) => {
    if (id && role) {
      setSopStatusOverride(id, 'Sedang Disusun')
      showToast('Status diubah menjadi Sedang Disusun')
    }
  }, [setSopStatusOverride, showToast])

  const handleComplete = useCallback((id: string | undefined, role: string | null, navigateFn?: (opts: any) => void) => {
    if (id && role) {
      setSopStatusOverride(id, 'Siap Dievaluasi')
      showToast(
        isRevisionFlow
          ? 'Revisi selesai. Kembali ke Manajemen SOP untuk kirim ulang ke evaluasi.'
          : 'SOP selesai disusun. Ajukan ke evaluasi dari Manajemen SOP.'
      )
      if (navigateFn) {
        navigateFn({ to: '/tim-penyusun/manajemen-sop' })
      }
    }
  }, [setSopStatusOverride, showToast, isRevisionFlow, navigateFn])

  const handleResolveComment = useCallback((_komentarId: string) => {
    setKomentarDisplay((prev) => prev.map((k) => (k.id === _komentarId ? { ...k, resolved: true } : k)))
  }, [])

  return {
    // State
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    versions,
    
    // UI State
    diagramVersion,
    setDiagramVersion,
    activeTab,
    setActiveTab,
    isEditingSteps,
    setIsEditingSteps,
    isHistoryOpen,
    setIsHistoryOpen,
    isEditPanelCollapsed,
    setIsEditPanelCollapsed,
    rightPanelTab,
    setRightPanelTab,
    viewingVersion,
    setViewingVersion,
    komentarDisplay,
    
    // Computed
    masterPelaksanaOptions,
    peraturanList,
    versionDiffItems,
    currentSopStatus,
    isRevisionFlow,
    primaryActionLabel,
    
    // Handlers
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
    handleResolveComment,
  }
}
