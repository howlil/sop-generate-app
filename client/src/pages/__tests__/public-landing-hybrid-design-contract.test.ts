import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const landingSource = readSource('../LandingPage.tsx')
const headerSource = readSource('../landing/public-header.tsx')
const heroSource = readSource('../landing/identity-hero.tsx')
const productPreviewSource = readSource('../landing/landing-product-preview.tsx')
const gatewaySource = readSource('../landing/public-service-gateway.tsx')
const workflowSource = readSource('../landing/workflow-story.tsx')
const roleSource = readSource('../landing/role-workspace-showcase.tsx')
const rolePreviewSource = readSource('../landing/role-workspace-previews.tsx')
const traceabilitySource = readSource('../landing/document-traceability.tsx')
const closingSource = readSource('../landing/institutional-closing.tsx')

const allSources = [
  landingSource,
  headerSource,
  heroSource,
  productPreviewSource,
  gatewaySource,
  workflowSource,
  roleSource,
  rolePreviewSource,
  traceabilitySource,
  closingSource,
].join('\n')

describe('institutional SaaS public landing contract', () => {
  it('keeps official identity and complete SOP lifecycle', () => {
    expect(landingSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(landingSource).toContain('Biro Organisasi')

    for (const stage of [
      'Penyusunan',
      'Pengajuan',
      'Evaluasi',
      'Perbaikan',
      'Berita Acara',
      'Pengesahan',
      'Arsip',
    ]) {
      expect(landingSource).toContain(stage)
    }
  })

  it('uses a light product-first hero instead of a dark poster', () => {
    expect(heroSource).toContain('Kelola SOP dari draft hingga berlaku dalam satu alur kerja.')
    expect(heroSource).toContain('Sistem Pengelolaan SOP Berbasis Web')
    expect(heroSource).toContain('Masuk ke Sistem')
    expect(heroSource).toContain('Lihat Arsip SOP')
    expect(heroSource).toContain('Berbasis peran')
    expect(heroSource).toContain('Evaluasi terdokumentasi')
    expect(heroSource).toContain('Arsip dan validasi terpusat')
    expect(heroSource).toContain('LandingProductPreview')
    expect(heroSource).not.toContain('bg-slate-950 text-white')
    expect(heroSource).not.toContain('min-h-[720px] lg:grid-cols-[0.43fr_0.57fr]')
  })

  it('shows a realistic product preview and keeps the building image as an accent', () => {
    expect(productPreviewSource).toContain('Pengajuan Evaluasi')
    expect(productPreviewSource).toContain('Dinas Kesehatan Provinsi · 4 SOP')
    expect(productPreviewSource).toContain('Menunggu TTD PJ Evaluator')
    expect(productPreviewSource).toContain('Arsip dan validasi dokumen')
    expect(productPreviewSource).toContain('Kantor_Gubernur_Sumbar_belakang.jpg')
    expect(productPreviewSource).toContain('Identitas institusi')
  })

  it('keeps public navigation and service entry points clear', () => {
    expect(headerSource).toContain('Alur kerja')
    expect(headerSource).toContain('Peran')
    expect(headerSource).toContain('Arsip SOP')
    expect(headerSource).toContain('Validasi PDF')
    expect(gatewaySource).toContain('Arsip SOP')
    expect(gatewaySource).toContain('Validasi PDF')
  })

  it('keeps role, workflow, archive, and validation sections available', () => {
    expect(landingSource).toContain('Evaluasi & Perbaikan')
    expect(landingSource).toContain('Pengesahan & Arsip')
    expect(workflowSource).toContain('WorkflowPreview')
    expect(roleSource).toContain('Ruang kerja berbasis peran')
    expect(roleSource).toContain('Satu sistem. Lima konteks kerja.')
    expect(rolePreviewSource).toContain('Catatan evaluator')
    expect(rolePreviewSource).toContain('Pengesahan internal')
    expect(traceabilitySource).toContain('Satu dokumen. Satu riwayat yang dapat ditelusuri.')
    expect(closingSource).toContain('Dokumen SOP tidak berhenti di folder.')
  })

  it('keeps role interaction accessible and motion restrained', () => {
    expect(roleSource).toContain('role="tablist"')
    expect(roleSource).toContain('role="tab"')
    expect(roleSource).toContain('aria-selected')
    expect(roleSource).toContain('role="tabpanel"')
    expect(roleSource).toContain('motion-reduce:transition-none')
    expect(productPreviewSource).toContain('alt="Kantor Gubernur Sumatera Barat"')
    expect(closingSource).toContain('loading="lazy"')
  })

  it('does not regress to decorative AI-SaaS styling or inaccurate signing claims', () => {
    for (const banned of [
      'bg-gradient',
      'blur-3xl',
      'shadow-xl',
      'rounded-3xl',
      'TTE BSRE',
      'TTE BSrE',
      'Komdigi certified',
    ]) {
      expect(allSources).not.toContain(banned)
    }
  })
})
