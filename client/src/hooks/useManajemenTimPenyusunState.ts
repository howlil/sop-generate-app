/**
 * useManajemenTimPenyusunState Hook
 * UI state management for Manajemen Tim Penyusun page
 */

import { useState } from 'react'
import type { TimPenyusun } from '@/types/tim'

export interface TimPenyusunFormState {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
}

export function useManajemenTimPenyusunState() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)
  const [nonaktifTimId, setNonaktifTimId] = useState<string | null>(null)
  const [pindahTim, setPindahTim] = useState<TimPenyusun | null>(null)
  const [opdTujuanId, setOpdTujuanId] = useState<string | null>(null)
  const [createOpdId, setCreateOpdId] = useState<string | undefined>()
  const [expandedOpdIds, setExpandedOpdIds] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<TimPenyusunFormState>({
    namaLengkap: '',
    nip: '',
    jabatan: '',
    pangkat: '',
    email: '',
    nohp: '',
  })

  const resetForm = () => {
    setFormData({
      namaLengkap: '',
      nip: '',
      jabatan: '',
      pangkat: '',
      email: '',
      nohp: '',
    })
  }

  const openEditDialog = (tim: TimPenyusun) => {
    setSelectedTim(tim)
    setFormData({
      namaLengkap: tim.namaLengkap,
      nip: tim.nip,
      jabatan: tim.jabatan,
      pangkat: tim.pangkat,
      email: tim.email,
      nohp: tim.nohp,
    })
    setIsEditOpen(true)
  }

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    selectedTim,
    deleteTimId,
    setDeleteTimId,
    nonaktifTimId,
    setNonaktifTimId,
    pindahTim,
    setPindahTim,
    opdTujuanId,
    setOpdTujuanId,
    createOpdId,
    setCreateOpdId,
    expandedOpdIds,
    setExpandedOpdIds,
    formData,
    setFormData,
    resetForm,
    openEditDialog,
  }
}
