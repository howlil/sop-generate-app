/**
 * useManajemenPeraturanState Hook
 * UI state management for ManajemenPeraturan page
 */

import { useState } from 'react'
import type { Peraturan } from '@/types/peraturan'

export interface PeraturanFormData {
  peraturan: string
  nomor: string
  tentang: string
  opdId?: string
}

export function useManajemenPeraturanState() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isPeraturanDialogOpen, setIsPeraturanDialogOpen] = useState(false)
  const [editingPeraturan, setEditingPeraturan] = useState<Peraturan | null>(null)
  const [peraturanFormData, setPeraturanFormData] = useState<PeraturanFormData>({
    peraturan: '',
    nomor: '',
    tentang: '',
  })
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

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
