import { useState, useCallback, useMemo } from 'react'
import type { OPD, KepalaOPD } from '@/lib/data/opd'

/**
 * Hook to manage Manajemen OPD state (dialogs, forms, delete confirms)
 * @deprecated Use API instead
 */
export function useManajemenOPDState() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OPD | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [riwayatOpen, setRiwayatOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleOpenDialog = useCallback((item?: OPD) => {
    setEditingItem(item ?? null)
    setDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingItem(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirm(id)
  }, [])

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirm(null)
  }, [])

  const handleOpenRiwayat = useCallback((userId: string) => {
    setSelectedUser(userId)
    setRiwayatOpen(true)
  }, [])

  const handleCloseRiwayat = useCallback(() => {
    setRiwayatOpen(false)
    setSelectedUser(null)
  }, [])

  return useMemo(
    () => ({
      dialogOpen,
      setDialogOpen,
      editingItem,
      setEditingItem,
      deleteConfirm,
      setDeleteConfirm,
      searchQuery,
      setSearchQuery,
      searchUserQuery,
      setSearchUserQuery,
      riwayatOpen,
      setRiwayatOpen,
      selectedUser,
      setSelectedUser,
      handleOpenDialog,
      handleCloseDialog,
      handleDelete,
      handleCloseDeleteConfirm,
      handleOpenRiwayat,
      handleCloseRiwayat,
    }),
    [
      dialogOpen,
      editingItem,
      deleteConfirm,
      searchQuery,
      searchUserQuery,
      riwayatOpen,
      selectedUser,
      handleOpenDialog,
      handleCloseDialog,
      handleDelete,
      handleCloseDeleteConfirm,
      handleOpenRiwayat,
      handleCloseRiwayat,
    ]
  )
}
