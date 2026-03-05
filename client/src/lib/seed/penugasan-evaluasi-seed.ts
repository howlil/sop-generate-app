/**
 * Seed data untuk Manajemen Evaluasi SOP (Biro: batch per OPD, verifikasi BA).
* Tim Evaluasi alur baru: evaluasi langsung dari Daftar SOP Evaluasi (tanpa penugasan).
 */

import type { Penugasan, PenugasanTimEvaluasiItem } from '@/lib/types/penugasan'
import type { StatusSOP } from '@/lib/types/sop'
import { SEED_OPD_LIST } from '@/lib/seed/opd-seed'


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
    namaBiro: 'Dr. H. Muhammad Ridwan, M.Si',
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

/**
 * Data dummy SOP per OPD. Setiap status SOP (underlying) punya wakil:
 * - Berlaku: sop1, sop3, 1, sop4
 * - Siap Dievaluasi: 2, sop7
 * - Diajukan Evaluasi: sop6
 * - Dievaluasi Tim Evaluasi: 3
 * - Revisi dari Tim Evaluasi: 4
 * - Terverifikasi dari Biro Organisasi: sop2, sop5
 *
 * Tampilan di workspace evaluasi (by lastEvaluatedBy):
 * - Diajukan Evaluasi (belum dikirim): sop2, sop3, 2, sop5, sop7
 * - Selesai Evaluasi (sudah dikirim): sop1, 1, 3, 4, sop4, sop6
 * - Sedang Dievaluasi: hanya saat user isi form (runtime)
 */
const BASE_SOP_BY_OPD: Record<
  string,
  Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>
> = {
  'Dinas Pendidikan': [
    { id: 'sop1', nama: 'SOP Penerimaan Siswa Baru', nomor: 'SOP-DISDIK-001/2026', status: 'Berlaku' },
    { id: 'sop2', nama: 'SOP Ujian Sekolah', nomor: 'SOP-DISDIK-005/2026', status: 'Terverifikasi dari Biro Organisasi' },
    { id: 'sop3', nama: 'SOP Kelulusan', nomor: 'SOP-DISDIK-010/2026', status: 'Berlaku' },
    { id: '1', nama: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027', nomor: 'SOP/DISDIK/PLY/2026/001', status: 'Berlaku' },
    { id: '2', nama: 'SOP Pelaksanaan Ujian Akhir Sekolah', nomor: 'SOP/DISDIK/PLY/2026/005', status: 'Siap Dievaluasi' },
    { id: '3', nama: 'SOP Pengelolaan Data Kepegawaian Guru', nomor: 'SOP/DISDIK/ADM/2026/003', status: 'Dievaluasi Tim Evaluasi' },
    { id: '4', nama: 'SOP Revisi Dokumen Kurikulum', nomor: 'SOP/DISDIK/ADM/2026/004', status: 'Revisi dari Tim Evaluasi' },
  ],
  'Dinas Kesehatan': [
    { id: 'sop4', nama: 'SOP Pelayanan Kesehatan Dasar', nomor: 'SOP-DINKES-012/2026', status: 'Berlaku' },
    { id: 'sop5', nama: 'SOP Imunisasi', nomor: 'SOP-DINKES-018/2026', status: 'Terverifikasi dari Biro Organisasi' },
  ],
  DPMPTSP: [
    { id: 'sop6', nama: 'SOP Perizinan Usaha', nomor: 'SOP-DPMPTSP-005/2026', status: 'Diajukan Evaluasi' },
  ],
  'Bagian Umum': [
    { id: 'sop7', nama: 'SOP Pengadaan Barang', nomor: 'SOP-BAGUM-015/2026', status: 'Siap Dievaluasi' },
  ],
}

// Setiap OPD punya minimal 5 SOP dummy untuk Daftar SOP Evaluasi
export const SEED_SOP_BY_OPD: Record<
  string,
  Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>
> = (() => {
  const statusPool: StatusSOP[] = [
    'Berlaku' as StatusSOP,
    'Siap Dievaluasi' as StatusSOP,
    'Diajukan Evaluasi' as StatusSOP,
    'Dievaluasi Tim Evaluasi' as StatusSOP,
    'Revisi dari Tim Evaluasi' as StatusSOP,
    'Terverifikasi dari Biro Organisasi' as StatusSOP,
  ]

  const map: Record<string, Array<{ id: string; nama: string; nomor: string; status: StatusSOP }>> = {
    ...BASE_SOP_BY_OPD,
  }

  SEED_OPD_LIST.forEach((opd, idx) => {
    const name = opd.name
    const existing = map[name] ? [...map[name]] : []
    const needed = Math.max(0, 5 - existing.length)
    for (let i = 0; i < needed; i++) {
      const n = existing.length + 1
      const idSuffix = `${(idx + 1).toString().padStart(2, '0')}-${n}`
      existing.push({
        id: `sop-${idSuffix}`,
        nama: `SOP Dummy ${n} — ${name}`,
        nomor: `SOP/${(opd.name.split(' ')[1] ?? 'OPD').toUpperCase()}/${(2026).toString()}/${idSuffix}`,
        status: statusPool[(idx + i) % statusPool.length],
      })
    }
    map[name] = existing
  })

  return map
})()

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

/**
 * SOP id → { date, evaluatorName }. Hanya SOP yang sudah dikirim → tampil "Selesai Evaluasi".
 * SOP yang tidak ada di sini → tampil "Diajukan Evaluasi".
 *
 * Per status tampilan:
 * - Selesai Evaluasi: sop1, 1, 3, 4, sop4, sop6
 * - Diajukan Evaluasi: sop2, sop3, 2, sop5, sop7
 */
export const SEED_LAST_EVALUATED_BY: Record<string, { date: string; evaluatorName: string }> = {
  sop1: { date: '2026-02-10', evaluatorName: 'Dra. Siti Aminah, M.Si' },
  '1': { date: '2026-02-12', evaluatorName: 'Dra. Siti Aminah, M.Si' },
  '3': { date: '2026-02-01', evaluatorName: 'Ir. Dewi Kusumawati, MT' },
  '4': { date: '2026-02-08', evaluatorName: 'Dr. Bambang Suryanto' },
  sop4: { date: '2026-02-03', evaluatorName: 'Dra. Siti Aminah, M.Si' },
  sop6: { date: '2026-02-06', evaluatorName: 'Ir. Dewi Kusumawati, MT' },
}

/** Riwayat evaluasi per SOP: tanggal, evaluator, hasil (Sesuai/Revisi), komentar opsional. */
export type RiwayatEvaluasiSOPItem = {
  date: string
  evaluatorName: string
  hasil: 'Sesuai' | 'Revisi Biro'
  komentar?: string
}

/** Riwayat evaluasi OPD: per OPD, tiap entri terkait satu evaluasi (bisa per SOP). */
export type RiwayatEvaluasiOPDItem = {
  date: string
  evaluatorName: string
  skor: number
  sopId?: string
  sopJudul?: string
}

/** Riwayat hanya untuk SOP yang ada di SEED_LAST_EVALUATED_BY. Entri terakhir = match date + evaluatorName. */
export const SEED_RIWAYAT_EVALUASI_SOP: Record<string, RiwayatEvaluasiSOPItem[]> = {
  sop1: [
    { date: '2026-02-10', evaluatorName: 'Dra. Siti Aminah, M.Si', hasil: 'Sesuai' },
    { date: '2025-11-05', evaluatorName: 'Dr. Bambang Suryanto', hasil: 'Revisi Biro', komentar: 'Lengkapi lampiran format pendaftaran.' },
  ],
  '1': [
    { date: '2026-02-12', evaluatorName: 'Dra. Siti Aminah, M.Si', hasil: 'Sesuai' },
  ],
  '3': [
    { date: '2026-02-01', evaluatorName: 'Ir. Dewi Kusumawati, MT', hasil: 'Sesuai' },
  ],
  '4': [
    { date: '2026-02-08', evaluatorName: 'Dr. Bambang Suryanto', hasil: 'Revisi Biro', komentar: 'Lampiran kurikulum perlu disesuaikan dengan SK terbaru.' },
  ],
  sop4: [
    { date: '2026-02-03', evaluatorName: 'Dra. Siti Aminah, M.Si', hasil: 'Sesuai' },
  ],
  sop6: [
    { date: '2026-02-06', evaluatorName: 'Ir. Dewi Kusumawati, MT', hasil: 'Revisi Biro', komentar: 'Sinkronisasi dengan peraturan terbaru.' },
  ],
}

/** opdId → riwayat evaluasi OPD. Hanya entri untuk SOP yang ada di SEED_LAST_EVALUATED_BY. Judul = match SEED_SOP_BY_OPD. */
export const SEED_RIWAYAT_EVALUASI_OPD: Record<string, RiwayatEvaluasiOPDItem[]> = {
  opd1: [
    { date: '2026-02-12', evaluatorName: 'Dra. Siti Aminah, M.Si', skor: 5, sopId: '1', sopJudul: 'SOP Penerimaan Siswa Baru Tahun Ajaran 2026/2027' },
    { date: '2026-02-08', evaluatorName: 'Dr. Bambang Suryanto', skor: 4, sopId: '4', sopJudul: 'SOP Revisi Dokumen Kurikulum' },
    { date: '2026-02-01', evaluatorName: 'Ir. Dewi Kusumawati, MT', skor: 5, sopId: '3', sopJudul: 'SOP Pengelolaan Data Kepegawaian Guru' },
    { date: '2026-02-10', evaluatorName: 'Dra. Siti Aminah, M.Si', skor: 4, sopId: 'sop1', sopJudul: 'SOP Penerimaan Siswa Baru' },
  ],
  opd2: [
    { date: '2026-02-03', evaluatorName: 'Dra. Siti Aminah, M.Si', skor: 4, sopId: 'sop4', sopJudul: 'SOP Pelayanan Kesehatan Dasar' },
  ],
  opd3: [
    { date: '2026-02-06', evaluatorName: 'Ir. Dewi Kusumawati, MT', skor: 3, sopId: 'sop6', sopJudul: 'SOP Perizinan Usaha' },
  ],
  opd4: [],
}
