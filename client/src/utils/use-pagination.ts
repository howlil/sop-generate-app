/**
 * Simple pagination hook
 * Usage: const { page, setPage, startIndex, endIndex } = usePagination(items.length, 10)
 */

import { useState, useEffect } from 'react'

export function usePagination(totalItems: number, pageSize: number = 10) {
  const [page, setPage] = useState(1)
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize)
  const safePage = Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(1)
  }, [totalPages, page])

  return {
    page: safePage,
    setPage,
    totalPages,
    startIndex: (safePage - 1) * pageSize,
    endIndex: Math.min((safePage - 1) * pageSize + pageSize, totalItems),
  }
}
