import { useState } from 'react'
import type { Peraturan } from '@/lib/types/peraturan'
import type { JenisPeraturan } from '@/lib/types/peraturan'

export type JenisFormState = {
  nama: string
  kode: string
  deskripsi: string
  tingkat: 'Pusat' | 'Daerah' | 'Internal'
}

export type PeraturanFormState = {
  jenisPeraturan: string
  nomor: string
  tahun: string
  tentang: string
  tanggalTerbit: string
}

export type DeleteConfirmState = { type: 'jenis'; id: string } | { type: 'peraturan'; id: string } | null

/**
 * State untuk Manajemen Peraturan (Kepala OPD): dialog open + form values + riwayat + delete confirm.
 * Data list (jenisList, peraturanList, riwayatVersiPeraturan) tetap di page/hook usePeraturan.
 */
export function useManajemenPeraturanState() {
  const [activeTab, setActiveTab] = useState('jenis')
  const [searchQuery, setSearchQuery] = useState('')
  const [isJenisDialogOpen, setIsJenisDialogOpen] = useState(false)
  const [editingJenis, setEditingJenis] = useState<JenisPeraturan | null>(null)
  const [jenisFormData, setJenisFormData] = useState<JenisFormState>({
    nama: '',
    kode: '',
    deskripsi: '',
    tingkat: 'Pusat',
  })
  const [isPeraturanDialogOpen, setIsPeraturanDialogOpen] = useState(false)
  const [editingPeraturan, setEditingPeraturan] = useState<Peraturan | null>(null)
  const [peraturanFormData, setPeraturanFormData] = useState<PeraturanFormState>({
    jenisPeraturan: '',
    nomor: '',
    tahun: '',
    tentang: '',
    tanggalTerbit: '',
  })
  const [riwayatVersiOpen, setRiwayatVersiOpen] = useState(false)
  const [selectedPeraturanForRiwayat, setSelectedPeraturanForRiwayat] = useState<Peraturan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>(null)

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isJenisDialogOpen,
    setIsJenisDialogOpen,
    editingJenis,
    setEditingJenis,
    jenisFormData,
    setJenisFormData,
    isPeraturanDialogOpen,
    setIsPeraturanDialogOpen,
    editingPeraturan,
    setEditingPeraturan,
    peraturanFormData,
    setPeraturanFormData,
    riwayatVersiOpen,
    setRiwayatVersiOpen,
    selectedPeraturanForRiwayat,
    setSelectedPeraturanForRiwayat,
    deleteConfirm,
    setDeleteConfirm,
  }
}
