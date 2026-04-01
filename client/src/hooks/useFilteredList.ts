/**
 * useFilteredList hook
 * Filter list by search query and optional filter
 */

import { useMemo, useState } from 'react'

export function useFilteredList<T extends Record<string, unknown>>(
  list: T[],
  options: {
    searchKeys: (keyof T)[]
    controlledSearch?: [string, (value: string) => void]
    filterKey?: keyof T
    filterValue?: string
  }
) {
  const { searchKeys, controlledSearch, filterKey, filterValue } = options
  const [internalSearch, setInternalSearch] = useState('')
  const [searchQuery, setSearchQuery] = controlledSearch ?? [internalSearch, setInternalSearch]

  const filteredList = useMemo(() => {
    let result = list

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((item) => {
        const searchable = searchKeys
          .map((k) => String(item[k] ?? ''))
          .join(' ')
          .toLowerCase()
        return searchable.includes(q)
      })
    }

    if (filterKey != null && filterValue && filterValue !== 'all') {
      result = result.filter((item) => item[filterKey] === filterValue)
    }

    return result
  }, [list, searchKeys, searchQuery, filterKey, filterValue])

  return {
    filteredList,
    searchQuery,
    setSearchQuery,
    filterValue: filterValue || 'all',
    setFilterValue: () => {}, // Placeholder, not used when controlled
  }
}
