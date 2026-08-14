import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const landingSource = readSource('../LandingPage.tsx')
const heroSource = readSource('../landing/identity-hero.tsx')
const gatewaySource = readSource('../landing/public-service-gateway.tsx')
const workflowSource = readSource('../landing/workflow-story.tsx')
const roleSource = readSource('../landing/role-workspace-showcase.tsx')
const traceabilitySource = readSource('../landing/document-traceability.tsx')
const closingSource = readSource('../landing/institutional-closing.tsx')

const allSources = [
  landingSource,
  heroSource,
  gatewaySource,
  workflowSource,
  roleSource,
  traceabilitySource,
  closingSource,
].join('\n')

describe('hybrid identity-first public landing contract', () => {
  it('keeps the official identity and complete SOP lifecycle', () => {
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

  it('uses the approved identity-first composition', () => {
    expect(heroSource).toContain('Kantor_Gubernur_Sumbar_belakang.jpg')
    expect(heroSource).toContain('Pengelolaan SOP AP, dari penyusunan hingga berlaku.')
    expect(heroSource).toContain('bg-slate-950')
    expect(heroSource).not.toContain('opacity-30')
    expect(gatewaySource).toContain('Arsip SOP')
    expect(gatewaySource).toContain('Validasi PDF')
    expect(workflowSource).toContain('Evaluasi & Perbaikan')
    expect(workflowSource).toContain('Pengesahan & Arsip')
    expect(roleSource).toContain('Satu sistem. Lima konteks kerja.')
    expect(traceabilitySource).toContain('Satu dokumen. Satu riwayat yang dapat ditelusuri.')
    expect(closingSource).toContain('Dokumen SOP tidak berhenti di folder.')
  })

  it('keeps role interaction accessible and motion restrained', () => {
    expect(roleSource).toContain('role="tablist"')
    expect(roleSource).toContain('role="tab"')
    expect(roleSource).toContain('aria-selected')
    expect(roleSource).toContain('role="tabpanel"')
    expect(roleSource).toContain('motion-reduce:transition-none')
    expect(heroSource).toContain('alt="Kantor Gubernur Sumatera Barat"')
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
