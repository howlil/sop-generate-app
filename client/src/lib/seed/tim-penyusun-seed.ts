/**
 * Seed data untuk Manajemen Tim Penyusun (Kepala OPD) dan opsi tim penyusun di Inisiasi Proyek.
 */

import type { TimPenyusun, TimPenyusunOption } from '@/lib/types/tim'

export const SEED_TIM_PENYUSUN_LIST: TimPenyusun[] = [
  {
    id: '1',
    nama: 'Ahmad Pratama, S.Sos',
    nip: '199203152020121001',
    jabatan: 'Kepala Seksi Organisasi',
    email: 'ahmad.pratama@disdik.go.id',
    noHP: '081234567890',
    status: 'Aktif',
    jumlahSOPDisusun: 12,
    tanggalBergabung: '2023-01-15',
  },
  {
    id: '2',
    nama: 'Siti Nurhaliza, S.Pd',
    nip: '199105102019032005',
    jabatan: 'Staf Bagian Tata Usaha',
    email: 'siti.nurhaliza@disdik.go.id',
    noHP: '082345678901',
    status: 'Aktif',
    jumlahSOPDisusun: 8,
    tanggalBergabung: '2023-03-20',
  },
  {
    id: '3',
    nama: 'Budi Santoso, S.T',
    nip: '198808252018031002',
    jabatan: 'Kepala Sub Bagian Perencanaan',
    email: 'budi.santoso@disdik.go.id',
    noHP: '083456789012',
    status: 'Aktif',
    jumlahSOPDisusun: 15,
    tanggalBergabung: '2022-06-10',
  },
  {
    id: '4',
    nama: 'Dewi Kusuma, S.E',
    nip: '199012152021022001',
    jabatan: 'Staf Keuangan',
    email: 'dewi.kusuma@disdik.go.id',
    noHP: '084567890123',
    status: 'Nonaktif',
    jumlahSOPDisusun: 5,
    tanggalBergabung: '2021-09-01',
  },
]

export const SEED_TIM_PENYUSUN_OPTIONS: TimPenyusunOption[] = [
  { id: '1', nama: 'Ahmad Pratama, S.Sos', jabatan: 'Kepala Seksi Kurikulum' },
  { id: '2', nama: 'Siti Nurhaliza, S.Pd', jabatan: 'Staff Kurikulum' },
  { id: '3', nama: 'Budi Santoso, S.T', jabatan: 'Kepala TU' },
  { id: '4', nama: 'Rina Wijaya, S.Pd', jabatan: 'Staff Administrasi' },
]
