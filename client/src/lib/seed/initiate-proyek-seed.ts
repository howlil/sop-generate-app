/**
 * Seed data untuk halaman Initiate Proyek SOP: template SOP yang bisa di-copy.
 */

import type { SOPTemplate } from '@/lib/types/sop'
export type { SOPTemplate } from '@/lib/types/sop'

export const SEED_SOP_TEMPLATES: SOPTemplate[] = [
  {
    id: '1',
    kode: 'SOP/DINKES/PLY/2026/001',
    judul: 'SOP Pelayanan Kesehatan Masyarakat',
    opd: 'Dinas Kesehatan',
    kategori: 'Pelayanan',
    versi: '2.0',
  },
  {
    id: '2',
    kode: 'SOP/DISHUB/PLY/2026/003',
    judul: 'SOP Penerbitan Izin Trayek',
    opd: 'Dinas Perhubungan',
    kategori: 'Pelayanan',
    versi: '1.5',
  },
  {
    id: '3',
    kode: 'SOP/DPUPR/ADM/2026/005',
    judul: 'SOP Pengadaan Barang dan Jasa',
    opd: 'Dinas PUPR',
    kategori: 'Administrasi',
    versi: '3.0',
  },
]
