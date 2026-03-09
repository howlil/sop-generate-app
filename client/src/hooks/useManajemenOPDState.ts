import { useState } from 'react'
import type { KepalaOPD } from '@/lib/types/opd'

export type KepalaFormState = { name: string; nip: string; email: string; phone: string }
export type FormTambahKepalaState = { opdId: string; name: string; nip: string; email: string }
export type PindahFormState = { opdId: string }
export type PindahDialogPerson = { name: string; email: string; phone: string; nip?: string }
export type RiwayatDialogPerson = { name: string; email: string }

/**
 * State untuk tab Kepala OPD di Manajemen OPD: dialog open + form values.
 * Logic simpan/ubah (saveKepala, savePenugasan, dll.) tetap di page yang punya kepalaList/setKepalaList.
 */
export function useManajemenOPDState() {
  const [kepalaFormOpen, setKepalaFormOpen] = useState(false)
  const [tambahKepalaOpen, setTambahKepalaOpen] = useState(false)
  const [pindahDialogOpen, setPindahDialogOpen] = useState(false)
  const [riwayatDialogOpen, setRiwayatDialogOpen] = useState(false)
  const [editingKepala, setEditingKepala] = useState<KepalaOPD | null>(null)
  const [kepalaForm, setKepalaForm] = useState<KepalaFormState>({
    name: '',
    nip: '',
    email: '',
    phone: '',
  })
  const [formTambahKepala, setFormTambahKepala] = useState<FormTambahKepalaState>({
    opdId: '',
    name: '',
    nip: '',
    email: '',
  })
  const [pindahForm, setPindahForm] = useState<PindahFormState>({ opdId: '' })
  const [riwayatDialogPerson, setRiwayatDialogPerson] = useState<RiwayatDialogPerson | null>(null)
  const [pindahDialogPerson, setPindahDialogPerson] = useState<PindahDialogPerson | null>(null)

  return {
    kepalaFormOpen,
    setKepalaFormOpen,
    tambahKepalaOpen,
    setTambahKepalaOpen,
    pindahDialogOpen,
    setPindahDialogOpen,
    riwayatDialogOpen,
    setRiwayatDialogOpen,
    editingKepala,
    setEditingKepala,
    kepalaForm,
    setKepalaForm,
    formTambahKepala,
    setFormTambahKepala,
    pindahForm,
    setPindahForm,
    riwayatDialogPerson,
    setRiwayatDialogPerson,
    pindahDialogPerson,
    setPindahDialogPerson,
  }
}
