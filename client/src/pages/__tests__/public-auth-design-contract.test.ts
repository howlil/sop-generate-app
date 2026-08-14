import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const loginPageSource = readSource('../login/LoginPage.tsx')
const loginHeroSource = readSource('../login/components/LoginHero.tsx')
const loginFormSource = readSource('../login/components/LoginForm.tsx')

describe('public auth design contract', () => {
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
