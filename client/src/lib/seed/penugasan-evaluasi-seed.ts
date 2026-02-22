/**
 * Seed data untuk Manajemen Evaluasi SOP, Edit Penugasan, dan Penugasan (Tim Evaluasi).
 */

import type { Penugasan, PenugasanTimEvaluasiItem } from '@/lib/types/penugasan'
import type { StatusSOP } from '@/lib/types/sop'


export const SEED_PENUGASAN_INITIAL: Penugasan[] = [
  {
    id: '1',
    jenis: 'Inisiasi Biro',
    opd: 'Dinas Pendidikan',
    sopList: [
      { id: 's1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Sesuai', catatan: 'Proses berjalan lancar.', rekomendasi: 'Tingkatkan kapasitas server.' },
      { id: 's2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Sesuai', catatan: 'Prosedur sesuai standar.', rekomendasi: 'Pertahankan standar.' },
    ],
    timMonev: 'Dra. Siti Aminah, M.Si',
    status: 'Terverifikasi',
    catatan: 'Evaluasi rutin Q1 2026',
    tanggalEvaluasi: '2026-02-05',
    isVerified: true,
    nomorBA: 'BA/BIRO/001/II/2026',
    tanggalVerifikasi: '2026-02-06',
    kepalaBiro: 'Dr. H. Muhammad Ridwan, M.Si',
  },
  {
    id: '2',
    jenis: 'Request OPD',
    tanggalRequest: '2026-02-03',
    opd: 'DPMPTSP',
    evaluationCaseId: undefined,
    sopList: [
      { id: 's3', nama: 'SOP Perizinan Usaha Mikro', nomor: 'SOP-DPMPTSP-005/2026', status: 'Perlu Perbaikan', catatan: 'Beberapa tahapan tidak konsisten.', rekomendasi: 'Perbaiki dokumentasi.' },
    ],
    timMonev: 'Dr. Bambang Suryanto',
    status: 'Selesai',
    catatan: 'Request dari DPMPTSP',
    tanggalEvaluasi: '2026-02-04',
    isVerified: false,
  },
  {
    id: '3',
    jenis: 'Inisiasi Biro',
    opd: 'Dinas Kesehatan',
    sopList: [
      { id: 's4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026' },
      { id: 's5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026' },
      { id: 's6', nama: 'SOP Rujukan Pasien', nomor: 'SOP-DINKES-022/2026' },
    ],
    timMonev: 'Dr. Bambang Suryanto',
    status: 'Sudah Ditugaskan',
    catatan: 'Evaluasi SOP pelayanan kesehatan',
    evaluationCaseId: undefined,
  },
  {
    id: '4',
    jenis: 'Inisiasi Biro',
    opd: 'Dinas Kesehatan',
    sopList: [
      { id: 's4b', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Sesuai', catatan: 'Pelayanan berjalan baik.', rekomendasi: 'Pertahankan.' },
      { id: 's5b', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Sesuai', catatan: 'Program sesuai jadwal.', rekomendasi: 'Tingkatkan sosialisasi.' },
      { id: 's6b', nama: 'SOP Rujukan Pasien', nomor: 'SOP-DINKES-022/2026', status: 'Sesuai', catatan: 'Sistem rujukan efektif.', rekomendasi: 'Pertahankan.' },
    ],
    timMonev: 'Ir. Dewi Kusumawati, MT',
    status: 'Selesai',
    catatan: 'Evaluasi Q1 2026',
    tanggalEvaluasi: '2026-02-03',
    isVerified: false,
  },
]

export const SEED_OPD_LIST_EVALUASI: { id: string; nama: string; kode: string }[] = [
  { id: 'opd1', nama: 'Dinas Pendidikan', kode: 'DISDIK' },
  { id: 'opd2', nama: 'Dinas Kesehatan', kode: 'DINKES' },
  { id: 'opd3', nama: 'DPMPTSP', kode: 'DPMPTSP' },
  { id: 'opd4', nama: 'Bagian Umum', kode: 'BAGUM' },
]

export const SEED_SOP_BY_OPD: Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>> = {
  'Dinas Pendidikan': [
    { id: 'sop1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Berlaku' },
    { id: 'sop2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Terverifikasi dari Kepala Biro' },
    { id: 'sop3', nama: 'SOP Kelulusan', nomor: 'SOP-DISDIK-010/2026', status: 'Berlaku' },
    { id: '1', nama: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027', nomor: 'SOP/DISDIK/PLY/2026/001', status: 'Berlaku' },
    { id: '2', nama: 'SOP Pelaksanaan Ujian Akhir Sekolah', nomor: 'SOP/DISDIK/PLY/2026/005', status: 'Siap Dievaluasi' },
    { id: '3', nama: 'SOP Pengelolaan Data Kepegawaian Guru', nomor: 'SOP/DISDIK/ADM/2026/003', status: 'Dievaluasi Tim Evaluasi' },
  ],
  'Dinas Kesehatan': [
    { id: 'sop4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Berlaku' },
    { id: 'sop5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Terverifikasi dari Kepala Biro' },
  ],
  DPMPTSP: [
    { id: 'sop6', nama: 'SOP Perizinan Usaha', nomor: 'SOP-DPMPTSP-005/2026', status: 'Diajukan Evaluasi' },
  ],
  'Bagian Umum': [
    { id: 'sop7', nama: 'SOP Pengadaan Barang', nomor: 'SOP-BAGUM-015/2026', status: 'Siap Dievaluasi' },
  ],
}

export const SEED_TIM_MONEV_OPTIONS: { id: string; nama: string }[] = [
  { id: 'tm1', nama: 'Dra. Siti Aminah, M.Si' },
  { id: 'tm2', nama: 'Dr. Bambang Suryanto' },
  { id: 'tm3', nama: 'Ir. Dewi Kusumawati, MT' },
]

export const SEED_PENUGASAN_TIM_EVALUASI: PenugasanTimEvaluasiItem[] = [
  { id: '1', kodePenugasan: 'TUG-EVL-012/2026', opd: 'Dinas Pendidikan', sop: 'SOP Penerimaan Siswa Baru 2026', kodeSOP: 'SOP/DISDIK/PLY/2026/001', jenis: 'Evaluasi Rutin', tanggalPenugasan: '2026-01-20', status: 'in-progress' },
  { id: '2', kodePenugasan: 'TUG-EVL-013/2026', opd: 'Dinas Kesehatan', sop: 'SOP Pelayanan Puskesmas 24 Jam', kodeSOP: 'SOP/DINKES/PLY/2026/005', jenis: 'Evaluasi Khusus', tanggalPenugasan: '2026-01-22', status: 'in-progress' },
  { id: '3', kodePenugasan: 'TUG-EVL-014/2026', opd: 'Dinas Perhubungan', sop: 'SOP Pengurusan SIM', kodeSOP: 'SOP/DISHUB/ADM/2026/003', jenis: 'Evaluasi Rutin', tanggalPenugasan: '2026-01-25', status: 'assigned' },
  { id: '4', kodePenugasan: 'TUG-EVL-010/2026', opd: 'Dinas Pendidikan', sop: 'SOP Ujian Akhir Semester', kodeSOP: 'SOP/DISDIK/ADM/2025/003', jenis: 'Evaluasi Rutin', tanggalPenugasan: '2025-12-15', status: 'completed' },
  { id: '5', kodePenugasan: 'TUG-EVL-009/2025', opd: 'Dinas Sosial', sop: 'SOP Bantuan Sosial', kodeSOP: 'SOP/DINSOS/PLY/2025/008', jenis: 'Evaluasi Insidental', tanggalPenugasan: '2025-12-10', status: 'completed' },
]

/** OPD yang mengajukan request evaluasi ke Biro. */
export const SEED_OPD_REQUEST_BIRO: string[] = ['DPMPTSP']
