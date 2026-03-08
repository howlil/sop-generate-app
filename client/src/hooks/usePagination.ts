import { useState, useMemo, useEffect } from 'react'

const DEFAULT_PAGE_SIZE = 10

export interface UsePaginationOptions {
  pageSize?: number
}

export interface UsePaginationReturn {
  page: number
  setPage: (page: number | ((prev: number) => number)) => void
  pageSize: number
  startIndex: number
  endIndex: number
  totalPages: number
  /** true jika totalItems > pageSize (pagination tampil) */
  showPagination: boolean
}

/**
 * Hook untuk pagination tabel. Halaman 1-based.
 * showPagination true hanya ketika totalItems > pageSize (default 10).
 */
export function usePagination(
  totalItems: number,
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const showPagination = totalItems > pageSize

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(1)
  }, [totalPages, page])

  return useMemo(
    () => ({
      page: safePage,
      setPage,
      pageSize,
      startIndex,
      endIndex,
      totalPages,
      showPagination,
    }),
    [safePage, pageSize, startIndex, endIndex, totalPages, showPagination]
  )
}
