import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const loginPageSource = readSource('../login/LoginPage.tsx')
const loginHeroSource = readSource('../login/components/LoginHero.tsx')
const loginFormSource = readSource('../login/components/LoginForm.tsx')
const allSources = [loginPageSource, loginHeroSource, loginFormSource].join('\n')

describe('public auth design contract', () => {
  it('frames login as an enterprise institutional access surface', () => {
    expect(loginFormSource).toContain('Masuk ke SOPFlow')
    expect(loginFormSource).toContain('Akses internal')
    expect(loginFormSource).toContain('Gunakan akun')
    expect(loginHeroSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(loginHeroSource).toContain('Biro Organisasi')
    expect(loginHeroSource).toContain('Akses berbasis peran')
    expect(loginHeroSource).toContain('Evaluasi terdokumentasi')
    expect(loginHeroSource).toContain('Arsip SOP terpusat')
    expect(loginHeroSource).toContain('Alur pengelolaan')
  })

  it('uses a calm form card without changing login behavior', () => {
    expect(loginPageSource).toContain('LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login}')
    expect(loginPageSource).toContain('border border-border bg-surface p-6')
    expect(loginFormSource).toContain('await onSubmitLogin({ email, kataSandi: password })')
    expect(loginFormSource).toContain('Email wajib diisi')
    expect(loginFormSource).toContain('Kata sandi minimal 8 karakter')
    expect(loginFormSource).toContain('Tampilkan kata sandi')
    expect(loginFormSource).toContain('Sembunyikan kata sandi')
  })

  it('keeps form icons functional rather than decorative', () => {
    expect(loginFormSource).not.toMatch(/\bMail\b/)
    expect(loginFormSource).not.toMatch(/\bLock\b/)
    expect(loginFormSource).toMatch(/\bEye\b/)
    expect(loginFormSource).toMatch(/\bEyeOff\b/)
  })

  it('does not use overdecorated AI-template styling or inaccurate signing claims', () => {
    for (const banned of [
      'Futuristic Hero',
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
