import { DocumentTraceability } from '@/pages/landing/document-traceability'
import { IdentityHero } from '@/pages/landing/identity-hero'
import { InstitutionalClosing } from '@/pages/landing/institutional-closing'
import { PublicFooter } from '@/pages/landing/public-footer'
import { PublicHeader } from '@/pages/landing/public-header'
import { PublicServiceGateway } from '@/pages/landing/public-service-gateway'
import {
  RoleWorkspaceShowcase,
  type LandingRoleProfile,
} from '@/pages/landing/role-workspace-showcase'
import {
  WorkflowStory,
  type WorkflowChapter,
} from '@/pages/landing/workflow-story'

const GOVERNMENT_NAME = 'Pemerintah Provinsi Sumatera Barat'
const OFFICE_NAME = 'Biro Organisasi'

const WORKFLOW_STAGES = [
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
] as const

const WORKFLOW_CHAPTERS: WorkflowChapter[] = [
  {
    number: '01',
    title: 'Penyusunan',
    description: 'OPD menyusun identitas, pelaksana, prosedur, peraturan, dan kelengkapan SOP dalam struktur yang konsisten.',
    preview: 'authoring',
  },
  {
    number: '02',
    title: 'Evaluasi & Perbaikan',
    description: 'Evaluator memberi penilaian dan catatan yang dapat ditindaklanjuti; OPD memperbaiki dokumen tanpa kehilangan konteks revisi.',
    preview: 'evaluation',
  },
  {
    number: '03',
    title: 'Pengesahan & Arsip',
    description: 'Setelah evaluasi dan berita acara selesai, pengesahan internal menutup proses sebelum SOP tersedia sebagai arsip yang berlaku.',
    preview: 'approval',
  },
]

const ROLE_PROFILES: LandingRoleProfile[] = [
  {
    id: 'penyusun',
    label: 'Penyusun',
    responsibility: 'Menyusun isi SOP, mengelola pelaksana dan peraturan, serta menindaklanjuti catatan evaluasi pada dokumen yang sama.',
    output: 'Draft dan revisi SOP yang siap dikoordinasikan oleh PJ Penyusun.',
  },
  {
    id: 'pj-penyusun',
    label: 'PJ Penyusun',
    responsibility: 'Mengkoordinasikan SOP pada OPD dan memastikan dokumen yang siap dapat masuk ke proses pengajuan evaluasi.',
    output: 'Paket pengajuan evaluasi dan tindak lanjut revisi yang terkoordinasi.',
  },
  {
    id: 'evaluator',
    label: 'Evaluator',
    responsibility: 'Memeriksa substansi SOP, memberikan penilaian, dan menulis catatan yang dapat ditindaklanjuti oleh OPD.',
    output: 'Hasil evaluasi dan catatan perbaikan yang terdokumentasi per SOP.',
  },
  {
    id: 'pj-evaluator',
    label: 'PJ Evaluator Organisasi',
    responsibility: 'Mengelola proses evaluasi lintas OPD, koordinasi tim evaluator, dan penyelesaian berita acara hasil evaluasi.',
    output: 'Evaluasi lintas OPD yang terkoordinasi dan berita acara yang siap diproses.',
  },
  {
    id: 'kepala-opd',
    label: 'Kepala OPD',
    responsibility: 'Meninjau SOP OPD yang telah menyelesaikan evaluasi dan berita acara sebelum melakukan pengesahan internal.',
    output: 'SOP yang selesai disahkan dan bergerak menuju arsip berlaku sesuai kewenangan.',
  },
]

export function LandingPage() {
  const compactStages = WORKFLOW_STAGES.map(({ step, title }) => ({ step, title }))

  return (
    <div className="min-h-screen bg-surface text-foreground">
      <PublicHeader governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />

      <main>
        <IdentityHero governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} stages={compactStages} />
        <PublicServiceGateway />
        <WorkflowStory stages={compactStages} chapters={WORKFLOW_CHAPTERS} />
        <RoleWorkspaceShowcase roles={ROLE_PROFILES} />
        <DocumentTraceability />
        <InstitutionalClosing governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />
      </main>

      <PublicFooter governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />
    </div>
  )
}
