import { useMemo, useState } from 'react'

export interface UseFilteredListOptions<T> {
  /** Keys (path) untuk pencarian teks, e.g. ['judul', 'nomorSOP'] atau getter (item) => string */
  searchKeys: (keyof T | ((item: T) => string))[]
  /** Key untuk filter nilai (e.g. status). Jika tidak dipakai, filterValue diabaikan. */
  filterKey?: keyof T
  /** Nilai filter (e.g. 'all' atau nilai enum). 'all' = tampilkan semua. */
  filterValue?: string
  /** Predikat tambahan (e.g. hanya item yang eligible). Opsional. */
  predicate?: (item: T) => boolean
}

/**
 * Hook untuk list + search + filter (opsional).
 * Mengembalikan filteredList dan state searchQuery + setSearchQuery, filterValue + setFilterValue.
 * Dipakai di SOPSaya, DaftarSOPEvaluasi, PenugasanEvaluasi, ManajemenTimEvaluasi, dll.
 */
export function useFilteredList<T>(
  list: T[],
  options: UseFilteredListOptions<T>
): {
  filteredList: T[]
  searchQuery: string
  setSearchQuery: (value: string) => void
  filterValue: string
  setFilterValue: (value: string) => void
} {
  const { searchKeys, filterKey, predicate } = options
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValue, setFilterValue] = useState<string>(options.filterValue ?? 'all')

  const filteredList = useMemo(() => {
    let result = list
    if (predicate) result = result.filter(predicate)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((item) => {
        const searchable = searchKeys
          .map((k) => (typeof k === 'function' ? k(item) : String((item as Record<string, unknown>)[k as string] ?? '')))
          .join(' ')
          .toLowerCase()
        return searchable.includes(q)
      })
    }
    if (filterKey != null && filterValue !== 'all') {
      result = result.filter((item) => (item as Record<string, unknown>)[filterKey as string] === filterValue)
    }
    return result
  }, [list, predicate, searchKeys, searchQuery, filterKey, filterValue])

  return {
    filteredList,
    searchQuery,
    setSearchQuery,
    filterValue,
    setFilterValue,
  }
}
