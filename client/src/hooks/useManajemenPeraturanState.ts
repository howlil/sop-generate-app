import { useState } from 'react'
import type { Peraturan } from '@/lib/types/peraturan'

export type PeraturanFormState = {
  peraturan: string
  nomor: string
  tahun: string
  tentang: string
}

export type DeleteConfirmState = { type: 'peraturan'; id: string } | null

/**
 * State untuk Manajemen Peraturan: dialog open + form values + riwayat + delete confirm.
 * Data list (peraturanList, riwayatVersiPeraturan) tetap di page/hook usePeraturan.
 */
export function useManajemenPeraturanState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isPeraturanDialogOpen, setIsPeraturanDialogOpen] = useState(false)
  const [editingPeraturan, setEditingPeraturan] = useState<Peraturan | null>(null)
  const [peraturanFormData, setPeraturanFormData] = useState<PeraturanFormState>({
    peraturan: '',
    nomor: '',
    tahun: '',
    tentang: '',
  })
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null)

  return {
    searchQuery,
    setSearchQuery,
    isPeraturanDialogOpen,
    setIsPeraturanDialogOpen,
    editingPeraturan,
    setEditingPeraturan,
    peraturanFormData,
    setPeraturanFormData,
    riwayatVersiOpen,
    setRiwayatVersiOpen,
    selectedPeraturanForRiwayat,
    setSelectedPeraturanForRiwayat,
    deleteConfirm,
    setDeleteConfirm,
  }
}
