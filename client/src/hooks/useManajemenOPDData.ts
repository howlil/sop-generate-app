/**
 * Hook derivasi data Manajemen OPD: getter Kepala per OPD, daftar unik person + penugasan aktif, filter OPD/person.
 * Memindahkan logic derivasi dari ManajemenOPD agar page tetap ringan dan logic bisa dipakai ulang.
 */
import { useCallback, useMemo } from 'react'
import type { OPD, KepalaOPD } from '@/lib/types/opd'
import { useFilteredList } from '@/hooks/useFilteredList'

export interface PersonWithActive {
  name: string
  email: string
  phone: string
  nip: string
  activeAssignment?: KepalaOPD & { opdName: string }
}

export interface UseManajemenOPDDataParams {
  opdList: OPD[]
  kepalaList: KepalaOPD[]
  searchQuery: string
  setSearchQuery: (v: string) => void
  searchUserQuery: string
  setSearchUserQuery: (v: string) => void
}

export function useManajemenOPDData({
  opdList,
  kepalaList,
  searchQuery,
  setSearchQuery,
  searchUserQuery,
  setSearchUserQuery,
}: UseManajemenOPDDataParams) {
  const getKepalaAktif = useCallback(
    (opdId: string) => kepalaList.find((k) => k.opdId === opdId && k.isActive),
    [kepalaList]
  )

  const getKepalaByOPD = useCallback(
    (opdId: string) => kepalaList.filter((k) => k.opdId === opdId),
    [kepalaList]
  )

  const { filteredList: filteredOPD } = useFilteredList(opdList, {
    searchKeys: [(opd) => `${opd.name} ${getKepalaAktif(opd.id)?.name ?? ''}`],
    controlledSearch: [searchQuery, setSearchQuery],
  })

  const uniqueUsers = useMemo(
    () =>
      Array.from(
        new Map(
          kepalaList.map((k) => [
            k.name.trim() + '|' + (k.email ?? ''),
            { name: k.name, email: k.email ?? '' },
          ])
        ).values()
      ),
    [kepalaList]
  )

  const personsWithActive = useMemo(
    () =>
      uniqueUsers.map((u) => {
        const first = kepalaList.find(
          (k) => k.name === u.name && (k.email ?? '') === u.email
        )
        const active = kepalaList.find(
          (k) =>
            k.name === u.name && (k.email ?? '') === u.email && k.isActive
        )
        return {
          name: u.name,
          email: u.email,
          phone: first?.phone ?? '',
          nip: first?.nip ?? '',
          activeAssignment: active
            ? {
                ...active,
                opdName:
                  opdList.find((o) => o.id === active.opdId)?.name ??
                  active.opdId,
              }
            : undefined,
        }
      }),
    [uniqueUsers, kepalaList, opdList]
  )

  const { filteredList: filteredPersons } = useFilteredList(personsWithActive, {
    searchKeys: [
      'name',
      'email',
      (p) => p.nip ?? '',
      (p) => p.activeAssignment?.opdName ?? '',
    ],
    controlledSearch: [searchUserQuery, setSearchUserQuery],
  })

  const getRiwayatForUser = useCallback(
    (name: string, email: string) =>
      kepalaList
        .filter((k) => k.name === name && (k.email ?? '') === email)
        .map((k) => ({
          ...k,
          opdName: opdList.find((o) => o.id === k.opdId)?.name ?? k.opdId,
        }))
        .sort((a, b) =>
          (b.endedAt ?? '') < (a.endedAt ?? '') ? 1 : -1
        ),
    [kepalaList, opdList]
  )

  return {
    getKepalaAktif,
    getKepalaByOPD,
    filteredOPD,
    filteredPersons,
    getRiwayatForUser,
  }
}
