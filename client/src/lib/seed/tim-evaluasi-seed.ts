/**
 * Seed data untuk Manajemen Tim Evaluasi (Kepala Biro Organisasi).
 */

export interface TimMonev {
  id: string
  name: string
  nip: string
  jabatan: string
  email: string
  jumlahEvaluasi: number
}

export const SEED_TIM_MONEV_LIST: TimMonev[] = [
  {
    id: '1',
    name: 'Dra. Siti Aminah, M.Si',
    nip: '197503152000032001',
    jabatan: 'IV/a - Pembina',
    email: 'siti.aminah@pemda.go.id',
    jumlahEvaluasi: 45,
  },
  {
    id: '2',
    name: 'Dr. Bambang Suryanto',
    nip: '198201102005011002',
    jabatan: 'III/b - Penata Muda Tk.I',
    email: 'bambang.s@pemda.go.id',
    jumlahEvaluasi: 38,
  },
  {
    id: '3',
    name: 'Ir. Dewi Kusumawati, MT',
    nip: '198805252010012003',
    jabatan: 'IV/b - Pembina Tk.I',
    email: 'dewi.k@pemda.go.id',
    jumlahEvaluasi: 32,
  },
]
