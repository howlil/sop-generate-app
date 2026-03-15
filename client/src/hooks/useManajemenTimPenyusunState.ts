import { useState } from 'react'
import type { TimPenyusun } from '@/lib/types/tim'

export type TimPenyusunFormState = {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
  roleInternal: 'Koordinator' | 'Anggota'
}

const initialForm: TimPenyusunFormState = {
  namaLengkap: '',
  nip: '',
  jabatan: '',
  pangkat: '',
  email: '',
  nohp: '',
  roleInternal: 'Anggota',
}

/**
 * State untuk halaman Manajemen Tim Penyusun: dialog open, form, selected tim, delete confirm, expand OPD.
 */
export function useManajemenTimPenyusunState() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTim, setSelectedTim] = useState<TimPenyusun | null>(null)
  const [deleteTimId, setDeleteTimId] = useState<string | null>(null)
  const [nonaktifTimId, setNonaktifTimId] = useState<string | null>(null)
  const [pindahTim, setPindahTim] = useState<TimPenyusun | null>(null)
  const [opdTujuanId, setOpdTujuanId] = useState<string>('')
  const [formData, setFormData] = useState<TimPenyusunFormState>(initialForm)
  const [createOpdId, setCreateOpdId] = useState<string>('')
  const [expandedOpdIds, setExpandedOpdIds] = useState<Record<string, boolean>>({})

  const resetForm = () => setFormData(initialForm)

  const openEditDialog = (tim: TimPenyusun) => {
    setFormData({
      namaLengkap: tim.namaLengkap,
      nip: tim.nip,
      jabatan: tim.jabatan,
      pangkat: tim.pangkat,
      email: tim.email,
      nohp: tim.nohp,
      roleInternal: tim.roleInternal ?? 'Anggota',
    })
    setSelectedTim(tim)
    setIsEditOpen(true)
  }

  return {
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    selectedTim,
    setSelectedTim,
    deleteTimId,
    setDeleteTimId,
    nonaktifTimId,
    setNonaktifTimId,
    pindahTim,
    setPindahTim,
    opdTujuanId,
    setOpdTujuanId,
    formData,
    setFormData,
    createOpdId,
    setCreateOpdId,
    expandedOpdIds,
    setExpandedOpdIds,
    resetForm,
    openEditDialog,
  }
}
