/**
 * Filter list by search query
 * Usage: const filtered = useFilteredList(items, { searchKeys: ['judul', 'nomorSOP'], searchQuery })
 */

import { useMemo } from 'react'

export function useFilteredList<T extends Record<string, unknown>>(
  list: T[],
  options: {
    searchKeys: (keyof T)[]
    searchQuery: string
  }
) {
  const { searchKeys, searchQuery } = options

  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list

    return list.filter((item) => {
      const searchable = searchKeys
        .map((k) => String(item[k] ?? ''))
        .join(' ')
        .toLowerCase()
      return searchable.includes(q)
    })
  }, [list, searchKeys, searchQuery])
}
