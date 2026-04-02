/**
 * useManajemenTimPenyusunState Hook
 * UI state management for Manajemen Tim Penyusun page
 */

import { useState } from 'react'

export interface TimPenyusunFormState {
  namaLengkap: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  nohp: string
}

export function useManajemenTimPenyusunState() {
  const [timList, setTimList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  return {
    timList,
    setTimList,
    loading,
    setLoading,
  }
}
