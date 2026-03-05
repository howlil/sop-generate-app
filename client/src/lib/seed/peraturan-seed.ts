/**
 * Seed data untuk Manajemen Peraturan (Tim Penyusun).
 * OPD yang sedang login (mock): hanya peraturan dengan createdBy === currentOPDId yang bisa diedit.
 */

import type { Peraturan, JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'
export type { JenisPeraturan, RiwayatVersiEntry } from '@/lib/types/peraturan'

export const SEED_MANAJEMEN_PERATURAN_OPD_ID = '1'

export const SEED_JENIS_PERATURAN: JenisPeraturan[] = [
  { id: '1', nama: 'Peraturan Menteri Pendidikan dan Kebudayaan', kode: 'Permendikbud', deskripsi: 'Peraturan yang ditetapkan oleh Menteri Pendidikan dan Kebudayaan', tingkat: 'Pusat', jumlahPeraturan: 3, createdBy: 'biro' },
  { id: '2', nama: 'Peraturan Daerah', kode: 'Perda', deskripsi: 'Peraturan yang ditetapkan oleh DPRD bersama Kepala Daerah', tingkat: 'Daerah', jumlahPeraturan: 2, createdBy: 'biro' },
  { id: '3', nama: 'Surat Keputusan Kepala Dinas', kode: 'SK Kadis', deskripsi: 'Keputusan yang ditetapkan oleh Kepala Dinas', tingkat: 'Internal', jumlahPeraturan: 4, createdBy: SEED_MANAJEMEN_PERATURAN_OPD_ID },
  { id: '4', nama: 'Peraturan Presiden', kode: 'Perpres', deskripsi: 'Peraturan yang ditetapkan oleh Presiden', tingkat: 'Pusat', jumlahPeraturan: 1, createdBy: '2' },
  { id: '5', nama: 'Keputusan Gubernur', kode: 'Kepgub', deskripsi: 'Keputusan yang ditetapkan oleh Gubernur', tingkat: 'Daerah', jumlahPeraturan: 0, createdBy: 'biro' },
]

export const SEED_RIWAYAT_VERSI_PERATURAN: Record<string, RiwayatVersiEntry[]> = {
  '1': [
    { version: 1, tanggal: '2026-01-05', diubahOleh: 'Biro Organisasi', sopYangMengait: [{ id: 's1', nama: 'SOP Penerimaan Siswa Baru' }, { id: 's2', nama: 'SOP Ujian Sekolah' }, { id: 's3', nama: 'SOP Kelulusan' }] },
  ],
  '2': [
    { version: 1, tanggal: '2025-11-20', diubahOleh: 'Biro Organisasi', sopYangMengait: [{ id: 's4', nama: 'SOP Penyelenggaraan Pendidikan Daerah' }, { id: 's5', nama: 'SOP Bantuan Operasional' }] },
  ],
  '3': [
    { version: 1, tanggal: '2026-01-05', diubahOleh: 'Dinas Pendidikan', sopYangMengait: [{ id: 's6', nama: 'SOP Penilaian Kinerja Guru (lama)' }] },
    { version: 2, tanggal: '2026-01-10', diubahOleh: 'Dinas Pendidikan', sopYangMengait: [{ id: 's7', nama: 'SOP Evaluasi Kinerja Guru' }, { id: 's8', nama: 'SOP Sertifikasi Guru' }] },
  ],
  '4': [
    { version: 1, tanggal: '2025-03-15', diubahOleh: 'Dinas Kesehatan', sopYangMengait: [{ id: 's9', nama: 'SOP Pengadaan Barang' }, { id: 's10', nama: 'SOP Lelang' }] },
  ],
}

export const SEED_PERATURAN: Peraturan[] = [
  { id: '1', jenisPeraturan: 'Permendikbud', nomor: '1', tahun: '2026', tentang: 'Penerimaan Peserta Didik Baru', tanggalTerbit: '2026-01-05', status: 'Berlaku', digunakan: 3, createdBy: 'biro', version: 1 },
  { id: '2', jenisPeraturan: 'Perda', nomor: '12', tahun: '2025', tentang: 'Penyelenggaraan Pendidikan', tanggalTerbit: '2025-11-20', status: 'Berlaku', digunakan: 5, createdBy: 'biro', version: 1 },
  { id: '3', jenisPeraturan: 'SK Kadis', nomor: '15', tahun: '2026', tentang: 'Evaluasi Kinerja Guru', tanggalTerbit: '2026-01-10', status: 'Berlaku', digunakan: 2, createdBy: SEED_MANAJEMEN_PERATURAN_OPD_ID, version: 2 },
  { id: '4', jenisPeraturan: 'Perpres', nomor: '12', tahun: '2025', tentang: 'Pengadaan Barang dan Jasa Pemerintah', tanggalTerbit: '2025-03-15', status: 'Berlaku', digunakan: 4, createdBy: '2', version: 1 },
  { id: '5', jenisPeraturan: 'Permendikbud', nomor: '10', tahun: '2025', tentang: 'Ujian Sekolah', tanggalTerbit: '2025-09-01', status: 'Berlaku', digunakan: 1, createdBy: SEED_MANAJEMEN_PERATURAN_OPD_ID, version: 1 },
  { id: '6', jenisPeraturan: 'SK Kadis', nomor: '8', tahun: '2026', tentang: 'Pembentukan Tim Penyusun SOP', tanggalTerbit: '2026-01-03', status: 'Berlaku', digunakan: 0, createdBy: SEED_MANAJEMEN_PERATURAN_OPD_ID, version: 1 },
  { id: '7', jenisPeraturan: 'Permendikbud', nomor: '5', tahun: '2024', tentang: 'Kurikulum Merdeka', tanggalTerbit: '2024-08-10', status: 'Dicabut', digunakan: 0, createdBy: 'biro', version: 1 },
]

export const SEED_OPD_NAMES: Record<string, string> = {
  '1': 'Dinas Pendidikan',
  '2': 'Dinas Kesehatan',
  '3': 'Dinas Perhubungan',
  biro: 'Biro Organisasi',
}
