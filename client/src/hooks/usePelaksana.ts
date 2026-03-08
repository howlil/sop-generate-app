/**
 * Hook akses pelaksana SOP — dipakai di Kelola Pelaksana SOP (CRUD) dan di edit SOP.
 */
import { useEffect } from 'react'
import { usePelaksanaStore } from '@/lib/stores/pelaksana-store'
import { getInitialPelaksanaList } from '@/lib/data/pelaksana'

export function usePelaksana() {
  const list = usePelaksanaStore((s) => s.list)
  const setList = usePelaksanaStore((s) => s.setList)
  const add = usePelaksanaStore((s) => s.add)
  const update = usePelaksanaStore((s) => s.update)
  const remove = usePelaksanaStore((s) => s.remove)
  const getById = usePelaksanaStore((s) => s.getById)

  useEffect(() => {
    if (list.length === 0) setList(getInitialPelaksanaList())
  }, [list.length, setList])

  return {
    list,
    addPelaksana: add,
    updatePelaksana: update,
    removePelaksana: remove,
    getPelaksanaById: getById,
  }
}
