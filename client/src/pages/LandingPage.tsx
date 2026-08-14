import { DocumentIntegrity } from '@/pages/landing/document-integrity'
import { InstitutionalHero } from '@/pages/landing/institutional-hero'
import { PublicFooter } from '@/pages/landing/public-footer'
import { PublicHeader } from '@/pages/landing/public-header'
import { PublicUtilities } from '@/pages/landing/public-utilities'
import {
  RoleOverview,
  type PublicRoleProfile,
} from '@/pages/landing/role-overview'
import {
  WorkflowOverview,
  type WorkflowStage,
} from '@/pages/landing/workflow-overview'

const GOVERNMENT_NAME = 'Pemerintah Provinsi Sumatera Barat'
const OFFICE_NAME = 'Biro Organisasi'

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    step: '01',
    title: 'Penyusunan',
    description: 'Penyusun dan PJ Penyusun menyiapkan isi, pelaksana, kelengkapan, serta prosedur SOP AP.',
  },
  {
    step: '02',
    title: 'Pengajuan',
    description: 'PJ Penyusun mengirim paket SOP yang siap diperiksa oleh Biro Organisasi.',
  },
  {
    step: '03',
    title: 'Evaluasi',
    description: 'Evaluator menilai substansi dan memberi catatan perbaikan pada dokumen yang diajukan.',
  },
  {
    step: '04',
    title: 'Perbaikan',
    description: 'OPD menindaklanjuti catatan evaluator dan mengajukan kembali versi yang sudah diperbaiki.',
  },
  {
    step: '05',
    title: 'Berita Acara',
    description: 'Hasil evaluasi dirangkum dalam berita acara untuk ditandatangani pihak yang berwenang.',
  },
  {
    step: '06',
    title: 'Pengesahan',
    description: 'Kepala OPD mengesahkan dokumen setelah proses evaluasi dan berita acara selesai.',
  },
  {
    step: '07',
    title: 'Arsip',
    description: 'SOP yang berlaku tersimpan sebagai arsip digital dan dapat diakses sesuai hak aksesnya.',
  },
]

const ROLE_PROFILES: PublicRoleProfile[] = [
  {
    name: 'Penyusun',
    responsibility: 'Menyusun isi SOP, mengelola pelaksana dan peraturan, serta menindaklanjuti catatan evaluasi.',
    access: ['Draft SOP', 'Pelaksana', 'Peraturan', 'Riwayat perubahan'],
    output: 'Draft dan revisi SOP yang siap diajukan oleh PJ Penyusun.',
  },
  {
    name: 'PJ Penyusun',
    responsibility: 'Mengkoordinasikan pekerjaan penyusun pada OPD dan mengirim SOP ke proses evaluasi.',
    access: ['Seluruh SOP OPD', 'Pengajuan evaluasi', 'Berita acara', 'Riwayat pengajuan'],
    output: 'Paket pengajuan evaluasi dan tindak lanjut yang terkoordinasi.',
  },
  {
    name: 'Evaluator',
    responsibility: 'Memeriksa substansi SOP dan memberikan nilai serta catatan yang dapat ditindaklanjuti OPD.',
    access: ['Daftar evaluasi', 'Rubrik penilaian', 'Catatan per SOP', 'Riwayat evaluasi'],
    output: 'Hasil evaluasi yang terdokumentasi per SOP.',
  },
  {
    name: 'PJ Evaluator Organisasi',
    responsibility: 'Mengelola proses evaluasi lintas OPD, tim evaluator, data OPD, dan penyelesaian berita acara.',
    access: ['Pengajuan lintas OPD', 'Manajemen tim', 'Data OPD', 'Grafik evaluasi'],
    output: 'Evaluasi terkoordinasi dan berita acara yang siap diproses.',
  },
  {
    name: 'Kepala OPD',
    responsibility: 'Meninjau pengajuan OPD sendiri, mengesahkan SOP yang selesai dievaluasi, dan mengelola pencabutan SOP berlaku.',
    access: ['Pengajuan OPD', 'Detail SOP', 'Pengesahan', 'Arsip OPD'],
    output: 'SOP yang disahkan atau dicabut sesuai kewenangan Kepala OPD.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-foreground">
      <PublicHeader governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />

      <main>
        <InstitutionalHero
          governmentName={GOVERNMENT_NAME}
          officeName={OFFICE_NAME}
          previewStages={WORKFLOW_STAGES.slice(0, 4)}
        />

        <PublicUtilities archiveLabel="Arsip SOP" validationLabel="Validasi PDF" />

        <section className="border-y border-border bg-surface-subtle" aria-label="Identitas penyelenggara">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 md:grid-cols-[1.2fr_2fr] md:items-center lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{GOVERNMENT_NAME}</p>
              <p className="mt-1 text-sm font-medium text-foreground">Sekretariat Daerah · {OFFICE_NAME}</p>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-secondary-foreground md:justify-end">
              <span>Penyusunan SOP AP</span>
              <span>Evaluasi dokumen</span>
              <span>Pengesahan internal</span>
              <span>Arsip publik</span>
            </div>
          </div>
        </section>

        <WorkflowOverview stages={WORKFLOW_STAGES} />
        <RoleOverview roles={ROLE_PROFILES} />
        <DocumentIntegrity />
      </main>

      <PublicFooter governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />
    </div>
  )
}
