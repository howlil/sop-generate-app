/**
 * Stub hook for pelaksana
 * @deprecated Use API directly instead
 */

export function usePelaksana(opdId?: string) {
  console.warn('usePelaksana is deprecated - use API directly instead')
  return {
    list: [],
    loading: false,
    error: null,
    loadPelaksana: async () => {},
    addPelaksana: async () => {},
    updatePelaksana: async () => {},
    deletePelaksana: async () => {},
  }
}
