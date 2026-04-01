import { useState, useEffect } from 'react'
import type { Opd } from '@/types/opd'

export interface OPD {
  id: string
  nama: string
  alamat: string
  kodePos?: string
  telepon?: string
  email?: string
  website?: string
  logoUrl?: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface KepalaOPD {
  id: string
  opdId: string
  userId: string
  nama: string
  nip: string
  jabatan: string
  pangkat: string
  email: string
  telepon?: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

/** Mock OPD data for development */
const MOCK_OPD_LIST: OPD[] = [
  {
    id: '1',
    nama: 'Dinas Kesehatan',
    alamat: 'Jl. Kesehatan No. 123',
    kodePos: '12345',
    telepon: '021-1234567',
    email: 'dinkes@example.com',
    website: 'dinkes.example.com',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    nama: 'Dinas Pendidikan',
    alamat: 'Jl. Pendidikan No. 456',
    kodePos: '12346',
    telepon: '021-7654321',
    email: 'diknas@example.com',
    website: 'diknas.example.com',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    nama: 'Dinas Pekerjaan Umum',
    alamat: 'Jl. PU No. 789',
    kodePos: '12347',
    telepon: '021-9876543',
    email: 'pu@example.com',
    website: 'pu.example.com',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/** Mock Kepala OPD data for development */
const MOCK_KEPALA_LIST: KepalaOPD[] = [
  {
    id: '1',
    opdId: '1',
    userId: 'user1',
    nama: 'Dr. Ahmad Sehat',
    nip: '197001012000011001',
    jabatan: 'Kepala Dinas',
    pangkat: 'Pembina Utama Muda',
    email: 'ahmad@dinkes.example.com',
    telepon: '081234567890',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    opdId: '2',
    userId: 'user2',
    nama: 'Drs. Budi Pendidikan',
    nip: '197502022005011002',
    jabatan: 'Kepala Dinas',
    pangkat: 'Pembina Utama Madya',
    email: 'budi@diknas.example.com',
    telepon: '081234567891',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Hook to get list of OPD
 * In production, this should fetch from API
 */
export function useOpdList() {
  const [opdList, setOpdList] = useState<OPD[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOpdList(MOCK_OPD_LIST)
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return { opdList, loading, error }
}

/**
 * Get initial OPD list (sync, for SSR/hydration)
 */
export function getInitialOpdList(): OPD[] {
  return MOCK_OPD_LIST
}

/**
 * Get initial Kepala OPD list (sync, for SSR/hydration)
 */
export function getInitialKepalaList(): KepalaOPD[] {
  return MOCK_KEPALA_LIST
}

/**
 * Get OPD by ID
 */
export function getOpdById(id: string): OPD | undefined {
  return MOCK_OPD_LIST.find((opd) => opd.id === id)
}
