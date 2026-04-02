/**
 * usePagination hook
 * Simple pagination for tables
 */

import { useState, useEffect } from 'react'

const DEFAULT_PAGE_SIZE = 10

export function usePagination(totalItems: number, pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const showPagination = totalItems > pageSize

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(1)
    }
  }, [totalPages, page])

  return {
    page: safePage,
    setPage,
    pageSize,
    startIndex,
    endIndex,
    totalPages,
    showPagination,
  }
}
