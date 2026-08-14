import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const landingSource = readSource('../LandingPage.tsx')
const loginPageSource = readSource('../login/LoginPage.tsx')
const loginHeroSource = readSource('../login/components/LoginHero.tsx')
const loginFormSource = readSource('../login/components/LoginForm.tsx')

describe('public and auth design contract', () => {
  it('keeps the public landing focused on institutional identity, public utilities, and the real SOP lifecycle', () => {
    expect(landingSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(landingSource).toContain('Biro Organisasi')
    expect(landingSource).toContain('Arsip SOP')
    expect(landingSource).toContain('Validasi PDF')

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

  it('does not regress the landing page to generic decorative SaaS patterns or inaccurate signing claims', () => {
    expect(landingSource).not.toContain('bg-gradient')
    expect(landingSource).not.toContain('blur-3xl')
    expect(landingSource).not.toContain('shadow-xl')
    expect(landingSource).not.toContain('rounded-3xl')
    expect(landingSource).not.toContain('TTE BSRE')
    expect(landingSource).not.toContain('TTE BSrE')
  })

  it('frames login as an institutional access surface instead of a futuristic marketing hero', () => {
    expect(loginFormSource).toContain('Masuk ke sistem')
    expect(loginHeroSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(loginHeroSource).toContain('Biro Organisasi')
    expect(loginHeroSource).toContain('Alur pengelolaan')

    expect(loginPageSource).not.toContain('Futuristic Hero')
    expect(loginPageSource).not.toContain('bg-gradient')
    expect(loginPageSource).not.toContain('blur-3xl')
    expect(loginHeroSource).not.toContain('bg-gradient')
    expect(loginHeroSource).not.toContain('blur-3xl')
    expect(loginHeroSource).not.toContain('TTE BSRE')
    expect(loginHeroSource).not.toContain('TTE BSrE')
  })

  it('keeps form icons functional rather than decorative', () => {
    expect(loginFormSource).not.toMatch(/\bMail\b/)
    expect(loginFormSource).not.toMatch(/\bLock\b/)
    expect(loginFormSource).toMatch(/\bEye\b/)
    expect(loginFormSource).toMatch(/\bEyeOff\b/)
  })
})
