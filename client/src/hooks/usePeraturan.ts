/**
 * Hook akses peraturan — satu titik akses untuk UI.
 * Menggantikan import langsung dari peraturan-store.
 */
import { usePeraturanStore } from '@/lib/stores/peraturan-store'
import type { Peraturan } from '@/lib/types/peraturan'

export function usePeraturan() {
  const list = usePeraturanStore((s) => s.list)
  const setList = usePeraturanStore((s) => s.setList)
  const add = usePeraturanStore((s) => s.add)
  const update = usePeraturanStore((s) => s.update)
  const remove = usePeraturanStore((s) => s.remove)
  const getById = usePeraturanStore((s) => s.getById)
  const setDicabut = usePeraturanStore((s) => s.setDicabut)
  const cabut = usePeraturanStore((s) => s.cabut)

  const initPeraturanList = (seed: Peraturan[]) => {
    if (list.length === 0) setList([...seed])
  }

  const getPeraturanDicabut = () => list.filter((p) => p.status === 'Dicabut')

  return {
    list,
    initPeraturanList,
    addPeraturan: add,
    updatePeraturan: update,
    removePeraturan: remove,
    getPeraturanById: getById,
    setPeraturanDicabut: setDicabut,
    cabutPeraturan: cabut,
    getPeraturanDicabut,
  }
}
