/**
 * Shared hook for managing komentar (comments) list state.
 */
import { useState, useCallback } from 'react'
import { showToast } from '@/lib/stores/app-store'
import { formatDatetime } from '@/utils/format-date'
import { generateId } from '@/utils/generate-id'
import type { KomentarItem } from '@/lib/types/komentar'

interface UseKomentarOptions {
  initialData: KomentarItem[]
  currentUser?: { user: string; role: string }
  /** Roles to exclude when displaying comments (e.g. 'Tim Penyusun'). */
  excludeRoles?: string[]
}

export function useKomentar({ initialData, currentUser, excludeRoles = [] }: UseKomentarOptions) {
  const [komentarList, setKomentarList] = useState<KomentarItem[]>(initialData)
  const [newComment, setNewComment] = useState('')

  const displayList = excludeRoles.length > 0
    ? komentarList.filter((k) => !excludeRoles.includes(k.role))
    : komentarList

  const openCount = displayList.filter((k) => k.status === 'open').length
  const resolvedCount = displayList.filter((k) => k.status === 'resolved').length

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) {
      showToast('Komentar harus diisi', 'error')
      return
    }
    if (!currentUser) return

    setKomentarList((prev) => [
      {
        id: generateId(),
        user: currentUser.user,
        role: currentUser.role,
        timestamp: formatDatetime(new Date()),
        bagian: '',
        isi: newComment.trim(),
        status: 'open',
      },
      ...prev,
    ])
    setNewComment('')
    showToast('Komentar berhasil ditambahkan')
  }, [newComment, currentUser])

  const handleResolveComment = useCallback((commentId: string) => {
    setKomentarList((prev) =>
      prev.map((k) => (k.id === commentId ? { ...k, status: 'resolved' as const } : k))
    )
    showToast('Komentar ditandai sebagai resolved')
  }, [])

  return {
    komentarList,
    setKomentarList,
    displayList,
    openCount,
    resolvedCount,
    newComment,
    setNewComment,
    handleAddComment,
    handleResolveComment,
  }
}
