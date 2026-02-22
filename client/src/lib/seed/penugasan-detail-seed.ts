/**
 * Seed data untuk halaman Detail Penugasan (Tim Evaluasi) — lookup penugasan by id & konten preview SOP.
 */

export interface PenugasanDetailItem {
  id: string
  kodePenugasan: string
  opd: string
  sop: string
  kodeSOP: string
  jenis: 'Evaluasi Rutin' | 'Evaluasi Khusus' | 'Evaluasi Insidental'
  tanggalPenugasan: string
  status: 'assigned' | 'in-progress' | 'completed'
}

export const SEED_PENUGASAN_DETAIL_BY_ID: Record<string, PenugasanDetailItem> = {
  '1': {
    id: '1',
    kodePenugasan: 'TUG-EVL-012/2026',
    opd: 'Dinas Pendidikan',
    sop: 'SOP Penerimaan Siswa Baru 2026',
    kodeSOP: 'SOP/DISDIK/PLY/2026/001',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2026-01-20',
    status: 'in-progress',
  },
  '2': {
    id: '2',
    kodePenugasan: 'TUG-EVL-013/2026',
    opd: 'Dinas Kesehatan',
    sop: 'SOP Pelayanan Puskesmas 24 Jam',
    kodeSOP: 'SOP/DINKES/PLY/2026/005',
    jenis: 'Evaluasi Khusus',
    tanggalPenugasan: '2026-01-22',
    status: 'in-progress',
  },
  '3': {
    id: '3',
    kodePenugasan: 'TUG-EVL-014/2026',
    opd: 'Dinas Perhubungan',
    sop: 'SOP Pengurusan SIM',
    kodeSOP: 'SOP/DISHUB/ADM/2026/003',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2026-01-25',
    status: 'assigned',
  },
  '4': {
    id: '4',
    kodePenugasan: 'TUG-EVL-010/2026',
    opd: 'Dinas Pendidikan',
    sop: 'SOP Ujian Akhir Semester',
    kodeSOP: 'SOP/DISDIK/ADM/2025/003',
    jenis: 'Evaluasi Rutin',
    tanggalPenugasan: '2025-12-15',
    status: 'completed',
  },
  '5': {
    id: '5',
    kodePenugasan: 'TUG-EVL-009/2025',
    opd: 'Dinas Sosial',
    sop: 'SOP Bantuan Sosial',
    kodeSOP: 'SOP/DINSOS/PLY/2025/008',
    jenis: 'Evaluasi Insidental',
    tanggalPenugasan: '2025-12-10',
    status: 'completed',
  },
}

/** Konten preview SOP per judul (untuk halaman detail penugasan). */
export const SEED_SOP_CONTENT_PREVIEW: Record<string, string> = {
  '1. Tujuan':
    'Memberikan panduan bagi petugas pendaftaran dalam melaksanakan proses penerimaan siswa baru secara tertib, transparan, dan akuntabel.',
  '2. Ruang Lingkup':
    'SOP ini mencakup proses pendaftaran, verifikasi dokumen, seleksi, pengumuman hasil, dan daftar ulang siswa baru untuk jenjang SD, SMP, dan SMA/SMK (termasuk jalur zonasi, prestasi, dan afirmasi).',
  '3. Definisi': 'PPDB: Penerimaan Peserta Didik Baru\nCPDB: Calon Peserta Didik Baru',
  '4. Prosedur Kerja':
    '1. Calon siswa melakukan pendaftaran online\n2. Petugas memverifikasi kelengkapan dokumen (3 hari kerja)\n3. Proses seleksi berdasarkan zonasi/prestasi\n4. Pengumuman hasil seleksi\n5. Daftar ulang siswa yang diterima',
}
