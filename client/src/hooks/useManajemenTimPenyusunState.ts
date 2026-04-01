import { useState, useCallback, useMemo } from 'react'
import type { TimPenyusun } from './useTimPenyusunList'

/**
 * Hook to manage Tim Penyusun state (dialog, form, delete confirm)
 * @deprecated Use API instead
 */
export function useManajemenTimPenyusunState() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TimPenyusun | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleOpenDialog = useCallback((item?: TimPenyusun) => {
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
      handleOpenDialog,
      handleCloseDialog,
      handleDelete,
      handleCloseDeleteConfirm,
    }),
    [
      dialogOpen,
      editingItem,
      deleteConfirm,
      searchQuery,
      handleOpenDialog,
      handleCloseDialog,
      handleDelete,
      handleCloseDeleteConfirm,
    ]
  )
}
