/**
 * Seed data untuk Detail SOP (Tim Penyusun): metadata, prosedur, implementers, versi, komentar.
 */

import type { ProsedurRow, SOPDetailMetadata, DetailSOPViewMetadata } from '@/lib/types/sop'
import type { KomentarItem } from '@/lib/types/komentar'
import type { VersionSeed, DetailSOPVersionSeed } from '@/lib/types/version'

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

/** Helper: buat objek pelaksana dengan satu impl aktif (impl-1..impl-3). */
function pel(active: 'impl-1' | 'impl-2' | 'impl-3'): Record<string, string> {
  return { 'impl-1': active === 'impl-1' ? '√' : '', 'impl-2': active === 'impl-2' ? '√' : '', 'impl-3': active === 'impl-3' ? '√' : '' }
}

/** Data dummy: 14 kegiatan, 3 decision, 3 pelaksana. */
export const SEED_SOP_DETAIL_PROSEDUR_ROWS: ProsedurRow[] = [
  { id: '1', no: 1, kegiatan: 'Pemohon mengisi formulir pengajuan', pelaksana: pel('impl-1'), mutu_kelengkapan: 'Formulir terisi lengkap', mutu_waktu: '5 Menit', output: 'Draft pengajuan', keterangan: '' },
  { id: '2', no: 2, kegiatan: 'Pemohon mengunggah dokumen pendukung', pelaksana: pel('impl-1'), mutu_kelengkapan: 'Dokumen wajib terunggah', mutu_waktu: '10 Menit', output: 'Dokumen terunggah', keterangan: '' },
  { id: '3', no: 3, type: 'decision', kegiatan: 'Berkas lengkap?', pelaksana: pel('impl-2'), mutu_kelengkapan: '-', mutu_waktu: '-', output: '-', keterangan: 'Tidak: perbaiki di langkah 2.', id_next_step_if_yes: '4', id_next_step_if_no: '2' },
  { id: '4', no: 4, kegiatan: 'Admin verifikasi kelengkapan berkas', pelaksana: pel('impl-2'), mutu_kelengkapan: 'Berkas diverifikasi', mutu_waktu: '1 Hari', output: 'Hasil verifikasi', keterangan: '' },
  { id: '5', no: 5, type: 'decision', kegiatan: 'Verifikasi lolos?', pelaksana: pel('impl-2'), mutu_kelengkapan: '-', mutu_waktu: '-', output: '-', keterangan: 'Tidak: perbaiki berkas.', id_next_step_if_yes: '6', id_next_step_if_no: '4' },
  { id: '6', no: 6, kegiatan: 'Admin input data ke sistem', pelaksana: pel('impl-2'), mutu_kelengkapan: 'Data terekam di sistem', mutu_waktu: '20 Menit', output: 'Data pengajuan di sistem', keterangan: '' },
  { id: '7', no: 7, kegiatan: 'Pejabat berwenang review dokumen', pelaksana: pel('impl-3'), mutu_kelengkapan: 'Dokumen direview', mutu_waktu: '2 Hari', output: 'Catatan review', keterangan: '' },
  { id: '8', no: 8, type: 'decision', kegiatan: 'Disetujui?', pelaksana: pel('impl-3'), mutu_kelengkapan: '-', mutu_waktu: '-', output: '-', keterangan: 'Tidak: notifikasi penolakan.', id_next_step_if_yes: '9', id_next_step_if_no: '13' },
  { id: '9', no: 9, kegiatan: 'Pejabat berwenang menandatangani', pelaksana: pel('impl-3'), mutu_kelengkapan: 'Dokumen siap ditandatangani', mutu_waktu: '1 Hari', output: 'Dokumen sah', keterangan: '' },
  { id: '10', no: 10, kegiatan: 'Admin arsipkan dokumen', pelaksana: pel('impl-2'), mutu_kelengkapan: 'Arsip lengkap', mutu_waktu: '1 Hari', output: 'Berkas tertutup', keterangan: '' },
  { id: '11', no: 11, kegiatan: 'Admin kirim notifikasi ke pemohon', pelaksana: pel('impl-2'), mutu_kelengkapan: 'Notifikasi terkirim', mutu_waktu: '30 Menit', output: 'Pemohon dapat notifikasi', keterangan: '' },
  { id: '12', no: 12, kegiatan: 'Pemohon menerima notifikasi hasil', pelaksana: pel('impl-1'), mutu_kelengkapan: 'Notifikasi dibaca', mutu_waktu: '-', output: 'Pemohon dapat hasil', keterangan: '' },
  { id: '13', no: 13, kegiatan: 'Pemohon konfirmasi penerimaan', pelaksana: pel('impl-1'), mutu_kelengkapan: 'Konfirmasi tercatat', mutu_waktu: '5 Hari', output: 'Berkas ditutup', keterangan: '' },
  { id: '14', no: 14, kegiatan: 'Notifikasi dan penutupan berkas', pelaksana: pel('impl-3'), mutu_kelengkapan: 'Notifikasi terkirim / penolakan tercatat', mutu_waktu: '1 Hari', output: 'Proses selesai', keterangan: 'Dari jalur disetujui (13) atau penolakan (8 Tidak).' },
]

export const SEED_IMPLEMENTERS: { id: string; name: string }[] = [
  { id: 'impl-1', name: 'Pemohon' },
  { id: 'impl-2', name: 'Admin' },
  { id: 'impl-3', name: 'Pejabat Berwenang' },
]

export const SEED_KOMENTAR_LIST: KomentarItem[] = [
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

/** Opsi POS terkait untuk DetailSOPMetadataPanel. */
export const SEED_RELATED_POS_OPTIONS: string[] = [
  'POS Penerimaan Siswa Baru',
  'POS Ujian Sekolah',
  'POS Mutasi Siswa',
  'POS Pengadaan Barang/Jasa',
  'POS Pengaduan Masyarakat',
]

/** User saat ini (Kepala OPD) untuk komentar baru di halaman Detail SOP. */
export const SEED_DETAIL_SOP_CURRENT_USER = {
  user: 'Dr. Ahmad Fauzi',
  role: 'Kepala OPD',
} as const

/** Komentar awal untuk halaman Detail SOP (Kepala OPD). */
export const SEED_DETAIL_SOP_KOMENTAR_INITIAL: KomentarItem[] = [
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
