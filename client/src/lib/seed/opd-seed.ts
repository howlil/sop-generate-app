/**
 * Seed data OPD dan Kepala OPD.
 */
import type { OPD, KepalaOPD } from '@/lib/types/opd'

export const SEED_OPD_LIST: OPD[] = [
  { id: '1', name: 'Dinas Pendidikan', email: 'disdik@pemda.go.id', phone: '0812-3456-7890', totalSOP: 245, sopBerlaku: 220, sopDraft: 12, createdAt: '2024-01-15' },
  { id: '2', name: 'Dinas Kesehatan', email: 'dinkes@pemda.go.id', phone: '0812-9876-5432', totalSOP: 189, sopBerlaku: 170, sopDraft: 8, createdAt: '2024-01-15' },
  { id: '3', name: 'Dinas Perhubungan', email: 'dishub@pemda.go.id', phone: '0812-5555-6666', totalSOP: 156, sopBerlaku: 128, sopDraft: 15, createdAt: '2024-01-20' },
  { id: '4', name: 'Dinas Pekerjaan Umum', email: 'dispu@pemda.go.id', phone: '0813-7777-8888', totalSOP: 178, sopBerlaku: 158, sopDraft: 10, createdAt: '2024-01-18' },
  { id: '5', name: 'BAPPEDA', email: 'bappeda@pemda.go.id', phone: '0814-2222-3333', totalSOP: 98, sopBerlaku: 88, sopDraft: 5, createdAt: '2024-01-12' },
  { id: '6', name: 'Dinas Sosial', email: 'dinsos@pemda.go.id', phone: '0815-4444-5555', totalSOP: 134, sopBerlaku: 115, sopDraft: 9, createdAt: '2024-02-01' },
  // Dummy OPD tambahan untuk simulasi skala besar
  { id: '7', name: 'Dinas Komunikasi dan Informatika', email: 'diskominfo@pemda.go.id', phone: '0812-0000-0007', totalSOP: 120, sopBerlaku: 100, sopDraft: 6, createdAt: '2024-02-02' },
  { id: '8', name: 'Dinas Kependudukan dan Catatan Sipil', email: 'disdukcapil@pemda.go.id', phone: '0812-0000-0008', totalSOP: 110, sopBerlaku: 95, sopDraft: 5, createdAt: '2024-02-03' },
  { id: '9', name: 'Dinas Tenaga Kerja', email: 'disnaker@pemda.go.id', phone: '0812-0000-0009', totalSOP: 90, sopBerlaku: 80, sopDraft: 4, createdAt: '2024-02-04' },
  { id: '10', name: 'Dinas Perindustrian dan Perdagangan', email: 'disperindag@pemda.go.id', phone: '0812-0000-0010', totalSOP: 140, sopBerlaku: 120, sopDraft: 7, createdAt: '2024-02-05' },
  { id: '11', name: 'Dinas Pariwisata', email: 'dispar@pemda.go.id', phone: '0812-0000-0011', totalSOP: 85, sopBerlaku: 70, sopDraft: 6, createdAt: '2024-02-06' },
  { id: '12', name: 'Dinas Lingkungan Hidup', email: 'dlh@pemda.go.id', phone: '0812-0000-0012', totalSOP: 130, sopBerlaku: 115, sopDraft: 3, createdAt: '2024-02-07' },
  { id: '13', name: 'Dinas Perumahan dan Kawasan Permukiman', email: 'disperkim@pemda.go.id', phone: '0812-0000-0013', totalSOP: 95, sopBerlaku: 80, sopDraft: 5, createdAt: '2024-02-08' },
  { id: '14', name: 'Dinas Penanaman Modal', email: 'dpm@pemda.go.id', phone: '0812-0000-0014', totalSOP: 105, sopBerlaku: 90, sopDraft: 4, createdAt: '2024-02-09' },
  { id: '15', name: 'Dinas Pemuda dan Olahraga', email: 'dispora@pemda.go.id', phone: '0812-0000-0015', totalSOP: 75, sopBerlaku: 60, sopDraft: 3, createdAt: '2024-02-10' },
  { id: '16', name: 'Dinas Perpustakaan dan Kearsipan', email: 'dispusip@pemda.go.id', phone: '0812-0000-0016', totalSOP: 60, sopBerlaku: 50, sopDraft: 2, createdAt: '2024-02-11' },
  { id: '17', name: 'Dinas Ketahanan Pangan', email: 'dkp@pemda.go.id', phone: '0812-0000-0017', totalSOP: 88, sopBerlaku: 72, sopDraft: 4, createdAt: '2024-02-12' },
  { id: '18', name: 'Dinas Pertanian', email: 'diperta@pemda.go.id', phone: '0812-0000-0018', totalSOP: 150, sopBerlaku: 130, sopDraft: 8, createdAt: '2024-02-13' },
  { id: '19', name: 'Dinas Perikanan', email: 'disperikanan@pemda.go.id', phone: '0812-0000-0019', totalSOP: 70, sopBerlaku: 58, sopDraft: 4, createdAt: '2024-02-14' },
  { id: '20', name: 'Dinas Peternakan', email: 'disnakkeswan@pemda.go.id', phone: '0812-0000-0020', totalSOP: 65, sopBerlaku: 52, sopDraft: 3, createdAt: '2024-02-15' },
  { id: '21', name: 'Dinas Kehutanan', email: 'dishut@pemda.go.id', phone: '0812-0000-0021', totalSOP: 90, sopBerlaku: 78, sopDraft: 4, createdAt: '2024-02-16' },
  { id: '22', name: 'Dinas Energi dan Sumber Daya Mineral', email: 'esdm@pemda.go.id', phone: '0812-0000-0022', totalSOP: 110, sopBerlaku: 95, sopDraft: 5, createdAt: '2024-02-17' },
  { id: '23', name: 'Dinas Perhubungan Laut', email: 'dishublaut@pemda.go.id', phone: '0812-0000-0023', totalSOP: 80, sopBerlaku: 65, sopDraft: 3, createdAt: '2024-02-18' },
  { id: '24', name: 'Dinas Perhubungan Udara', email: 'dishubudara@pemda.go.id', phone: '0812-0000-0024', totalSOP: 82, sopBerlaku: 68, sopDraft: 3, createdAt: '2024-02-19' },
  { id: '25', name: 'Dinas Perhubungan Darat', email: 'dishubdarat@pemda.go.id', phone: '0812-0000-0025', totalSOP: 100, sopBerlaku: 85, sopDraft: 5, createdAt: '2024-02-20' },
  { id: '26', name: 'Dinas Tata Ruang', email: 'distaru@pemda.go.id', phone: '0812-0000-0026', totalSOP: 92, sopBerlaku: 78, sopDraft: 4, createdAt: '2024-02-21' },
  { id: '27', name: 'Dinas Kebudayaan', email: 'disbud@pemda.go.id', phone: '0812-0000-0027', totalSOP: 73, sopBerlaku: 61, sopDraft: 3, createdAt: '2024-02-22' },
  { id: '28', name: 'Dinas Koperasi dan UMKM', email: 'diskopukm@pemda.go.id', phone: '0812-0000-0028', totalSOP: 115, sopBerlaku: 98, sopDraft: 6, createdAt: '2024-02-23' },
  { id: '29', name: 'Dinas Perdagangan Dalam Negeri', email: 'disdagri@pemda.go.id', phone: '0812-0000-0029', totalSOP: 86, sopBerlaku: 72, sopDraft: 4, createdAt: '2024-02-24' },
  { id: '30', name: 'Dinas Perdagangan Luar Negeri', email: 'disdaglu@pemda.go.id', phone: '0812-0000-0030', totalSOP: 77, sopBerlaku: 63, sopDraft: 3, createdAt: '2024-02-25' },
  { id: '31', name: 'Dinas Pemberdayaan Perempuan dan Perlindungan Anak', email: 'dp3a@pemda.go.id', phone: '0812-0000-0031', totalSOP: 94, sopBerlaku: 80, sopDraft: 5, createdAt: '2024-02-26' },
  { id: '32', name: 'Dinas Sosial Pemberdayaan Masyarakat', email: 'dinsospm@pemda.go.id', phone: '0812-0000-0032', totalSOP: 101, sopBerlaku: 87, sopDraft: 5, createdAt: '2024-02-27' },
  { id: '33', name: 'Dinas Penanggulangan Bencana', email: 'bpbd@pemda.go.id', phone: '0812-0000-0033', totalSOP: 66, sopBerlaku: 54, sopDraft: 3, createdAt: '2024-02-28' },
  { id: '34', name: 'Dinas Satpol PP', email: 'satpolpp@pemda.go.id', phone: '0812-0000-0034', totalSOP: 72, sopBerlaku: 60, sopDraft: 3, createdAt: '2024-03-01' },
  { id: '35', name: 'Dinas Perizinan Terpadu', email: 'dpmptsp@pemda.go.id', phone: '0812-0000-0035', totalSOP: 145, sopBerlaku: 125, sopDraft: 7, createdAt: '2024-03-02' },
  { id: '36', name: 'Inspektorat Daerah', email: 'inspektorat@pemda.go.id', phone: '0812-0000-0036', totalSOP: 58, sopBerlaku: 48, sopDraft: 2, createdAt: '2024-03-03' },
  { id: '37', name: 'Sekretariat Daerah', email: 'setda@pemda.go.id', phone: '0812-0000-0037', totalSOP: 160, sopBerlaku: 140, sopDraft: 10, createdAt: '2024-03-04' },
  { id: '38', name: 'Sekretariat DPRD', email: 'setdprd@pemda.go.id', phone: '0812-0000-0038', totalSOP: 82, sopBerlaku: 70, sopDraft: 4, createdAt: '2024-03-05' },
  { id: '39', name: 'Badan Kepegawaian Daerah', email: 'bkd@pemda.go.id', phone: '0812-0000-0039', totalSOP: 120, sopBerlaku: 104, sopDraft: 6, createdAt: '2024-03-06' },
  { id: '40', name: 'Badan Keuangan Daerah', email: 'bkad@pemda.go.id', phone: '0812-0000-0040', totalSOP: 135, sopBerlaku: 118, sopDraft: 7, createdAt: '2024-03-07' },
  { id: '41', name: 'Badan Perencanaan Pembangunan', email: 'bappeda2@pemda.go.id', phone: '0812-0000-0041', totalSOP: 99, sopBerlaku: 84, sopDraft: 5, createdAt: '2024-03-08' },
  { id: '42', name: 'Badan Pengelola Aset Daerah', email: 'bpad@pemda.go.id', phone: '0812-0000-0042', totalSOP: 88, sopBerlaku: 74, sopDraft: 4, createdAt: '2024-03-09' },
  { id: '43', name: 'Badan Penelitian dan Pengembangan', email: 'balitbang@pemda.go.id', phone: '0812-0000-0043', totalSOP: 61, sopBerlaku: 50, sopDraft: 3, createdAt: '2024-03-10' },
  { id: '44', name: 'Badan Kesatuan Bangsa dan Politik', email: 'kesbangpol@pemda.go.id', phone: '0812-0000-0044', totalSOP: 79, sopBerlaku: 66, sopDraft: 4, createdAt: '2024-03-11' },
  { id: '45', name: 'Badan Penghubung Daerah', email: 'bpd@pemda.go.id', phone: '0812-0000-0045', totalSOP: 52, sopBerlaku: 43, sopDraft: 2, createdAt: '2024-03-12' },
  { id: '46', name: 'UPT Pelayanan Terpadu', email: 'uptpelayanan@pemda.go.id', phone: '0812-0000-0046', totalSOP: 70, sopBerlaku: 59, sopDraft: 3, createdAt: '2024-03-13' },
  { id: '47', name: 'UPT Laboratorium Kesehatan', email: 'labkes@pemda.go.id', phone: '0812-0000-0047', totalSOP: 64, sopBerlaku: 53, sopDraft: 3, createdAt: '2024-03-14' },
  { id: '48', name: 'UPT Puskesmas Kota', email: 'puskesmaskota@pemda.go.id', phone: '0812-0000-0048', totalSOP: 58, sopBerlaku: 49, sopDraft: 2, createdAt: '2024-03-15' },
  { id: '49', name: 'UPT Puskesmas Pinggiran', email: 'puskesmaspinggiran@pemda.go.id', phone: '0812-0000-0049', totalSOP: 54, sopBerlaku: 45, sopDraft: 2, createdAt: '2024-03-16' },
  { id: '50', name: 'UPT Pendidikan Wilayah I', email: 'uptdik1@pemda.go.id', phone: '0812-0000-0050', totalSOP: 76, sopBerlaku: 64, sopDraft: 4, createdAt: '2024-03-17' },
  { id: '51', name: 'UPT Pendidikan Wilayah II', email: 'uptdik2@pemda.go.id', phone: '0812-0000-0051', totalSOP: 74, sopBerlaku: 62, sopDraft: 4, createdAt: '2024-03-18' },
  { id: '52', name: 'UPT Pendidikan Wilayah III', email: 'uptdik3@pemda.go.id', phone: '0812-0000-0052', totalSOP: 72, sopBerlaku: 60, sopDraft: 4, createdAt: '2024-03-19' },
]

// Satu Kepala OPD per OPD (52 data dummy), otomatis dari SEED_OPD_LIST
export const SEED_KEPALA_LIST: KepalaOPD[] = SEED_OPD_LIST.map((opd, index) => {
  const n = index + 1
  const nipSeq = n.toString().padStart(3, '0')
  // Nama dummy unik per OPD, format "Dr. Kepala 01", "Dr. Kepala 02", dst.
  const personName = `Dr. Kepala ${nipSeq}`
  return {
    id: `k${n}`,
    opdId: opd.id,
    name: personName,
    nip: `1970${nipSeq}1998031001`,
    email: `${personName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\./, '')
      .replace(/\.$/, '')}@pemda.go.id`,
    phone: `0812-1000-${nipSeq}`,
    isActive: true,
    totalSOP: opd.totalSOP,
  }
})
