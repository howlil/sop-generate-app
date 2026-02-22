/**
 * Seed data untuk Detail SOP (Tim Penyusun): metadata, prosedur, implementers, versi, komentar.
 */

import type { ProsedurRow } from '@/lib/types/sop'

export interface SOPDetailMetadata {
  institutionLogo: string
  institutionLines: string[]
  name: string
  number: string
  version: number
  createdDate: string
  revisionDate: string
  effectiveDate: string
  picName: string
  picNumber: string
  picRole: string
  section: string
  lawBasis: string[]
  implementQualification: string[]
  relatedSop: string[]
  equipment: string[]
  warning: string
  recordData: string[]
  signature: string
}

export const SEED_SOP_DETAIL_METADATA: SOPDetailMetadata = {
  institutionLogo: '/logo_unand_kecil.png',
  institutionLines: [
    'PEMERINTAH KABUPATEN PADANG',
    'DINAS PENDIDIKAN',
    'BIDANG PENDIDIKAN DASAR',
    'SEKSI KURIKULUM DAN PENILAIAN',
  ],
  name: 'Percobaan',
  number: 'T.001/UN15/KP.01.00/2024',
  version: 3,
  createdDate: '2024-11-27',
  revisionDate: '2026-02-10',
  effectiveDate: '2024-11-27',
  picName: 'Dr. Ahmad Fauzi, M.Kom',
  picNumber: '198505102010121001',
  picRole: 'Penanggung Jawab',
  section: 'Layanan Akademik',
  lawBasis: [
    'Peraturan Daerah Kota Padang Nomor 28 Tahun 2018 tentang Keterbukaan Informasi Publik',
  ],
  implementQualification: ['Riset'],
  relatedSop: [],
  equipment: [],
  warning: '-',
  recordData: [],
  signature: '',
}

export const SEED_SOP_DETAIL_PROSEDUR_ROWS: ProsedurRow[] = [
  {
    id: '1',
    no: 1,
    kegiatan: 'Pemohon mengisi formulir pengajuan online',
    pelaksana: { 'impl-1': '√', 'impl-2': '', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Formulir terisi lengkap',
    mutu_waktu: '5 Menit',
    output: 'Draft pengajuan',
    keterangan: 'Pemohon memulai proses.',
  },
  {
    id: '2',
    no: 2,
    kegiatan: 'Admin Prodi verifikasi berkas dan kelengkapan',
    pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Checklist verifikasi',
    mutu_waktu: '15 Menit',
    output: 'Status verifikasi',
    keterangan: 'Cek kelengkapan dokumen.',
  },
  {
    id: '3',
    no: 3,
    type: 'decision',
    kegiatan: 'Berkas lengkap?',
    pelaksana: { 'impl-1': '', 'impl-2': '√', 'impl-3': '', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: '-',
    mutu_waktu: '-',
    output: '-',
    keterangan: 'Jika tidak lengkap kembali ke verifikasi.',
    id_next_step_if_yes: '4',
    id_next_step_if_no: '2',
  },
  {
    id: '4',
    no: 4,
    kegiatan: 'Kaprodi review substansi pengajuan',
    pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '√', 'impl-4': '', 'impl-5': '' },
    mutu_kelengkapan: 'Dokumen final',
    mutu_waktu: '1 Hari',
    output: 'Catatan review',
    keterangan: 'Review isi dokumen.',
  },
  {
    id: '5',
    no: 5,
    kegiatan: 'Dekan menandatangani dan mengesahkan',
    pelaksana: { 'impl-1': '', 'impl-2': '', 'impl-3': '', 'impl-4': '√', 'impl-5': '' },
    mutu_kelengkapan: 'Dokumen siap tanda tangan',
    mutu_waktu: '1 Hari',
    output: 'Dokumen disahkan',
    keterangan: 'Final approval.',
  },
]

export const SEED_IMPLEMENTERS: { id: string; name: string }[] = [
  { id: 'impl-1', name: 'Pemohon / Mahasiswa' },
  { id: 'impl-2', name: 'Admin Prodi' },
  { id: 'impl-3', name: 'Kaprodi' },
  { id: 'impl-4', name: 'Dekan' },
  { id: 'impl-5', name: 'Kabag. Akademik' },
]

export interface KomentarSeed {
  id: string
  user: string
  role: 'Kepala OPD' | 'Tim Evaluasi' | 'Tim Penyusun'
  timestamp: string
  bagian: string
  isi: string
  status: 'open' | 'resolved'
}

export const SEED_KOMENTAR_LIST: KomentarSeed[] = [
  {
    id: '1',
    user: 'Dr. Ahmad Fauzi',
    role: 'Kepala OPD',
    timestamp: '2026-02-10 14:30',
    bagian: 'Metadata - Dasar Hukum',
    isi: 'Perlu ditambahkan referensi ke Permendikbud terbaru',
    status: 'open',
  },
  {
    id: '2',
    user: 'Dra. Siti Aminah, M.Si',
    role: 'Tim Evaluasi',
    timestamp: '2026-02-09 10:15',
    bagian: 'Prosedur - Baris 1',
    isi: 'Waktu proses terlalu singkat, perlu disesuaikan dengan standar pelayanan',
    status: 'resolved',
  },
]

export interface VersionSeed {
  id: string
  version: string
  revisionType: 'major' | 'minor'
  date: string
  author: string
  changes: string
  snapshot: { metadata: SOPDetailMetadata; prosedurRows: ProsedurRow[] } | null
}

/** Build initial versions with snapshot pointing to seed metadata/prosedur (shared ref). */
export function getInitialVersions(): VersionSeed[] {
  return [
    { id: 'v2.1', version: '2.1', revisionType: 'minor', date: '2026-02-10', author: 'Budi Santoso', changes: 'Perbaikan metadata dan penambahan prosedur baru', snapshot: { metadata: SEED_SOP_DETAIL_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } },
    { id: 'v2.0', version: '2.0', revisionType: 'major', date: '2026-02-05', author: 'Ahmad Pratama', changes: 'Revisi major setelah SOP disahkan dan hasil evaluasi', snapshot: { metadata: SEED_SOP_DETAIL_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } },
    { id: 'v1.1', version: '1.1', revisionType: 'minor', date: '2026-01-28', author: 'Budi Santoso', changes: 'Revisi minor dari review internal', snapshot: { metadata: SEED_SOP_DETAIL_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } },
    { id: 'v1.0', version: '1.0', revisionType: 'major', date: '2026-01-20', author: 'Budi Santoso', changes: 'Versi awal dokumen', snapshot: { metadata: SEED_SOP_DETAIL_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS } },
  ]
}

// --- Seed untuk halaman Detail SOP (Kepala OPD) ---

export interface DetailSOPViewMetadata {
  name: string
  number: string
  version: number
  createdDate: string
  revisionDate: string
  effectiveDate: string
  picName: string
  picNumber: string
  picRole: string
  section: string
  lawBasis: string[]
  implementQualification: string[]
  relatedSop: string[]
  equipment: string[]
  warning: string
  recordData: string[]
  signature: string
}

export const SEED_DETAIL_SOP_VIEW_METADATA: DetailSOPViewMetadata = {
  name: 'Percobaan',
  number: 'T.001/UN15/KP.01.00/2024',
  version: 3,
  createdDate: '2024-11-27',
  revisionDate: '2026-02-10',
  effectiveDate: '2024-11-27',
  picName: 'Dr. Ahmad Fauzi, M.Kom',
  picNumber: '198505102010121001',
  picRole: 'Penanggung Jawab',
  section: 'Layanan Akademik',
  lawBasis: [
    'Peraturan Daerah Kota Padang Nomor 28 Tahun 2018 tentang Keterbukaan Informasi Publik',
  ],
  implementQualification: ['Riset'],
  relatedSop: [],
  equipment: [],
  warning: '-',
  recordData: [],
  signature: '',
}

export interface DetailSOPVersionSeed {
  id: string
  version: string
  date: string
  author: string
  changes: string
  snapshot: { metadata: DetailSOPViewMetadata; prosedurRows: ProsedurRow[] } | null
  eventLabel?: string
  revisionType?: 'major' | 'minor'
}

export const SEED_DETAIL_SOP_VERSIONS: DetailSOPVersionSeed[] = [
  {
    id: 'v3',
    version: '3.0',
    date: '2026-02-10',
    author: 'Budi Santoso',
    changes: 'Perbaikan metadata dan penambahan prosedur baru',
    snapshot: { metadata: SEED_DETAIL_SOP_VIEW_METADATA, prosedurRows: SEED_SOP_DETAIL_PROSEDUR_ROWS },
    eventLabel: 'Submit ke Review',
    revisionType: 'minor',
  },
  {
    id: 'v2',
    version: '2.0',
    date: '2026-02-05',
    author: 'Ahmad Pratama',
    changes: 'Revisi mayor sesuai feedback evaluasi',
    snapshot: null,
    eventLabel: 'Ajukan Evaluasi',
    revisionType: 'major',
  },
  {
    id: 'v1',
    version: '1.0',
    date: '2026-01-20',
    author: 'Budi Santoso',
    changes: 'Versi awal dokumen',
    snapshot: null,
    eventLabel: 'Draft awal',
    revisionType: 'major',
  },
]

/** User saat ini (Kepala OPD) untuk komentar baru di halaman Detail SOP. */
export const SEED_DETAIL_SOP_CURRENT_USER = {
  user: 'Dr. Ahmad Fauzi',
  role: 'Kepala OPD',
} as const

/** Komentar awal untuk halaman Detail SOP (Kepala OPD). */
export const SEED_DETAIL_SOP_KOMENTAR_INITIAL: KomentarSeed[] = [
  {
    id: '1',
    user: SEED_DETAIL_SOP_CURRENT_USER.user,
    role: SEED_DETAIL_SOP_CURRENT_USER.role,
    timestamp: '2026-02-10 14:30',
    bagian: 'Metadata - Dasar Hukum',
    isi: 'Perlu ditambahkan referensi ke Permendikbud terbaru',
    status: 'open',
  },
]
