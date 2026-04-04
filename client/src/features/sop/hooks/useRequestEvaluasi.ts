import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '../services/sop.api'
import { queryKeys } from '@/utils/query-keys'

/**
 * Hook for requesting SOP evaluation (bulk operation)
 * Extracts business logic from pages to feature layer
 */
export function useRequestEvaluasi() {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const mutation = useMutation({
    mutationFn: async (sopIds: string[]) => {
      // Update status for each SOP to 'DIAJUKAN_EVALUASI'
      const updates = await Promise.all(
        sopIds.map((sopId) =>
          sopApi.updateStatus(sopId, { status: 'DIAJUKAN_EVALUASI' })
        )
      )
      return updates
    },
    onSuccess: () => {
      // Invalidate SOP queries to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.sop })
    },
  })

  const toggleSelection = (sopId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sopId)) {
        next.delete(sopId)
      } else {
        next.add(sopId)
      }
      return next
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const openDialog = () => {
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setSearchQuery('')
  }

  const submitRequest = async () => {
    if (selectedIds.size === 0) {
      throw new Error('Pilih minimal satu SOP untuk diajukan.')
    }
    
    const ids = Array.from(selectedIds)
    await mutation.mutateAsync(ids)
    closeDialog()
    clearSelection()
    
    return { count: ids.length }
  }

  return {
    // State
    selectedIds,
    selectedCount: selectedIds.size,
    isOpen,
    searchQuery,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,

    // Actions
    toggleSelection,
    clearSelection,
    openDialog,
    closeDialog,
    setSearchQuery,
    submitRequest,
  }
}
