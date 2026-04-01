import { useState, useCallback, useMemo } from 'react'

export interface Komentar {
  id: string
  sopId: string
  userId: string
  userName: string
  text: string
  createdAt: string
  resolved: boolean
}

export interface UseKomentarOptions {
  sopId?: string
}

/**
 * Hook to manage komentar/comments on SOP
 * @deprecated Use API instead
 */
export function useKomentar({ sopId }: UseKomentarOptions) {
  const [displayList, setDisplayList] = useState<Komentar[]>([])
  const [newComment, setNewComment] = useState('')

  const addComment = useCallback((text: string) => {
    console.log('Adding comment:', text)
    // Legacy stub - in production, this should call API
  }, [])

  const handleResolveComment = useCallback((commentId: string) => {
    console.log('Resolving comment:', commentId)
    // Legacy stub - in production, this should call API
  }, [])

  const deleteComment = useCallback((commentId: string) => {
    console.log('Deleting comment:', commentId)
    // Legacy stub - in production, this should call API
  }, [])

  return useMemo(
    () => ({
      displayList,
      newComment,
      setNewComment,
      addComment,
      handleResolveComment,
      deleteComment,
    }),
    [displayList, newComment, addComment, handleResolveComment, deleteComment]
  )
}
