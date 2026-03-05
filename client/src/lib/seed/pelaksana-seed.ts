/**
 * Seed data untuk halaman Kelola Pelaksana SOP (Tim Penyusun): daftar pelaksana.
 */

import type { PelaksanaSOP } from '@/lib/types/sop'

export const SEED_PELAKSANA_LIST: PelaksanaSOP[] = [
  {
    id: 'pel-1',
    nama: 'Pelaksana Utama',
    deskripsi: 'Menangani SOP layanan utama dan administrasi umum.',
    jumlahPos: 3,
  },
  {
    id: 'pel-2',
    nama: 'Pelaksana Pendukung',
    deskripsi: 'Membantu pelaksanaan POS pendukung lintas unit.',
    jumlahPos: 0,
  },
]
