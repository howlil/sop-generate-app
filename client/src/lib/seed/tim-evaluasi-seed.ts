/**
 * Seed data untuk Manajemen Tim Evaluasi (Kepala Biro Organisasi).
 */

import type { TimMonev } from '@/lib/types/tim'

export const SEED_TIM_MONEV_LIST: TimMonev[] = [
  {
    id: '1',
    nama: 'Dra. Siti Aminah, M.Si',
    nip: '197503152000032001',
    jabatan: 'IV/a - Pembina',
    pangkat: 'IV/a',
    email: 'siti.aminah@pemda.go.id',
    jumlahEvaluasi: 45,
  },
  {
    id: '2',
    nama: 'Dr. Bambang Suryanto',
    nip: '198201102005011002',
    jabatan: 'III/b - Penata Muda Tk.I',
    pangkat: 'III/b',
    email: 'bambang.s@pemda.go.id',
    jumlahEvaluasi: 38,
  },
  {
    id: '3',
    nama: 'Ir. Dewi Kusumawati, MT',
    nip: '198805252010012003',
    jabatan: 'IV/b - Pembina Tk.I',
    pangkat: 'IV/b',
    email: 'dewi.k@pemda.go.id',
    jumlahEvaluasi: 32,
  },
]
