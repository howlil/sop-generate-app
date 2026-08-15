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
  it('uses a true balanced split instead of an asymmetric marketing layout', () => {
    expect(loginPageSource).toContain('lg:grid-cols-2')
    expect(loginPageSource).not.toContain('lg:grid-cols-[1.08fr_0.92fr]')
    expect(loginPageSource).toContain('LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login}')
  })

  it('keeps the left panel visual-first and low-copy', () => {
    expect(loginHeroSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(loginHeroSource).toContain('Biro Organisasi')
    expect(loginHeroSource).toContain('Pengelolaan SOP AP dalam satu alur kerja.')
    expect(loginHeroSource).toContain('Akses internal')
    expect(loginHeroSource).not.toContain('trustBullets')
    expect(loginHeroSource).not.toContain('lifecycle')
    expect(loginHeroSource).not.toContain('Akses berbasis peran')
    expect(loginHeroSource).not.toContain('Evaluasi terdokumentasi')
    expect(loginHeroSource).not.toContain('Arsip SOP terpusat')
    expect(loginHeroSource).not.toContain('Alur pengelolaan')
  })

  it('keeps the form focused and preserves login behavior', () => {
    expect(loginFormSource).toContain('Masuk')
    expect(loginFormSource).toContain('Gunakan akun yang telah didaftarkan administrator.')
    expect(loginFormSource).toContain('Butuh bantuan? Hubungi administrator instansi.')
    expect(loginFormSource).not.toContain('Masuk ke SOPFlow')
    expect(loginFormSource).not.toContain('Akses dan menu akan mengikuti peran pengguna')
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
